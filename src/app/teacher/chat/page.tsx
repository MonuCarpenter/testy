"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import TeacherQuickActions from "@/components/teacher-chat/TeacherQuickActions";
import ClassOverview from "@/components/teacher-chat/ClassOverview";
import { Trash2, AlertCircle, GraduationCap } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface TeacherContext {
  totalTests: number;
  totalStudents: number;
  averageScore: number;
  passRate: number;
  studentsNeedingHelp: number;
  performanceBrackets: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

export default function TeacherChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<TeacherContext | null>(null);
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

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello Professor! I'm your AI teaching assistant. I've analyzed your class performance and I'm here to help you improve student outcomes. You can ask me about class performance, struggling students, test analysis, or teaching strategies. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
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
      const response = await fetch("/api/teacher/chat", {
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

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat cleared! How can I help you improve your teaching and student outcomes?",
        timestamp: new Date(),
      },
    ]);
    chatHistoryRef.current = [];
    setError(null);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4">
      {/* Sidebar */}
      <aside className="w-80 bg-white rounded-lg shadow-sm border border-border p-4 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2 mb-2">
            <GraduationCap className="w-6 h-6" />
            AI Teaching Assistant
          </h2>
          <p className="text-xs text-muted-foreground">
            Powered by Gemini 2.5 Flash
          </p>
        </div>

        {context && <ClassOverview {...context} />}

        <TeacherQuickActions
          onActionClick={handleQuickAction}
          disabled={isLoading}
        />
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        {/* Chat Header */}
        <div className="border-b border-border p-4 flex items-center justify-between bg-blue-50">
          <div>
            <h3 className="font-semibold text-blue-800">Teaching Assistant</h3>
            <p className="text-xs text-blue-600">
              Get insights to improve student performance
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

          {isLoading && (
            <div className="flex gap-3 p-4 rounded-lg bg-blue-50 mr-8">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-sm">AI Assistant</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyzing your data...
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
