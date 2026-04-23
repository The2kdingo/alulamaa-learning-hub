# AlUlamaa Academy - Islamic Learning Platform
> Comprehensive Islamic education hub with courses, quizzes, resources, prayers, tasbih counter, and community features. Built with modern React stack.

## 🎨 Design System
- **Glassmorphism UI**: Frosted glass cards (`glass` class) with backdrop-blur
- **Islamic Color Palette**: Primary golds/greens, warm neutrals, gradient backgrounds (islamic-pattern-bg.jpg)
- **Typography**: Heading fonts + Arabic-support ready
- **Animations**: Tailwind Animate + Framer Motion (smooth page transitions)
- **Responsive**: Mobile drawer → Desktop sidebar (useMobile hook)
- **Dark/Light**: System preference (shadcn default)
- **Accessibility**: ARIA labels, keyboard nav, focus states

## 👥 User Roles & Permissions
| Role | Features | Database |
|------|----------|----------|
| **Guest** | Browse resources, tasbih, prayer, dua | Read-only |
| **Student** | Lessons, quizzes, profile, progress tracking | RLS enforced |
| **Admin** | Upload lessons, manage users, analytics | Full access (service role) |

**Auth Flow**: Supabase Auth → `useUserRole.ts` hook → Navbar conditional rendering

## 🚀 Features (Detailed)
- **📚 Courses & Lessons**
  - PDF viewer (react-pdf) with page navigation, zoom, annotations
  - Progress: Opened/read → Quiz generated → Completed
  - Auto-quiz via Supabase Edge Function (`generate-quiz/index.ts`)
- **📖 Resources (Books API)**
  - **API**: `supabase.from('lessons').select('*').order('subject')`
  - Dynamic cards grouped by subject (Aqeedah, Fiqh, Tafsir...)
  - Progress badges, search/filter coming soon
  - **Wiring**: Client-side fetch (useEffect) → Grouped list → Link to `/lesson/$id`
- **🧠 Quizzes**
  - MCQ + short answer from lesson content
  - Score tracking, retry, review mode
- **👤 Profile & Settings**
  - **Profile** (`/profile`): Progress overview, stats cards, completed lessons
  - **Settings**: Account, notifications, theme, privacy
  - **Wired**: Supabase profiles table + lesson_progress aggregation
- **Islamic Tools**: Tasbih counter (localStorage persist), prayer API integration


