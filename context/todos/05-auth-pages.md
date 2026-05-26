# (auth) Login & Signup Pages

## Overview
Build the two authentication pages that let users create an account and sign in. These live in the `(auth)` route group, outside the protected `(app)` group, so unauthenticated visitors can reach them freely.

## Requirements
- Create `app/(auth)/login/page.tsx` with an email + password form that calls Supabase `signInWithPassword`
- Create `app/(auth)/signup/page.tsx` with an email + password form that calls Supabase `signUp`
- On successful login, redirect to `/` (the main editor)
- On successful signup, redirect to `/` or show a "check your email" message depending on Supabase email confirmation settings
- Display inline error messages for failed attempts (wrong password, user already exists, etc.)
- Both pages are Server Components by default; add `"use client"` only to the form components that need interactivity
- Use shadcn/ui primitives (`Input`, `Button`, `Label`) for form elements

## Notes
- No custom password-reset flow in scope — Supabase auth defaults handle it
- No OAuth providers in scope for v1
- Auth actions should go through `lib/supabase/client.ts` (browser) since they are triggered from the client side

## References
- PRD §3 Session 1, bullet 5
- PRD §4 Session 1 acceptance criteria (sign up, log in, log out; session survives reload)
- CLAUDE.md §Architecture → `(auth)/login`, `(auth)/signup`
- CLAUDE.md §Conventions → Routing (Server Components by default)
