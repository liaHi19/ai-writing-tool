# Zod Schemas & React Hook Form Validation

## Overview
Introduce **Zod** as the single source of truth for input shape across the three forms (login, signup, editor) and the `/api/generate` route, and adopt **react-hook-form** on the client for instant, inline field-level errors and a disabled-until-valid submit button. This replaces the current mix of HTML5 `required` / `minLength={6}`, the hand-rolled `isMode()` type guard in `/api/generate`, the `!inputText.trim()` runtime check in the editor, and the complete absence of validation in `actions/auth.ts` (which today hands FormData straight to Supabase). The existing `useActionState` plumbing and `sonner` toast pattern stay — Zod fits underneath, RHF wraps on top.

## Requirements
- Add deps: `pnpm add zod react-hook-form @hookform/resolvers @radix-ui/react-slot`
- Add the shadcn form wrapper at `components/ui/form.tsx` (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`)
- Promote `Mode` to a runtime constant: export `MODES = [...] as const` from `lib/prompts.ts` and derive `type Mode = (typeof MODES)[number]` from it — the Zod enum reads from the same array, so the union and the runtime check never drift
- Create `lib/validation/auth.ts` exporting:
  - `signInSchema`: email format + non-empty password (no length floor — legacy accounts may predate the new rule)
  - `signUpSchema`: email format + password ≥ 8 chars with at least one letter and at least one digit
  - Inferred `SignInInput` / `SignUpInput` types
- Create `lib/validation/generate.ts` exporting `generateSchema` (`text` trimmed + non-empty, `mode` as `z.enum(MODES)`) and inferred `GenerateInput`
- Refactor `actions/auth.ts` so `signIn` and `signUp` `safeParse` FormData before calling Supabase; return `{ error: firstIssue.message }` on a parse failure — the existing `SignInState` / `SignUpState` shape is unchanged
- Refactor `app/api/generate/route.ts` to `safeParse(body)` with `generateSchema`; delete the local `isMode()` guard and the manual `text` / `mode` checks
- Refactor `app/(auth)/login/login-form.tsx` and `app/(auth)/signup/signup-form.tsx`:
  - `useForm` with `standardSchemaResolver(schema)`, `defaultValues`, `mode: "onTouched"`
  - Each input lives inside `<FormField>` with `<FormMessage />` for inline client errors
  - On valid submit, build a `FormData` and dispatch the Server Action inside `startTransition`
  - Server-side errors (Supabase) continue to render via the existing `state?.error` block
- Refactor `components/editor/EditorPanel.tsx`:
  - One `useForm<GenerateInput>` replaces the two `useState` calls
  - `InputArea` and `ModeSelector` are wrapped in `<FormField>` and bound via `field.value` / `field.onChange`
  - Generate button: `disabled={isLoading || !text.trim()}` where `text` comes from `useWatch({ control: form.control, name: "text" })` (not `form.watch()` — React Compiler flags `watch()` as un-memoizable)
  - On valid submit, call `complete(data.text, { body: { mode: data.mode } })`
- Simplify `components/editor/ModeSelector.tsx`: import `MODES` from `lib/prompts.ts` instead of deriving it from `Object.keys(PROMPTS)`
- Final pass: `pnpm lint`, `pnpm typecheck`, `pnpm build` — all must pass with zero errors

## Notes
- Use the Zod 4 top-level helper `z.email()` (not the deprecated `z.string().email()`); the installed version is 4.4.x
- Use `standardSchemaResolver` from `@hookform/resolvers/standard-schema`, not `zodResolver` from `@hookform/resolvers/zod` — the latter's type signatures pin to an older Zod 4 patch line and reject schemas built with Zod 4.4.x (`_zod.version.minor` mismatch). Zod 4 implements Standard Schema natively, so `standardSchemaResolver(schema)` accepts any Zod 4 schema cleanly
- Use `useWatch({ control, name })` inside the editor, not `form.watch(name)` — React Compiler issues a "cannot be memoized safely" warning on the latter and skips compiling the component
- The sign-in schema deliberately does **not** enforce the 8-char / letter / digit rule — only sign-up does. Existing accounts with shorter passwords must still be able to log in
- The Server Action signature (`(_prev, formData) => state`) is preserved so `useActionState` keeps working unchanged on the client; `safeParse` is a defensive layer for direct-POST attempts that bypass RHF
- The 400 response shape from `/api/generate` is unchanged (`{ error: string }`), so the existing `fetch` interceptor in `EditorPanel` that parses `data.error` and re-throws still surfaces messages via `toast.error`
- Don't add `aria-invalid` manually — `FormControl` from `components/ui/form.tsx` sets it from the field's error state
- shadcn's CLI didn't expose `form` in the `base-nova` style registry, so `components/ui/form.tsx` was authored directly using the canonical shadcn pattern (the only external dep it needs is `@radix-ui/react-slot`)

## References
- CLAUDE.md §Rules ("Validate `mode` against an enum on the server; reject unknown modes with 400" — now enforced via `z.enum(MODES)` instead of a hand-rolled guard)
- CLAUDE.md §Conventions → Errors (route handlers return `{ error: string }`; client surfaces via `sonner` toast — Zod parse failures use the same shape)
- CLAUDE.md §Conventions → Prompts (`Mode` is the single source of truth — now lives as `MODES` + derived `Mode` in `lib/prompts.ts`)
- React Hook Form + Server Actions pattern: https://react-hook-form.com/docs/useform (RHF `handleSubmit` → dispatch Server Action inside `startTransition`)
