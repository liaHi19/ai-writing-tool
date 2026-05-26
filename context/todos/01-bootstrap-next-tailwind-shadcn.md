# Bootstrap Next.js 16 + TypeScript + Tailwind + shadcn/ui

## Overview
Initialize the project skeleton that all subsequent sessions build on. This sets up the framework, styling system, and component library so every future file has a consistent foundation to import from.

## Requirements
- Scaffold a Next.js 16 app with the App Router and TypeScript strict mode enabled
- Configure Tailwind CSS (v4 compatible with Next 16)
- Install and initialize shadcn/ui; confirm `components/ui/` directory is created
- Ensure `pnpm dev` starts without errors and `http://localhost:3000` loads
- `pnpm build`, `pnpm lint`, and `pnpm typecheck` all pass on the empty scaffold
- `lib/utils.ts` exports the `cn()` helper (created by shadcn init)

## Notes
- Use `pnpm` as the package manager throughout — do not use `npm` or `yarn`
- shadcn components are added via `pnpm dlx shadcn@latest add <name>`; do not edit files inside `components/ui/` directly
- Runtime target is Node.js 20+

## References
- PRD §3 Session 1, bullet 1
- CLAUDE.md §Stack, §Conventions → UI
