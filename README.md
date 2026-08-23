# LLM Gateway

A production-style backend gateway that routes chat completion requests across multiple LLM providers (OpenAI, Groq, Ollama), with authentication, rate limiting, automatic failover, response caching, and cost tracking.

## Why this project

Companies running multiple internal apps that each call LLM providers directly face real problems: untracked costs across teams, no resilience when a provider goes down, and API keys scattered across codebases. This Gateway centralizes all of that behind a single, secure entry point.
## Architecture

Client -> Auth Middleware -> Rate Limiter -> Cache Check -> Provider Router -> LLM Provider
                                                                  (on failure)
                                                             Fallback Provider
                                                                  |
                                                          Usage Logger (MongoDB)

## Features

- **Multi-provider routing** — requests are routed to OpenAI, Groq, or Ollama based on the requested model, behind a single unified interface (`LLMProvider`)
- **Automatic failover** — if the primary provider fails, the Gateway automatically retries with a fallback provider, transparently to the client
- **API key authentication** — every request is authenticated against keys stored in MongoDB
- **Rate limiting** — per-key request limits protect against runaway costs from bugs or abuse
- **Response caching** — identical requests are served from an in-memory cache, reducing cost and latency
- **Cost tracking** — every request is logged with token counts and calculated cost, queryable via `GET /v1/usage`

## Tech stack

- Node.js, Express, TypeScript
- MongoDB Atlas (persistence for API keys and usage logs)
- Providers: OpenAI, Groq (cloud, free tier), Ollama (local, free)

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas connection string (free tier)
- At least one provider API key (Groq offers a free tier, no credit card required)

### Installation

```bash
git clone <repo-url>
cd llm-gateway
npm install
```

### Configuration

Create a `.env` file based on `.env.example`:
### Run

```bash
npm run dev
```

### Seed initial API keys

```bash
npx ts-node src/scripts/seedApiKeys.ts
```

## API

### `POST /v1/chat/completions`

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer sk-gateway-support-001" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-oss-20b","messages":[{"role":"user","content":"Hello"}]}'
```

### `GET /v1/usage`

Returns aggregated cost and token usage for the authenticated API key.

```bash
curl http://localhost:3000/v1/usage \
  -H "Authorization: Bearer sk-gateway-support-001"
```

## Testing without a paid API key

This project is designed to run entirely for free:
- Set `PROVIDER` to Groq or Ollama models to avoid OpenAI costs entirely
- Groq's free tier requires no credit card
- Ollama runs models locally with zero API cost

## Design decisions

- **Interface-driven providers**: all providers implement the same `LLMProvider` interface, so adding a new provider (e.g. Anthropic) requires no changes to routing, auth, or logging logic
- **MongoDB Atlas over local MongoDB**: reflects how most modern backend teams operate — managed cloud databases over self-hosted instances
- **In-memory cache and rate limiting**: simple to reason about for a single-instance deployment; a Redis-backed version would be the next step for horizontal scaling
