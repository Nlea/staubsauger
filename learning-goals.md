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

## Skill Level Definitions

| Level | Meaning |
|-------|---------|
| beginner | Haven't used this before, need guidance |
| familiar | Have seen it, could follow along but not write from scratch |
| intermediate | Can implement with occasional reference to docs |
| confident | Can implement, debug, and explain to others |
