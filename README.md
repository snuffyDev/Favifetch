# Favifetch

A simple API for fetching a website's icons, as well as metadata from the web app manifest.

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
    "icon_urls"?: string[]       // Array of icon URLs parsed from the HTML
    "manifest_icons"?: {src?: string; purpose?: string; sizes?: string; type?: string}[]   // Array of icons parsed from the webmanifest, if found
    "manifest_url"?: string      // URL Path of the web app manifest, if found
    "name"?: string              // Web app name from the web app manifest
    "theme_color"?: string       // Theme color from the web app manifest
  }
```
