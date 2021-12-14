export interface Manifest {
  background_color?: string
  theme_color?: string
  name?: string
  short_name?: string
  display?: string
  description?: string
  start_url?: string
  shortcuts?: Shortcut[]
  icons?: { [key: string]: string }[]
}

interface Shortcut {
  name?: string
  url?: string
  description?: string
}
