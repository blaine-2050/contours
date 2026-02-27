# Custom Domain Setup for Contours on Railway

## 1. Buy a Domain

Recommended registrars (all $10–15/yr for `.com`):

- **Cloudflare Registrar** — at-cost pricing, built-in CNAME flattening (best for apex domains)
- **Porkbun** — cheap, clean UI
- **Namecheap** — popular, frequent sales

## 2. Add Domain in Railway

1. Open the Contours service in the Railway dashboard
2. Go to **Settings → Networking → Custom Domain**
3. Click **Add Domain** and enter your domain (e.g., `contours.example.com` or `example.com`)
4. Railway will show a **CNAME target** — copy it (looks like `your-service.up.railway.app`)

## 3. Configure DNS

### Subdomain (e.g., `blog.example.com`)

Add a CNAME record at your registrar:

| Type  | Name   | Target                          |
|-------|--------|---------------------------------|
| CNAME | `blog` | `your-service.up.railway.app`   |

### Apex domain (e.g., `example.com`)

Standard DNS doesn't allow CNAME on apex (root) domains. Options:

- **Cloudflare** (recommended): supports CNAME flattening natively — just add a CNAME record for `@` and it works
- **Other registrars**: use an ALIAS or ANAME record if supported, or use a subdomain instead

## 4. SSL Certificate

Railway auto-provisions a **Let's Encrypt** TLS certificate once DNS resolves. No action needed — HTTPS just works.

## 5. Verify

- Check the Railway dashboard — a **green checkmark** appears next to the domain when DNS propagates and SSL is provisioned
- Propagation usually takes minutes, but can take up to 48 hours with some registrars
- Test by visiting `https://your-domain` in a browser

## Notes

- Railway handles HTTPS redirects automatically
- If you change registrars or DNS providers, just re-point the CNAME
- No code changes needed in the app — SvelteKit + adapter-node handles any hostname
