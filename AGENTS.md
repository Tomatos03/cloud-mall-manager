# Repository Guidelines

## Project Structure & Module Organization
- Main app code lives in `src/`.
- `src/views/` contains page-level modules (for example `goods/`, `order/`, `system/`).
- `src/api/` stores domain API clients (`goods.ts`, `order.ts`, `user.ts`) built on `src/utils/http.ts`.
- `src/components/` holds reusable UI pieces; layout shells are in `src/layout/`.
- `src/stores/` contains Pinia stores (`user`, `menu`, `tabs`, etc.).
- Static files are in `public/`; design notes/docs are in `docs/`.

## Build, Test, and Development Commands
- `pnpm dev`: start Vite dev server.
- `pnpm build`: run type check, then production build.
- `pnpm build-only`: build without type checking.
- `pnpm type-check`: run `vue-tsc --build`.
- `pnpm lint`: run ESLint with auto-fix.
- `pnpm format`: format `src/` with Prettier.
- `pnpm preview`: preview the built app locally.

Use Node `^20.19.0 || >=22.12.0` (see `package.json` engines).

## Coding Style & Naming Conventions
- Language stack: Vue 3 SFC + TypeScript, Vue Router, Pinia, and Tailwind CSS.
- Follow Prettier and ESLint config in `.prettierrc.json` and `eslint.config.ts`.
- Source files currently use 4-space indentation and single quotes.
- Use path alias `@/` for imports from `src/`.
- Async style: use `async/await` consistently; avoid chained `.then()/.catch()/.finally()` in business code.
- API error handling: `src/utils/http.ts` already handles business errors and request-failure toasts. Do not add extra `try/catch` only to show `ElMessage` again unless custom UX/retry/fallback is required.
- Default values: use `??` for fallback assignment instead of `||` to avoid breaking valid falsy values (`0`, `''`, `false`).
- Naming patterns:
  - Vue components: PascalCase (for example `OrderDetailDialog.vue`).
  - API/store/util files: lowercase or domain-based names (for example `order.ts`, `http.ts`).

## Testing Guidelines
- No dedicated unit/E2E test framework is configured yet.
- Before opening a PR, run at least:
  - `pnpm lint`
  - `pnpm type-check`
  - `pnpm build`
- For behavior-heavy changes, include clear manual verification steps in the PR description.

## Commit & Pull Request Guidelines
- Recent history mixes plain messages and prefixes, with common Conventional Commit prefixes like `feat:` and `chore:`.
- Prefer: `<type>: <short summary>` (English or Chinese), e.g. `feat: add seckill detail filters`.
- Keep commits focused and scoped to one change set.
- PRs should include:
  - What changed and why.
  - Linked issue/task ID.
  - Screenshots/GIFs for UI changes.
  - Any env/config impact (for example `.env.development` keys).
