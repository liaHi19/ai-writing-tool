# Import the Polish Prototype (Session 5 Prerequisite)

## Overview
Session 5 is a visual redesign whose source of truth is `AI Writing Tool.html` — a self-contained prototype exported from claude.ai/design. The file is referenced by name throughout the PRD but is not yet in the repo. Drop the HTML at the repo root so every downstream Session 5 todo (`18-` through `27-`) can read the same markup, tokens, and copy when implementing. This is a one-shot asset hand-off — no app code changes.

## Requirements
- Place `AI Writing Tool.html` at the repo root (next to `package.json` / `CLAUDE.md`)
- Open the file in a browser and confirm it renders standalone (no missing assets, no console errors)
- Locate the `TWEAK_DEFAULTS` block inside the file and note: palette name (`cool`), accent (`#2563eb`), radius (`17px`), font family (Geist) — these are the values todo `18-` will bake into `app/globals.css`
- Locate the editor and history markup blocks; bookmark their selectors / section headings so card-level todos (`20-`–`23-`, `25-`–`26-`) can copy class names, spacing, and copy verbatim
- Add `AI Writing Tool.html` to `.gitignore` **only** if the team prefers to keep design exports out of git; otherwise commit it so the rest of the work can reference a stable revision

## Notes
- Do **not** import the prototype's JS/CSS directly into the Next app — it ships as a single static page using inline styles. Each Session 5 todo reimplements the relevant slice in React + Tailwind against the cool-fog tokens from todo `18-`
- The prototype includes a **Tweaks panel** (live theme customizer) — per PRD §3 Session 5 "Out of scope", we do not port it. `TWEAK_DEFAULTS` (`cool` / `#2563eb` / `17px` / Geist) are baked in as fixed tokens, not user-adjustable
- If the file is sensitive or large, store it under `docs/design/` instead — but then update the cross-references in todos `18-`–`27-` to match the new path

## References
- PRD §3 Session 5 → opening line: "Source design: `AI Writing Tool.html` (Polish prototype, exported from claude.ai/design)"
- PRD §3 Session 5 → "Out of scope: the design's Tweaks panel … Defaults from `TWEAK_DEFAULTS` are baked in"
