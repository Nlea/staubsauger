# Learning Goals

> Project: YouTube Stats → Slack Bot (Cloudflare Worker)
> Created: 2026-03-31
> Last updated: 2026-03-31

## Goals

### 1. Services & Layers

- **Description**: Verstehen wie Effect Dependency Injection funktioniert — Services definieren, als Layer bereitstellen und zusammenstecken
- **Related concepts**: Effect.Service, Layer, Layer.mergeAll, Context
- **Current level**: beginner
- **Target level**: confident
- **DIY task IDs**: YT-gtefimjd, YT-nrhkydiz, YT-ldplnphh

### 2. Schema & Fehlerbehandlung

- **Description**: API Responses typsicher validieren mit Schema, und Fehler als eigene Typen modellieren mit Data.TaggedError
- **Related concepts**: Schema.Struct, Schema.decodeUnknown, Data.TaggedError, Effect.catchTag
- **Current level**: beginner
- **Target level**: confident
- **DIY task IDs**: YT-gtefimjd, YT-ldplnphh

### 3. HttpClient & Config

- **Description**: HTTP Calls mit dem Effect HttpClient machen (statt fetch), und Konfiguration typsicher über Effect Config verwalten
- **Related concepts**: HttpClient, HttpClientRequest, Config.string, Config.all
- **Current level**: beginner
- **Target level**: confident
- **DIY task IDs**: YT-tspwguzb, YT-gtefimjd

### 4. Concurrency & Schedule

- **Description**: Mehrere API Calls parallel ausführen mit Effect.all, und Retry-Logik mit Schedule bauen
- **Related concepts**: Effect.all, Schedule.exponential, Effect.retry, Effect.runPromise
- **Current level**: beginner
- **Target level**: confident
- **DIY task IDs**: YT-peaezhxx, YT-voywtvjs

## Session Notes

### 2026-03-31 — YT-gtefimjd: YouTubeService (Phase 1)

#### Layer Composition: `mergeAll` vs `provide`

Using `Layer.mergeAll` to combine a config provider with a service layer **doesn't work** if the service depends on config at initialization time. Both layers are built in parallel, so the service starts before the config provider is in scope.

Fix: use `Layer.provide` to explicitly nest the dependency:
```ts
// Wrong — service and config provider are peers:
Layer.mergeAll(Layer.setConfigProvider(provider), YouTubeService.Default)

// Correct — config provider is available when service initializes:
Layer.provide(YouTubeService.Default, Layer.setConfigProvider(provider))
```

#### Cloudflare Worker `env` is not a plain object

`Object.entries(env)` returns nothing because Cloudflare Worker env properties are not enumerable. Explicitly map each key:
```ts
// Wrong:
ConfigProvider.fromMap(new Map(Object.entries(env)))

// Correct:
ConfigProvider.fromMap(new Map([
  ["YOUTUBE_API_KEY", env.YOUTUBE_API_KEY],
  ["SLACK_WEBHOOK_URL", env.SLACK_WEBHOOK_URL],
  ["YOUTUBE_CHANNEL_ID", env.YOUTUBE_CHANNEL_ID],
]))
```

#### YouTube Search API Response → Effect Schema

The actual JSON from `GET /youtube/v3/search?part=snippet&channelId=...`:

```json
{
  "items": [
    {
      "id": {
        "kind": "youtube#video",
        "videoId": "ylTOP-VF80E"
      },
      "snippet": {
        "title": "Video Title",
        "publishedAt": "2026-03-28T10:00:00Z",
        "description": "..."
      }
    }
  ]
}
```

Note: `id` is a **nested object**, not a plain string. The matching Effect schema:

```ts
export const VideoSchema = Schema.Struct({
  id: Schema.Struct({
    kind: Schema.String,
    videoId: Schema.String,
  }),
  snippet: Schema.Struct({
    title: Schema.String,
    publishedAt: Schema.String,
    description: Schema.String,
  }),
})
```

`statistics` and `contentDetails` are **not** returned by the search endpoint — those require a second call to `GET /youtube/v3/videos?part=statistics,contentDetails&id=...`.

#### Local testing URL for scheduled workers

```
http://localhost:8787/cdn-cgi/handler/scheduled
```

---

## Skill Level Definitions

| Level | Meaning |
|-------|---------|
| beginner | Haven't used this before, need guidance |
| familiar | Have seen it, could follow along but not write from scratch |
| intermediate | Can implement with occasional reference to docs |
| confident | Can implement, debug, and explain to others |
