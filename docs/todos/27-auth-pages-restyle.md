# Auth Pages Restyle — Polish Bento Card

## Overview
Restyle `/login` and `/signup` to match the Polish prototype: cool-fog ground (already set by todo `18-`), Geist typography, a single bento card (17 px radius) wrapping each form, and a brand mark + "Polish" wordmark sitting above the card. **Server actions and Zod validation are unchanged** — `actions/auth.ts` and `lib/validation/auth.ts` stay exactly as they are. This is a visual change only.

## Requirements
- Restyle `app/(auth)/login/page.tsx` + `app/(auth)/login/login-form.tsx`:
  - Page-level: centered viewport-height container with `bg: var(--bg)` (inherits from the body once todo `18-` lands)
  - Above the card: brand mark "P" (28 px accent square, `radius-sm`) + "Polish" wordmark (Geist Sans, large) — matches the header treatment from todo `19-`
  - Card: single bento, `bg: var(--surface)`, `radius: var(--radius)` (17 px), hairline `var(--border)`, generous interior padding (`p-8` or matching the prototype). Wraps the entire form
  - Title inside the card: "Sign in" (Geist Sans, large), short subtitle below
  - Form fields keep their existing `<FormField>` / `<FormMessage />` structure from session 8 — only the wrapper chrome changes
  - "Sign up" link sits below the card or inside it at the foot; match the prototype
- Restyle `app/(auth)/signup/page.tsx` + `app/(auth)/signup/signup-form.tsx`:
  - Same outer scaffolding (brand mark + wordmark + bento card)
  - Title "Create an account"; subtitle below
  - Preserve the existing `emailSent` state branch — when set, the form swaps for a "Check your email" panel inside the same bento card (don't break the layout when the message replaces the form)
- **No changes** to:
  - `actions/auth.ts` (server actions, `useActionState` wiring)
  - `lib/validation/auth.ts` (Zod schemas)
  - The RHF + `standardSchemaResolver` plumbing from session 8
  - Inline Zod error rendering via `<FormMessage />`
- Verify after the restyle: `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` remain absent from any client bundle (`pnpm build` output inspection) — the restyle should touch only client-safe code, but worth a final pass to catch accidental server-import drift
- Final pass: `pnpm lint`, `pnpm typecheck`, `pnpm build` all return zero errors

## Notes
- The Polish wordmark above the card and the segmented Write/History header nav (todo `19-`) are mutually exclusive — auth pages do not render the app header, only the brand block. The `(auth)` layout shouldn't import `<Header />`
- The Geist fonts are already wired in `app/layout.tsx` and apply to every route; no per-page font import needed
- Sign-in (login) does **not** enforce the 8-char + letter + digit rule — only sign-up does. This was a deliberate choice in session 8 (legacy accounts must still log in) and is unchanged here
- If the prototype shows a "social login" or "magic link" button, ignore it — those are out of scope for v1 (PRD §2)

## References
- PRD §3 Session 5 → "Auth pages restyle" subsection
- PRD §4 Session 5 → "`/login` and `/signup` render with the Polish bento card on cool-fog bg; Zod errors still surface inline; sign-in/sign-up flows unchanged"
- PRD §4 Session 5 → "`SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` remain absent from any client bundle after the restyle"
- PRD §4 Session 5 → "`pnpm lint`, `pnpm typecheck`, `pnpm build` all return zero errors"
- `AI Writing Tool.html` (see todo `17-`) → auth-card markup for spacing, brand-block sizing, and copy
- `docs/todos/16-zod-react-hook-form-validation.md` → existing form plumbing that must not change
