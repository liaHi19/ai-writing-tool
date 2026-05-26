# Current Feature

Bootstrap Next.js 16 + TypeScript + Tailwind + shadcn/ui

## Status

Not Started

## Goals

- Scaffold a Next.js 16 app with App Router and TypeScript strict mode enabled
- Configure Tailwind CSS (v4 compatible with Next 16)
- Install and initialize shadcn/ui; confirm `components/ui/` directory is created
- Ensure `pnpm dev` starts without errors and `http://localhost:3000` loads
- `pnpm build`, `pnpm lint`, and `pnpm typecheck` all pass on the empty scaffold
- `lib/utils.ts` exports the `cn()` helper (created by shadcn init)

## Notes

- Use `pnpm` as the package manager throughout — do not use `npm` or `yarn`
- shadcn components are added via `pnpm dlx shadcn@latest add <name>`; do not edit files inside `components/ui/` directly
- Runtime target is Node.js 20+

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
