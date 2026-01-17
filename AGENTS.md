## General instructions
- When adding new features, fixing bugs and refactoring:
  - after you're done, run a browser to test your changes. Assume the dev server is already running (http://localhost:5173)
  - run tests, type checks and linting
  - add tests for new code
- This is a development app, not production. No migrations are needed – everything is handled in-memory only.
- The application state should be in one place, because the app must be able to import/export the whole state in one file
- Avoid adding any dependencies to the app
- Avoid using generic names like "utils" or "helpers." Try to organize code by features.

## Commands
- Unit tests can be run with `yarn test`
- Dev server can be run with `yarn run start` - note this command stays running until you kill it
- Integration tests can be run with `yarn run cypress run`, but they need dev server to be running
- Type checks can be run with `yarn run check-types`
