# 01_Expenses

## Self-hosting

See [`installation/README.md`](installation/README.md) for the Podman and host
Caddy deployment instructions.

## Development

Install Node.js and npm, then install dependencies and start Vite:

```sh
npm ci
npm run dev
```

Frontend will be running at:

- http://localhost:5173

Expenses data is stored in the browser's IndexedDB. It is not sent to a
backend, so each browser profile has its own data. Use the application's backup
and export features before clearing browser data or changing browsers.
