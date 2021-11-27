import { HTMLParser, ManifestParser } from './parsers'
import { Manifest } from './types'

function errorResponse(reason?: string) {
  return new Response(JSON.stringify(reason), {
    status: 400,
    statusText: reason,
  })
}

async function getIconEndpoint(params: URL) {
  const req_url = params.searchParams.get('url')
  const url = req_url?.match(/http:\/\/|https:\/\//)
    ? req_url
    : 'https://' + req_url
  if (!req_url) {
    return errorResponse('Missing URL parameter (?url=example.com)')
  }

  // Fetch the desired domain's HTML, following redirects in case of blank redirect page.
  const request = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'User-Agent': 'Favifetch Worker (https://favifetch.workers.dev)',
    },
  })

  // Transform response into text for parsing
  const data = await request.text()
  const info = HTMLParser(data)
  let parsedManifest
  if (info.manifest_url) {
    // Fetch manifest.json
    const getManifest = await fetch(url + info.manifest_url, { method: 'GET' })
    const rawManifest: Manifest = await getManifest.json()
    // Parse and return icons manifest.json
    parsedManifest = await ManifestParser(rawManifest)
  }

  return new Response(
    JSON.stringify({
      manifest_url: info.manifest_url,
      favicon_url: info.icon_url,
      icons: parsedManifest ?? undefined,
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
  } else {
    const html = `Welcome to Favifetch\n\nA web favicon fetcher\n==========\n\nUsage: GET ${params.origin}/get?url=\nExample: GET ${params.origin}/get?url=example.com / ${params.origin}/get?url=https://example.com`
    return new Response(html, {
      status: 200,
      // headers: { 'content-type': 'text/html' },
    })
  }
}
