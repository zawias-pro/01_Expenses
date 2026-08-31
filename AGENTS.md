## Rules

- One export per file, named exports only.
- No default exports (`import/no-default-export`); config files may be disabled inline.
- No BEM. Import class names from CSS modules (`*.module.css`), camelCase keys.
- Component prop types inline; never a separate props interface.
- Multi-file components live in a directory named after the component; no `index.ts` barrels.
- Components self-contained; no prop drilling (subscribe to shared state directly).
- `src` organized by domain: `transactions/`, `categories/`, plus `core/` (app shell) and `components/` (shared reusable ui).
- Minimal styling, one CSS module per component, no inline styles.
- Persistence: dexie + dexie-react-hooks.
- Tests: vitest + jsdom + fake-indexeddb + testing-library, colocated with component.
- Verify: `npm run lint`, `npx tsc -b`, `npm test`.