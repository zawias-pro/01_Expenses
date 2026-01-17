## General instructions
- When adding new features and fixing bugs, run browser to test your changes. Assume dev server is already running (http://localhost:5173)
- This is a development app, not production. No migrations are needed - everything is handled in-memory only.
- All application state should be in one place, because the app must be able to import/export whole state in one file
- Avoid adding any dependencies to the app

## Commands
- Unit tests can be run with `yarn test`
- Dev server can be run with `yarn run start` - note this command stays running until you kill it
- Integration tests can be run with `yarn run cypress run`, but they need dev server to be running
- Type checks can be run with `yarn run check-types`
