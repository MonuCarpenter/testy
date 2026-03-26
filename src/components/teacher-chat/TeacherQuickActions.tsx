import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  BookOpen,
} from "lucide-react";

interface TeacherQuickActionsProps {
  onActionClick: (action: string, prompt: string) => void;
  disabled?: boolean;
}

export default function TeacherQuickActions({
  onActionClick,
  disabled,
}: TeacherQuickActionsProps) {
  const actions = [
    {
      id: "class_report",
      label: "Class Performance Report",
      icon: BarChart3,
      prompt:
        "Generate a comprehensive class performance report with key insights and recommendations.",
    },
    {
      id: "struggling_students",
      label: "Who Needs Help?",
      icon: AlertTriangle,
      prompt:
        "Identify students who are struggling and need immediate intervention. Provide specific recommendations for each.",
    },
    {
      id: "test_analysis",
      label: "Analyze Recent Tests",
      icon: FileCheck,
      prompt:
        "Analyze my recent tests and tell me which questions were most difficult, completion rates, and areas where students struggled.",
    },
    {
      id: "teaching_strategies",
      label: "Teaching Strategies",
      icon: Lightbulb,
      prompt:
        "Based on my class performance, what teaching strategies should I implement to improve student outcomes?",
    },
    {
      id: "compare_performance",
      label: "Track Class Progress",
      icon: TrendingUp,
      prompt:
        "How has my class performance changed over time? Are students improving or declining? What trends do you notice?",
    },
    {
      id: "subject_gaps",
      label: "Identify Knowledge Gaps",
      icon: Target,
      prompt:
        "What are the biggest knowledge gaps in my class? Which subjects or topics need more focus?",
    },
    {
      id: "top_performers",
      label: "Top Performers",
      icon: Users,
      prompt:
        "Who are my top-performing students? What can I learn from their success to help others?",
    },
    {
      id: "curriculum_planning",
      label: "Curriculum Planning",
      icon: BookOpen,
      prompt:
        "Help me plan my curriculum for the next few weeks based on student performance data and knowledge gaps.",
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
            className="justify-start gap-2 h-auto py-2.5 text-left hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
            onClick={() => onActionClick(action.id, action.prompt)}
            disabled={disabled}
          >
            <action.icon className="w-4 h-4 shrink-0" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
