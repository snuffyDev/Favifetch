import { build } from 'vite'

const run = async () => {
  const root = process.cwd()
  await build({
    root: `${root}/src`,
    clearScreen: false,
    build: {
      emptyOutDir: false,

      outDir: `${root}/dist`,
      rollupOptions: {
        input: `${root}/src/index.ts`,
        output: {
          format: 'iife',
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
        },
      },
    },
  })
}

run()
