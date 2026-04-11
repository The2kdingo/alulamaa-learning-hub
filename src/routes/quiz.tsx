import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Award, Plus } from "lucide-react";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quizzes — AlUlamaa Academy" },
      { name: "description", content: "Test your Islamic knowledge with interactive quizzes." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Quizzes</h1>
            <p className="text-muted-foreground mt-1">Test and strengthen your knowledge</p>
          </div>
          <Button variant="hero">
            <Plus size={18} /> Create Quiz
          </Button>
        </div>

        <div className="glass rounded-2xl p-12 text-center">
          <Award size={48} className="text-primary mx-auto mb-4" />
          <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            AI-powered quizzes with leaderboards are being prepared. In the meantime, focus on your studies!
          </p>
        </div>
      </div>
    </div>
  );
}
