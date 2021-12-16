import { HTMLParser, ManifestParser } from './parsers'
import { Manifest } from './types'

async function notFound(resp) {
  return new Response(
    `<html>
	<head>
	<title> 404!</title>
	</head>
	<body>404 - ${resp ?? 'the item or page you requested cannot be found'}.</body>
	</html`,
    {
      headers: { 'content-type': 'text/html' },
      status: 404,
      statusText: 'The item or page you requested cannot be found',
    },
  )
}
async function getIconEndpoint(params: URL): Promise<Response> {
  const req_url = params.searchParams.get('url') ?? null
  const url = req_url?.match(/http:\/\/|https:\/\//)
    ? req_url
    : 'https://' + req_url
  if (req_url === null) {
    return notFound('Missing URL parameter (?url=example.com)')
  }

  // Fetch the desired domain's HTML, following redirects in case of blank redirect page.
  const request = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36 Edg/96.0.1054.34',
    },
  })

  // Transform response into text for parsing
  const data = await request.text()
  const info = HTMLParser(data, url)

  let parsedManifest = undefined
  let rawManifest: Manifest = undefined

  let manifest_error
  // Fetch manifest.json & parse it
  if (info?.manifest_url) {
    const getManifest = await fetch(
      info?.manifest_url.includes('https://')
        ? info?.manifest_url
        : `${url}${info?.manifest_url}`,
      {
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36 Edg/96.0.1054.34',
        },
      },
    ).catch((err) => (manifest_error = err))
    rawManifest = await getManifest.json()
    // Parse and return icons manifest.json
    if (getManifest.ok) {
      parsedManifest = await ManifestParser(rawManifest)
    }
  }

  return new Response(
    JSON.stringify({
      manifest_url: info?.manifest_url ?? undefined,
      icon_urls: info?.icon_url ?? undefined,

      ...parsedManifest,
      manifest_error,
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' },
    },
  )
}
export async function handleRequest(req: Request): Promise<Response> {
  const params = new URL(req.url)
  if (params.pathname == '/get') {
    return getIconEndpoint(params)
  }
  const html = `<!DOCTYPE html>
	<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://unpkg.com/marx-css/css/marx.min.css">

	</head>
<body>
<main>
  <h1>Welcome to Favifetch</h1>
  <p>A web icon & webapp manifest fetcher.</p>
	<hr>
	<h2>Using this API</h2>
	<pre>
	<code>
	Usage: GET ${params.origin}/get?url=

	Example:
    GET ${params.origin}/get?url=example.com
    // or
    GET ${params.origin}/get?url=https://example.com
	</code>
	</pre>
	<h3>API Response</h3>
	<pre>
	<code>
	{
		icon_urls?: string[]       // Array of icon URLs parsed from the HTML
		manifest_icons?: {src?: string; purpose?: string; sizes?: string; type?: string}[]   // Array of icons parsed from the webmanifest, if found
		manifest_url?: string      // URL Path of the web app manifest, if found
		name?: string              // Web app name from the web app manifest
		theme_color?: string       // Theme color from the web app manifest
	}
	</code>
	</pre>
	<footer>
	<small><a href="https://github.com/snuffyDev/Favifetch" target="_blank">Github Repository</a> &bull; created by <a href="https://github.com/snuffyDev/" target="_blank">snuffyDev</a></small>
	</footer>
	</main>
	</body>`
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
}
