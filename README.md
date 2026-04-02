# staubsauger

Cloudflare Worker that posts a weekly YouTube channel stats report to Slack.

Runs every Wednesday at 09:15 CET via cron trigger.

## Stack

- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Effect**: [Effect-ts](https://effect.website) for typed errors, dependency injection, retry logic
- **APIs**: YouTube Data API v3 → Slack Incoming Webhook

## What it does

1. Fetches videos published in the last 30 days via YouTube Search API
2. Fetches view/like counts via YouTube Videos API
3. Sorts by view count, formats a Slack Block Kit message
4. Posts to Slack webhook

## Project structure

```
src/
  config.ts              # AppConfig — reads secrets via Effect Config
  index.ts               # Worker entry point + Layer wiring
  services/
    youtube.ts           # YouTubeService — search + statistics
    slack.ts             # SlackService — webhook POST
  schemas/
    youtube.ts           # YouTube API response schemas + error types
    slack.ts             # SlackWebhookError
  formatters/
    slack-message.ts     # Block Kit message builder
```

## Prerequisites

- Cloudflare account with Workers enabled
- YouTube Data API v3 key ([Google Cloud Console](https://console.cloud.google.com))
- YouTube channel ID
- Slack incoming webhook URL ([Slack API](https://api.slack.com/messaging/webhooks))

## Local development

Create a `.dev.vars` file in the project root with your secrets:

```
YOUTUBE_API_KEY=...
YOUTUBE_CHANNEL_ID=...
SLACK_WEBHOOK_URL=...
```

Then:

```bash
npm install
npm run dev                # wrangler dev
npm run test-scheduled     # trigger cron locally
```

## Secrets

Set via `wrangler secret put <NAME>`:

| Secret | Description |
|--------|-------------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `YOUTUBE_CHANNEL_ID` | Target channel ID (e.g. `UCxxxxx`) |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |

## Deploy

```bash
wrangler deploy
```
