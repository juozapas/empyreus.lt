# Go-live runbook — empyreus.lt

## 1. DNS (Cloudflare, zone empyreus.lt)

All records **DNS only** (grey cloud). A proxied record stops GitHub from issuing the certificate.

| Type  | Name | Content              |
|-------|------|----------------------|
| A     | @    | 185.199.108.153      |
| A     | @    | 185.199.109.153      |
| A     | @    | 185.199.110.153      |
| A     | @    | 185.199.111.153      |
| AAAA  | @    | 2606:50c0:8000::153  |
| AAAA  | @    | 2606:50c0:8001::153  |
| AAAA  | @    | 2606:50c0:8002::153  |
| AAAA  | @    | 2606:50c0:8003::153  |
| CNAME | www  | juozapas.github.io   |

Leave MX and mail records to the email setup.

## 2. Wait for DNS

```bash
dig +short empyreus.lt NS        # Cloudflare nameservers
dig +short empyreus.lt A         # the four 185.199.x.153 addresses
dig +short www.empyreus.lt CNAME # juozapas.github.io.
```

## 3. Custom domain on GitHub Pages (only after step 2 resolves)

```bash
gh api -X PUT repos/juozapas/empyreus.lt/pages -f cname=empyreus.lt
gh api repos/juozapas/empyreus.lt/pages --jq '.https_certificate.state'   # poll until "approved"
gh api -X PUT repos/juozapas/empyreus.lt/pages -F https_enforced=true
gh api repos/juozapas/empyreus.lt/pages/health                            # call twice; first returns 202
```

If the certificate state stays `null` for more than a few minutes, GitHub attempted issuance before DNS
resolved. Unset and re-set the domain:

```bash
echo '{"cname": null}' | gh api -X PUT repos/juozapas/empyreus.lt/pages --input -
gh api -X PUT repos/juozapas/empyreus.lt/pages -f cname=empyreus.lt
```

## 4. Verify from outside

```bash
curl -sI https://empyreus.lt/ | head -1          # 200
curl -sI https://empyreus.lt/privacy | head -1   # 200
curl -sI https://empyreus.lt/nope | head -1      # 404
curl -sI https://www.empyreus.lt/ | grep -i location   # https://empyreus.lt/
curl -sI http://empyreus.lt/ | grep -i location        # https://empyreus.lt/
```

## 5. Apple

Resubmit the organization enrollment with `https://empyreus.lt`, using an `@empyreus.lt` contact address.

## Done

- 2026-09-12: DNS records created in Cloudflare (4 A, 4 AAAA, www CNAME, all DNS-only) via the Cloudflare API MCP server; existing Google Workspace MX/SPF/DKIM untouched.
- 2026-09-12: custom domain set, Let's Encrypt certificate approved within a minute (covers empyreus.lt and www.empyreus.lt), HTTPS enforced.
- Verified from outside: `/` and `/privacy` 200, `/nope` serves the 404 page, `www` and plain `http` 301 to `https://empyreus.lt/`.
