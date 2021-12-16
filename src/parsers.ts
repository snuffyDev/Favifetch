import { Manifest } from './types'

export function HTMLParser(text: string, url?: string) {
  // Find the favicon.ico && manifest.json (if exists)
  const manifestRegex =
    /(?!<link.*)rel=["']manifest["'].[^>]*(href=["'](.[^>]*)["'].[^>]*)>/i

  const iconRegex =
    /<link.*rel=["'](?:icon|apple-touch-icon|favicon|shortcut icon)?["'].[^>]*(?:href=["'](.[^>]*)["'].[^>]*)>/i

  const manifestUrl = text.match(manifestRegex)
  const iconUrl = text.match(iconRegex)
  // console.log(iconRegex.exec(text))
  // console.log(iconUrl, manifestUrl)
  if (manifestUrl !== null) {
    return {
      manifest_url: manifestUrl[0].match(
        /(?<=href=")(.*)\.webmanifest|[a-zA-Z0-9/-_/.:]*?\.json+|\\"|"?"[^\\"/>]["]/i,
      )[0],
      icon_url: Array.isArray(iconUrl)
        ? iconUrl[0]
            .match(/(?<=href=["'])(.[^"']*)[^"']/gi)
            .map((str) => str.replace(/href=|"/, '').trim())
        : undefined,
    }
  }
}

export function ManifestParser(manifest: Manifest): {
  name?: string
  theme_color?: string
  manifest_icons?: {
    [key: string]: string
  }[]
} {
  // Sort the manifest.json icons from largest to smallest (512x512, 256x256...)
  const manifest_icons = manifest?.icons?.sort(
    (a, b) =>
      parseInt(b.sizes?.split('x')[0]) - parseInt(a.sizes?.split('x')[0]),
  )
  return {
    name: manifest.name,
    theme_color: manifest?.theme_color,
    manifest_icons,
  }
}
