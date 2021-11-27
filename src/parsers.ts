import { Manifest } from './types'

export function HTMLParser(text: string) {
  // Find the favicon.ico && manifest.json (if exists)
  const manifestRegex =
    /(?!<link(?:[^>]*?)href[\s]?=[\s]?[\'\"\\\]*]")(\/manifest\.json)/
  const iconRegex =
    /(?!<link(?:[^>]*?)href[\s]?=[\s]?[\'\"\\\]*]")(\/favicon\.ico)/

  const manifestUrl = text.match(manifestRegex) || ''
  const iconUrl = text.match(iconRegex) || ''
  return { manifest_url: manifestUrl[0], icon_url: iconUrl[0] }
}

export function ManifestParser(manifest: Manifest) {
  // Sort the manifest.json icons from largest to smallest (512x512, 256x256...)
  const icons = manifest?.icons?.sort(
    (a, b) =>
      parseInt(b.sizes?.split('x')[0]) - parseInt(a.sizes?.split('x')[0]),
  )
  return icons
}