## 🛠 Tech Stack
\`\`\`
Frontend: React 19 + Vite + TypeScript + TanStack Router + React Query
UI: shadcn/ui + Tailwind CSS 4 + Lucide React
Backend: Supabase (Auth, Database, Edge Functions)
SSR: Custom Express + esbuild bundles
Deployment: Vercel (Serverless)
Database: Supabase Postgres
PDF: react-pdf + pdfjs-dist
Charts: Recharts
Forms: React Hook Form + Zod
State: React Query (server/client prefetch)
\`\`\`
![Tech Stack](https://i.imgur.com/tech-stack-placeholder.png)

## 📁 Project Structure
\`\`\`
alulamaa-learning-hub/
├── public/                 # Static assets
│   ├── index.html         # SPA entry
│   ├── ssr-template.html  # SSR template
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/        # shadcn/ui + custom (Navbar, CourseCard, etc.)
│   ├── hooks/             # Custom hooks (useMobile, useUserRole)
│   ├── integrations/      # Supabase client/server
│   ├── lib/               # Utils
│   ├── routes/            # File-based routing
│   │   ├── __root.tsx
│   │   ├── index.tsx      # Home
│   │   ├── courses.tsx
│   │   ├── resources.tsx  # Lesson library
│   │   ├── lesson.$id.tsx # PDF viewer + quiz
│   │   ├── quiz.tsx
│   │   └── admin.tsx
│   ├── entry.client.tsx   # Client hydration
│   ├── entry.server.tsx   # SSR render
│   ├── main.tsx           # Client entry
│   └── router.tsx         # TanStack Router setup
├── scripts/               # Custom build scripts
│   ├── build-with-env.js  # Client bundle + env injection
│   ├── build-html.js      # Static HTML generation
│   └── copy-*.js          # Asset copies
├── server.ts              # Express SSR server
├── package.json           # Dependencies + build scripts
├── vite.config.ts         # Vite config
├── vercel.json            # Vercel deployment
└── supabase/              # Supabase config/migrations
\`\`\`

## 🎯 Routes
| Route | Description | Auth |
|-------|-------------|------|
| \`/\` | Home - Featured courses | - |
| \`/resources\` | Lesson library (PDFs by subject) | - |
| \`/lesson/:id\` | PDF viewer + progress + quiz | User |
| \`/courses\` | Course catalog | - |
| \`/quiz\` | Quiz dashboard | User |
| \`/profile\` | User profile + progress | User |
| \`/admin\` | Admin dashboard | Admin |
| \`/tasbih\` | Digital prayer bead counter | - |
| \`/prayer\` | Prayer times + Qibla | - |
| \`/dua\` | Supplications collection | - |
| \`/q/:slug\` | Search results | - |
| \`/q/:slug/results\` | Search page | - |

## 🗄 Database Schema (Supabase)
\`\`\`sql
-- Lessons (PDF resources)
lessons: id, title, description, subject, file_url, created_at

-- Lesson progress
lesson_progress: user_id, lesson_id, opened, quiz_generated, completed_at

-- Quizzes (AI generated)
quizzes: lesson_id, questions[]::jsonb, user_answers[]::jsonb, score

-- Users (Supabase Auth)
profiles: user_id, role (student/admin), display_name
\`\`\`

## 🔧 Setup & Development

### Prerequisites
- Node.js 20+
- Bun (optional, for faster installs)
- Supabase account + project

### 1. Clone & Install
\`\`\`bash
git clone <repo>
cd alulamaa-learning-hub
npm install
# or bun install
\`\`\`

### 2. Environment Variables
Copy \`.env.example\` → \`.env.local\`:
\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co  # Server-only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

### 3. Supabase Setup
\`\`\`bash
cd supabase
supabase init
supabase db pull  # Or run migrations
supabase start    # Local Supabase
\`\`\`

### 4. Development
\`\`\`bash
npm run dev       # http://localhost:3000
npm run lint
\`\`\`

### 5. Build & Preview
\`\`\`bash
npm run build     # Custom esbuild + SSR bundles
npm run preview   # http://localhost:4173
\`\`\`

## 🚀 Deployment (Vercel)

1. **Connect GitHub repo** to Vercel
2. **Add env vars** (from Supabase dashboard)
3. **Deploy** → Automatic on push

**Build settings** (auto-detected):
\`\`\`
Framework: Other
Build: npm run build
Output: dist
\`\`\`

## 📊 Customization

### Add New Route
\`\`\`
src/routes/my-page.tsx  # Auto-generates routeTree
npm run build
\`\`\`

### UI Components
\`\`\`bash
npx shadcn-ui@latest add button dialog
\`\`\`

### Tailwind Config
Edit \`components.json\` → tailwindcss section

## 🔍 Debugging Common Issues

| Issue | Solution |
|-------|----------|
| Blank \`/resources\` | Check Supabase \`lessons\` table has data |
| SSR empty shell | Normal (client fetches); add RTQ for prefetch |
| Build fails | Verify env vars, \`npm run build:client\` |
| Auth 401 | Service role key for server, anon key for client |

## 🤝 Contributing
1. Fork → Branch (\`feat/my-feature\`)
2. \`npm run lint\`
3. PR with description + screenshots

## 📄 License
MIT - Free for Islamic education projects.

## 🙏 Acknowledgments
- [TanStack](https://tanstack.com) - Router + Query
- [shadcn/ui](https://ui.shadcn.com) - Beautiful components
- [Supabase](https://supabase.com) - Backend in minutes
- [Vercel](https://vercel.com) - Lightning deploys

---

**Built with ❤️ for Islamic education • in shaa Allah beneficial**

<div align=\"center\">
  <img src=\"public/favicon.ico\" width=\"32\" alt=\"AlUlamaa\" />
  <p><strong>Learn. Practice. Share.</strong></p>
</div>

