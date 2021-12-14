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
  // console.log(url, req_url)
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
  // console.log(info)
  let parsedManifest = undefined
  let rawManifest: Manifest = undefined
  let ok

  if (info?.manifest_url) {
    // Fetch manifest.json
    // console.log(info?.manifest_url)
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
    )
    rawManifest = await getManifest.json()
    // Parse and return icons manifest.json
    if (getManifest.ok) {
      parsedManifest = await ManifestParser(rawManifest)
      ok = true
    }
  } else {
    ok = true
  }
  if (ok) {
    return new Response(
      JSON.stringify({
        manifest_url: info?.manifest_url ?? undefined,
        favicon_url: info?.icon_url ?? undefined,
        rawManifest,
        icons: parsedManifest ?? undefined,
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      },
    )
  }
  return notFound('error')
}
export async function handleRequest(req: Request): Promise<Response> {
  const params = new URL(req.url)
  if (params.pathname == '/get') {
    return getIconEndpoint(params)
  }
  const html = `<!DOCTYPE html>
<body>
  <h1>Welcome to Favifetch</h1>
  <p>A web icon fetcher.</p>
	<hr>
	<pre>
	<code>
	Usage: GET ${params.origin}/get?url=

	Example: GET ${params.origin}/get?url=example.com / ${params.origin}/get?url=https://example.com
	</code>
	</pre>

	<small><a href="https://github.com/snuffyDev/Favifetch" target="_blank">Github Repository</a></small>
</body>`
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
}
