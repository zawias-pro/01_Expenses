## General instructions
- (!) This is a development app, not production-ready. Don't try to keep backwards compatibility or add data migrations.
- The application state should be in one place, because the app must be able to import/export the whole state in one file
- Avoid adding any dependencies to the app
- Avoid using generic names like "utils" or "helpers." Try to organize code by features.
- Don't be defensive – if something goes wrong, rather throw an error than use a fallback value
- Avoid custom styles. Styling is something to be done later. At this point focus on simplicity.