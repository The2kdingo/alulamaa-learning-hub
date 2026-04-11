import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — AlUlamaa Academy" },
      { name: "description", content: "Browse our comprehensive Islamic courses in Quranic Studies, Hadith, Fiqh, and more." },
    ],
  }),
  component: CoursesPage,
});

const allCourses = [
  { title: "Quranic Studies", description: "Deep dive into Tafseer, Tajweed, and memorization techniques for understanding the Holy Quran.", lessons: 24, duration: "12 weeks", level: "All Levels", icon: "📖" },
  { title: "Hadith Collection", description: "Study authentic collections of Sahih Bukhari, Muslim, and other major compilations.", lessons: 18, duration: "10 weeks", level: "Intermediate", icon: "📚" },
  { title: "Islamic Jurisprudence", description: "Learn the principles of Fiqh covering worship, transactions, and daily life rulings.", lessons: 20, duration: "14 weeks", level: "Intermediate", icon: "⚖️" },
  { title: "Aqidah (Beliefs)", description: "Foundation course on Islamic creed, theology, and the pillars of faith.", lessons: 12, duration: "6 weeks", level: "Beginner", icon: "🌙" },
  { title: "Seerah", description: "The life and biography of Prophet Muhammad ﷺ and lessons for modern life.", lessons: 16, duration: "8 weeks", level: "Beginner", icon: "🕌" },
  { title: "Arabic Language", description: "Learn Classical Arabic to understand the Quran and Islamic texts in their original language.", lessons: 30, duration: "16 weeks", level: "All Levels", icon: "✍️" },
];

function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">All Courses</h1>
          <p className="text-muted-foreground mt-1">Explore our comprehensive curriculum</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCourses.map((course) => (
            <CourseCard key={course.title} {...course} />
          ))}
        </div>
      </div>
    </div>
  );
}
