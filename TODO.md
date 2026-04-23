# AlUlamaa Resources SSR Fix - TODO

## Plan Steps
1. [x] Fix scripts/build-with-env.js quoting for esbuild defines (JSON.stringify values)
2. [x] Update vercel.json with rewrites for SSR serverless + functions config
3. [ ] Test `npm run build` - verify dist/server/server.js + dist/client/src/entry.client.js + copy to api/server.js
4. [ ] Test local preview/server: /resources shows dynamic lessons (node dist/server/server.js)
5. [ ] Deploy Vercel, verify /resources dynamic (no static listing)
6. [ ] [Optional] Add RTQ to resources.tsx for SSR prefetch

Current: Step 3
