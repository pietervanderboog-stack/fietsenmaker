# Hosting Fietsenmaker on vanderboog.nl

Guide to self-host the game on a home server with your own domain.

## What you need

- A always-on computer (old laptop, Raspberry Pi 4+, or a mini PC)
- Your domain vanderboog.nl (DNS access)
- Your home internet router (port forwarding access)

## Step 1: Build the game

```bash
cd fietsenmaker
npm install
npm run build
```

This creates a `dist/` folder with static files. That's everything — no backend needed.

## Step 2: Set up the server

### Option A: Raspberry Pi / Linux machine (recommended)

Install nginx:

```bash
sudo apt update && sudo apt install -y nginx
```

Copy the build output:

```bash
sudo mkdir -p /var/www/fietsenmaker
sudo cp -r dist/* /var/www/fietsenmaker/
```

Create nginx config:

```bash
sudo nano /etc/nginx/sites-available/fietsenmaker
```

Paste this:

```nginx
server {
    listen 80;
    server_name vanderboog.nl www.vanderboog.nl;

    root /var/www/fietsenmaker;
    index index.html;

    # SPA: serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache sprites
    location /sprites/ {
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/fietsenmaker /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### Option B: Windows machine

Install Node.js, then use `serve`:

```bash
npm install -g serve
serve -s dist -l 80
```

Or use the built-in preview:

```bash
npm run preview -- --host 0.0.0.0 --port 80
```

For running as a background service on Windows, use NSSM (Non-Sucking Service Manager):

```bash
# Download nssm from https://nssm.cc
nssm install fietsenmaker "C:\Program Files\nodejs\npx.cmd" serve -s C:\path\to\dist -l 80
nssm start fietsenmaker
```

## Step 3: HTTPS with Let's Encrypt (Linux)

This is important — PWA service workers require HTTPS.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d vanderboog.nl -d www.vanderboog.nl
```

Certbot will automatically update your nginx config for HTTPS and set up auto-renewal.

On Windows, consider using Caddy instead (automatic HTTPS):

```bash
# Install Caddy from https://caddyserver.com
# Create Caddyfile:
# vanderboog.nl {
#     root * C:\path\to\dist
#     file_server
#     try_files {path} /index.html
# }
```

## Step 4: Point your domain to your home server

### Find your public IP

Go to https://whatismyipaddress.com or run:

```bash
curl ifconfig.me
```

### Configure DNS at your registrar

Log in to your domain registrar (TransIP, Hostnet, etc.) and set:

| Type  | Name | Value           | TTL  |
|-------|------|-----------------|------|
| A     | @    | YOUR_PUBLIC_IP  | 3600 |
| A     | www  | YOUR_PUBLIC_IP  | 3600 |

### Port forwarding on your router

Log in to your router (usually http://192.168.1.1) and forward:

| External port | Internal port | Protocol | Internal IP         |
|---------------|---------------|----------|---------------------|
| 80            | 80            | TCP      | your server's LAN IP |
| 443           | 443           | TCP      | your server's LAN IP |

Find your server's LAN IP with `ip addr` (Linux) or `ipconfig` (Windows).

### Dynamic IP (most home connections)

Your public IP probably changes. Use a dynamic DNS solution:

**Option 1: ddclient (Linux)**

```bash
sudo apt install -y ddclient
```

Configure with your registrar's API, or use a free DDNS service (like DuckDNS) and CNAME your domain to it.

**Option 2: Simple script (works everywhere)**

Create a script that checks your IP every 5 minutes and updates DNS via your registrar's API. Most Dutch registrars (TransIP, Hostnet) have APIs for this.

## Step 5: Deploy updates

After making changes:

```bash
npm run build
# Linux:
sudo cp -r dist/* /var/www/fietsenmaker/
# Windows:
# Just rebuild — serve picks up changes automatically
```

## Quick checklist

- [ ] Build: `npm run build` succeeds
- [ ] Server: nginx/serve running, serving `dist/`
- [ ] HTTPS: Let's Encrypt certificate installed
- [ ] DNS: vanderboog.nl A record points to your public IP
- [ ] Router: ports 80 + 443 forwarded to server
- [ ] Dynamic IP: ddclient or equivalent running
- [ ] Test: open https://vanderboog.nl on your phone

## Alternative: skip the home server

If the home server setup is too much hassle, these free/cheap options work great for static sites:

- **Cloudflare Pages** — free, fast, auto-deploys from git. `npx wrangler pages deploy dist`
- **Netlify** — free tier, drag-and-drop the `dist/` folder
- **Vercel** — free, `npx vercel --prod`
- **GitHub Pages** — free, add `base: '/repo-name/'` to vite.config.js

All of these support custom domains — just point vanderboog.nl to their servers via CNAME.
