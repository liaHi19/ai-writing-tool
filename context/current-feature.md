# Current Feature

## Status

**Active.** Zod + React Hook Form validation added (session 8). `pnpm lint`, `pnpm typecheck`, `pnpm build` pass with zero errors.

Remaining: manual smoke test — auth forms show inline errors before submission; Generate button stays disabled under 10 chars; all 5 modes stream end-to-end and rows appear on `/history`.

## History

- Session 1 — Project setup: Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui; Supabase project + `.env.local`; `@supabase/ssr` clients; root `proxy.ts` (session refresh + auth redirects); login + signup pages
- Session 2 — DB schema (`generations`, `usage_daily`, RLS policies); migration via `supabase db push`; generated `lib/db/types.ts`; `lib/anthropic.ts`, `lib/prompts.ts` (5 modes), `lib/rate-limit.ts`; `/api/generate` streaming route with auth, rate-limit, persist in `onFinish`, `revalidateTag`
- Session 3 — Editor UI: `InputArea`, `ModeSelector`, `OutputPane`, `CopyButton` components; `EditorPanel` with `useCompletion`; `app/(app)/page.tsx`; `sonner` toasts
- Session 4 — Server Actions auth refactor; History page with `"use cache"`; proxy + config fixes (`isAppRoute` matcher, `cacheComponents: true`)
- Session 5 — Fix stream protocol: `toTextStreamResponse()` in route + `streamProtocol: "text"` in `useCompletion`; all 5 modes stream end-to-end
- Session 6 — Error toasts & disabled state: `sonner` installed, `<Toaster />` in root layout, custom `fetch` parses `{ error }` for 400/401/429/500, `onError` → `toast.error`, Generate button disabled while `isLoading`
- Session 7 — History page final pass: added `CopyButton` to each row's output section; `pnpm lint`, `pnpm typecheck`, `pnpm build` all zero errors; `/history` shows `◐` (Partial Pre-render) in build output; removed `(app)` route group (`app/page.tsx`, `app/history/page.tsx` at root)
- Session 8 — Zod + React Hook Form validation: `lib/prompts.ts` exports `MODES as const`; `lib/validation/auth.ts` (`signInSchema`, `signUpSchema` — min 8 chars + letter + digit; `authDefaults`); `lib/validation/generate.ts` (`generateSchema` — min 10 chars; `generateDefaults`); `actions/auth.ts` validates FormData with `safeParse` before Supabase; `/api/generate` replaces `isMode()` with `generateSchema.safeParse`; all three client forms (`login-form`, `signup-form`, `EditorPanel`) use `useForm` + `standardSchemaResolver` + shadcn `Form`/`FormField`/`FormMessage`; `components/ui/form.tsx` added (canonical shadcn pattern, `@radix-ui/react-slot`); `docs/todos/16-zod-react-hook-form-validation.md` added
