# Repository Guidelines

## Project Structure & Module Organization
- `layout/` – base HTML shell (`theme.liquid`).
- `sections/` – reusable page blocks (kebab‑case Liquid files) with schema.
- `snippets/` – small, composable Liquid partials (icons, cards, price).
- `templates/` – page templates (JSON) mapping sections.
- `assets/` – CSS/JS and theme media (e.g., `theme.css`, `global.js`).
- `config/` – settings schema and presets (`settings_schema.json`).
- `locales/` – translations (`en.default.json`).
- `.shopify/` – store/dev config and metafields.

## Build, Test, and Development Commands
- Authenticate: `shopify login --store tchncy-vu.myshopify.com`.
- `shopify theme dev` – live preview + hot reload against a store.
  - Common flags: `--store tchncy-vu.myshopify.com`, `--theme <id>`, `--no-open`.
- `shopify theme check` – lint Liquid/theme conventions (requires Theme Check).
- `shopify theme push` – upload current theme (use `--development` or `--theme <id>`).
- Example loop: `shopify theme dev --store tchncy-vu.myshopify.com` → iterate → `shopify theme check` → `shopify theme push`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces across Liquid, CSS, and JS.
- Files and CSS classes: kebab‑case (e.g., `image-with-text.liquid`, `.card-product`).
- Section schema keys: snake_case; add matching keys in `locales/*`.
- JS: vanilla ES5/ES6, semicolons; prefer small, scoped modules in `assets/`.
- Liquid: keep logic minimal; favor schema settings over hardcoded strings.

## Testing Guidelines
- Run `shopify theme dev` and verify across breakpoints (mobile, tablet, desktop).
- Lint with `shopify theme check`; ensure JSON files are valid and localized strings exist.
- Accessibility: keyboard focus, ARIA where applicable; test color contrast.

## Commit & Pull Request Guidelines
- Commit style: Conventional Commits preferred (`feat:`, `fix:`, `refactor:`). Keep imperative, scoped messages.
- Branches: `feature/<slug>` or `fix/<slug>`.
- PRs must include: summary of changes (what/why), screenshots or GIFs of key sections, affected files/sections, test plan, and (if applicable) a preview link.

## Security & Configuration Tips
- Do not commit credentials or store tokens. Avoid embedding PII in Liquid or logs.
- Keep images optimized; reference from `assets/`. Update `settings_schema.json` and `locales/*` together.

## Agent‑Specific Instructions
- Follow naming/indentation rules; avoid broad refactors or auto‑formatting.
- Keep sections self‑contained and accessible; update related schema and locale keys in the same change.
