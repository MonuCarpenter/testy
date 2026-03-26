"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import QuickActions from "@/components/chat/QuickActions";
import PerformanceSummary from "@/components/chat/PerformanceSummary";
import StudyVideosDisplay from "@/components/chat/StudyVideosDisplay";
import { Trash2, AlertCircle, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface StudentContext {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  strongestSubject: string | null;
  weakestSubject: string | null;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface VideosData {
  subject: string;
  avgScore: number;
  suggestion: string;
  videos: YouTubeVideo[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<StudentContext | null>(null);
  const [videosData, setVideosData] = useState<VideosData | null>(null);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<
    Array<{ role: "user" | "model"; parts: string }>
  >([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message and auto-load performance data
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your AI study assistant. I'm here to help you improve your test performance. You can ask me about your scores, get study tips, or use the quick actions on the left. How can I help you today?",
        timestamp: new Date(),
      },
    ]);

    // Silently load performance context without displaying in chat
    const loadPerformanceData = async () => {
      const analyzePrompt =
        "Can you analyze my most recent test and tell me what I did well and where I need to improve?";

      try {
        const response = await fetch("/api/student/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: analyzePrompt,
            chatHistory: [],
          }),
        });

        const data = await response.json();

        if (response.ok && data.context) {
          // Only update context, don't display the response
          setContext(data.context);

          // Update chat history for future context
          chatHistoryRef.current.push(
            { role: "user", parts: analyzePrompt },
            { role: "model", parts: data.response }
          );
        }
      } catch (err: any) {
        console.error("Failed to load performance data:", err);
        // Silently fail, user can still interact normally
      }
    };

    loadPerformanceData();
  }, []);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    setError(null);
    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/student/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          chatHistory: chatHistoryRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Update chat history for context
      chatHistoryRef.current.push(
        { role: "user", parts: messageText },
        { role: "model", parts: data.response }
      );

      // Update context if provided
      if (data.context) {
        setContext(data.context);
      }

      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionId: string, prompt: string) => {
    sendMessage(prompt);
  };

  const handleVideoRequest = async () => {
    if (!context?.weakestSubject) {
      setError("No weak subject identified yet. Complete some tests first!");
      return;
    }

    setIsLoadingVideos(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/student/study-videos?subject=${encodeURIComponent(
          context.weakestSubject
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch study videos");
      }

      setVideosData(data);
      scrollToBottom();
    } catch (err: any) {
      console.error("Videos error:", err);
      setError(err.message || "Failed to load study videos. Please try again.");
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat cleared! How can I help you improve your test performance?",
        timestamp: new Date(),
      },
    ]);
    chatHistoryRef.current = [];
    setError(null);
    setVideosData(null);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* Sidebar */}
      <aside className="w-80 bg-white rounded-lg shadow-sm border border-border p-4 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold text-green-700 flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            AI Study Assistant
          </h2>
          <p className="text-xs text-muted-foreground">
            Powered by Gemini 2.5 Flash
          </p>
        </div>

        {context && <PerformanceSummary {...context} />}

        <QuickActions
          onActionClick={handleQuickAction}
          onVideoRequest={handleVideoRequest}
          disabled={isLoading || isLoadingVideos}
        />
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        {/* Chat Header */}
        <div className="border-b border-border p-4 flex items-center justify-between bg-green-50">
          <div>
            <h3 className="font-semibold text-green-800">Chat with AI</h3>
            <p className="text-xs text-green-600">
              Ask me anything about your test performance
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={isLoading}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))}

          {/* Study Videos Display */}
          {videosData && (
            <StudyVideosDisplay
              {...videosData}
              onClose={() => setVideosData(null)}
            />
          )}

          {isLoadingVideos && (
            <div className="flex gap-3 p-4 rounded-lg bg-red-50 mr-8">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-sm">Loading Videos</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Finding the best study videos for you...
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3 p-4 rounded-lg bg-green-50 mr-8">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-sm">AI Assistant</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Thinking...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
