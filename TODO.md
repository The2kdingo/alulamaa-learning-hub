# Vercel Deployment TODO

## [x] 1. Vercel Settings (Project Settings > General)
- Framework Preset: **Vite** (or Other)
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: `/`
- Install Command: `npm install` (default)

## [ ] 2. Add Environment Variables (Settings > Environment Variables)
| Key | Value Source |
|----|--------------|
| SUPABASE_URL | Supabase > Settings > API > URL (e.g., https://yourproject.supabase.co) |
| SUPABASE_PUBLISHABLE_KEY | Supabase > Settings > API > anon/public key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase > Settings > API > service_role key |

**Add to all environments (Production/Preview/Development).**

## [ ] 3. Deploy & Test
- Trigger redeploy
- Check build logs (should run esbuild → dist/)
- Test site: auth, quizzes, Supabase queries

## [ ] 4. Optional: Custom Domain, etc.

