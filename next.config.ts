import type { NextConfig } from 'next'
const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['sharp', 'opentype.js'],
  // La fuente del motor vectorial debe viajar con las funciones de servidor.
  outputFileTracingIncludes: { '/app/**': ['./node_modules/@fontsource/inter/files/inter-latin-*-normal.woff'] },
}
export default config
