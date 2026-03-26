import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  TrendingUp,
  Target,
  BarChart3,
  HelpCircle,
  Sparkles,
  Video,
} from "lucide-react";

interface QuickActionsProps {
  onActionClick: (action: string, prompt: string) => void;
  onVideoRequest?: () => void;
  disabled?: boolean;
}

export default function QuickActions({
  onActionClick,
  onVideoRequest,
  disabled,
}: QuickActionsProps) {
  const actions = [
    {
      id: "analyze_last",
      label: "Analyze Last Test",
      icon: BarChart3,
      prompt:
        "Can you analyze my most recent test and tell me what I did well and where I need to improve?",
    },
    {
      id: "study_tips",
      label: "Study Plan",
      icon: Lightbulb,
      prompt:
        "What should I study next based on my performance? Give me a prioritized study plan.",
    },
    {
      id: "weak_subjects",
      label: "Weak Subjects",
      icon: Target,
      prompt:
        "I want to improve in my weakest subjects. What specific topics should I focus on?",
    },
    {
      id: "compare_performance",
      label: "Track Progress",
      icon: TrendingUp,
      prompt:
        "How has my performance changed over time? Am I improving or declining?",
    },
    {
      id: "explain_mistakes",
      label: "Common Mistakes",
      icon: HelpCircle,
      prompt:
        "Can you help me understand the types of mistakes I'm making in my tests?",
    },
    {
      id: "motivation",
      label: "Get Motivated",
      icon: Sparkles,
      prompt:
        "I need some motivation and study strategies to improve my scores.",
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="justify-start gap-2 h-auto py-2.5 text-left hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
            onClick={() => onActionClick(action.id, action.prompt)}
            disabled={disabled}
          >
            <action.icon className="w-4 h-4 shrink-0" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}

        {/* Study Videos Button */}
        {onVideoRequest && (
          <>
            <div className="border-t border-border my-2" />
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-2.5 text-left hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors bg-red-50/50"
              onClick={onVideoRequest}
              disabled={disabled}
            >
              <Video className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold">📺 Study Videos</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
