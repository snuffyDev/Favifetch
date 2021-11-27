# Favifetch

A simple API for fetching a website's icons.

## Usage

Make an HTTP GET request to: `https://favifetch.beatbump.workers.dev/get?url=`

Example:

```bash
https://favifetch.beatbump.workers.dev/get?url=github.com
// or with https protocol
https://favifetch.beatbump.workers.dev/get?url=https://github.com
```

## Response

```typescript
{
	"manifest_url": string;
	"favicon_url": string;
	"icons": {"src": string; "sizes": string;}[]
}
```
