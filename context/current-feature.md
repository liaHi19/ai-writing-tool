# Current Feature

## Status

## History

- Session 1 — Project setup: Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui; Supabase project + `.env.local`; `@supabase/ssr` clients; root `proxy.ts` (session refresh + auth redirects); login + signup pages
- Session 2 — DB schema (`generations`, `usage_daily`, RLS policies); migration via `supabase db push`; generated `lib/db/types.ts`; `lib/anthropic.ts`, `lib/prompts.ts` (5 modes), `lib/rate-limit.ts`; `/api/generate` streaming route with auth, rate-limit, persist in `onFinish`, `revalidateTag`
- Session 3 — Editor UI: `InputArea`, `ModeSelector`, `OutputPane`, `CopyButton` components; `EditorPanel` with `useCompletion`; `app/(app)/page.tsx`; `sonner` toasts
- Session 4 — Server Actions auth refactor; History page with `"use cache"`; proxy + config fixes (`isAppRoute` matcher, `cacheComponents: true`)
- Session 5 — Fix stream protocol: `toTextStreamResponse()` in route + `streamProtocol: "text"` in `useCompletion`; all 5 modes stream end-to-end
- Session 6 — Error toasts & disabled state: `sonner` installed, `<Toaster />` in root layout, custom `fetch` parses `{ error }` for 400/401/429/500, `onError` → `toast.error`, Generate button disabled while `isLoading`
- Session 7 — History page final pass: added `CopyButton` to each row's output section; `pnpm lint`, `pnpm typecheck`, `pnpm build` all zero errors; `/history` shows `◐` (Partial Pre-render) in build output; removed `(app)` route group (`app/page.tsx`, `app/history/page.tsx` at root)
- Session 8 — Zod + React Hook Form validation: `lib/prompts.ts` exports `MODES as const`; `lib/validation/auth.ts` (`signInSchema`, `signUpSchema` — min 8 chars + letter + digit; `authDefaults`); `lib/validation/generate.ts` (`generateSchema` — min 10 chars; `generateDefaults`); `actions/auth.ts` validates FormData with `safeParse` before Supabase; `/api/generate` replaces `isMode()` with `generateSchema.safeParse`; all three client forms (`login-form`, `signup-form`, `EditorPanel`) use `useForm` + `standardSchemaResolver` + shadcn `Form`/`FormField`/`FormMessage`; `components/ui/form.tsx` added (canonical shadcn pattern, `@radix-ui/react-slot`); `docs/todos/16-zod-react-hook-form-validation.md` added
- Session 9 — Import Polish prototype: `Polish - AI Writing Tool.html` placed at repo root; standalone design export from claude.ai/design; `TWEAK_DEFAULTS` noted — palette `cool`, accent `#2563eb`, radius `17px`, font Geist; Tweaks panel out of scope (tokens baked in, not user-adjustable); `docs/todos/17-import-polish-prototype.md` added
- Session 10 — Cool-fog design tokens: replaced default OKLch shadcn palette in `app/globals.css` with cool-fog hex tokens (`--bg`, `--surface`, `--surface-2`, `--fg`, `--fg-muted`, `--fg-dim`, `--accent #2563eb`, `--accent-fg`); `--radius: 17px`, `--radius-sm: 9px`; shadcn tokens remapped to cool-fog vars; `.dark` block removed; fixed `--font-sans` to reference `--font-geist-sans`; `pnpm build` zero errors
