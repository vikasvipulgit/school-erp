# Contributing Guide

This project is intended to scale as an enterprise-grade School ERP. We prioritize consistency, maintainability, and clear ownership of modules.

## Project Structure

- `src/app` — app bootstrap and routing
- `src/core` — shared infrastructure (auth, layouts, hooks, shared components, data clients)
- `src/modules` — feature modules (timetable, tasks, attendance, etc.)
- `src/components` — UI primitives (shadcn/ui and shared design-system components)
- `src/lib` — utilities (formatters, helpers)
- `src/data` — local/static data mocks (temporary until API integration)

### Module Convention

Each module should follow a consistent shape:

- `components/` — module-specific UI
- `hooks/` — module-specific hooks
- `pages/` — route-level pages
- `services/` — module API calls or data adapters
- `index.js` — public API for the module

## Coding Standards

- Prefer small, focused components and functions.
- Keep feature logic within its module; only promote to `core` if shared across modules.
- Avoid side-effects in render; use hooks for effects.
- Use absolute imports via `@/` for src-relative paths.
- Ensure exports are named and intentional.

## Comments

- Add comments where intent or reasoning is not obvious.
- Avoid restating the code; explain the “why,” not the “what.”
- Use JSDoc for non-trivial functions and shared utilities.

## Linting & Formatting

- `npm run lint` — ESLint checks
- `npm run lint:fix` — auto-fix lint issues
- `npm run format` — format with Prettier
- `npm run format:check` — CI-friendly formatting check

## Commits & Reviews

- Keep pull requests focused and reviewable.
- Include a short summary and testing notes in PR descriptions.
