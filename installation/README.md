# Self-hosting 01_Expenses

This setup uses Podman, `podman-compose`, and an existing Caddy installation.
The frontend container serves the static application on a loopback port; Caddy
provides the public HTTPS endpoint.

Expenses is a client-side application. It has no backend service: transaction,
account, category, and import data is stored in each user's browser IndexedDB.

## Requirements

- A Linux server with a public IPv4 address.
- Podman and its Compose provider are installed.
- Caddy is installed and running on the host.
- A domain or subdomain points to the server with an `A` record.
- Ports `80` and `443` are open in the server and VPS firewall.
- Users have a backup or export of their data before clearing browser storage.

## Install

Clone the repository on the server and enter the installation directory. The
commands below assume a root-owned production checkout:

```sh
git clone <repository-url> 01-expenses
cd 01-expenses/installation
```

Build and start the frontend container:

```sh
sudo podman-compose -f compose.yml up -d --build --force-recreate
```

Configure Caddy for the domain that points to this server:

```caddyfile
expenses.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

Reload Caddy, then open `https://expenses.example.com`.

The frontend binds only to `127.0.0.1:8080`, so Caddy is the public entry point.
If that host port is already in use, change the host side of the mapping in
`compose.yml` and update the Caddy upstream.

Because data is stored in browser IndexedDB, the server does not contain a
central copy of application data. Each browser profile must use the built-in
backup or export functionality before data is removed or moved.

## Operations

```sh
sudo podman-compose -f compose.yml ps
sudo podman-compose -f compose.yml logs -f
sudo podman-compose -f compose.yml down
```

To update a source checkout:

```sh
cd /srv/01-expenses
git pull
sudo podman-compose \
  -f installation/compose.yml \
  up -d --build --force-recreate
```
