import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, Star, ChevronRight } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  lessons: number;
  duration: string;
  level: string;
  icon: string;
}

export function CourseCard({ title, description, lessons, duration, level, icon }: CourseCardProps) {
  return (
    <Link to="/courses" className="block">
      <div className="group glass rounded-2xl p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-border/30 hover:border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-2xl shrink-0 shadow-md">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen size={12} /> {lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {duration}
          </span>
          <span className="flex items-center gap-1">
            <Star size={12} /> {level}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden mr-4">
            <div className="h-full w-0 rounded-full bg-primary transition-all duration-500 group-hover:w-[10%]" />
          </div>
          <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}
