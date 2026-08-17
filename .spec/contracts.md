# Contracts

Interfaces between independently-deployed components in this repo.
Root-owned: a breaking change to anything here is proposed here first,
before the components on either side of it change. See
[spec strategy](../docs/content/sdd/spec-strategy.md) for why this file
exists and what's still deferred.

## `apps/web` ↔ `apps/api`

### `POST /api/chat` (on `apps/api`)

**Request**

```json
{
  "messages": [
    { "role": "user" | "assistant", "content": "string" }
  ]
}
```

- 1–24 messages.
- Each `content`: non-empty after trim, ≤4,000 characters.
- The final message must have `role: "user"`.

**Response**

`text/event-stream` — the raw streamed output of the Workers AI model
call, forwarded byte-for-byte. No response schema beyond "valid SSE."

**Auth (two checks, only one of which is real security)**

- `Origin` header must equal the `WEB_ORIGIN` variable. Spoofable by any
  non-browser caller — this is a weak check, not the actual gate.
- `x-airton-api-token` header must equal the `API_ACCESS_TOKEN` secret.
  This is the real gate. It must be set to the exact same value as
  `apps/web`'s `NUXT_AIRTON_API_TOKEN` — if they drift out of sync, every
  chat request 401s.

### `apps/web`'s side of this contract

`server/api/chat.post.ts` requires an authenticated session
(`requireUserSession`) before it will proxy a request through. It doesn't
transform the request or response — it attaches the token header and
passes both through unchanged.

## `apps/web` ↔ scraper orchestration

Not built yet. This is next: Activity 01 phase 2 is the BFF endpoints on
`apps/web` (`POST /api/scrapes`, `GET /api/scrapes/:scrape_id`) that talk
to whatever orchestrates scraping (see
[Activity 01 deep dive](../docs/content/roadmap/activity-01/deep_dive.md)
for the current design). This section gets filled in when that contract
is actually decided — before the endpoints are implemented, not after.
