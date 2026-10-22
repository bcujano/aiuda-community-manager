export const dynamic = 'force-dynamic'

// Solo booleanos: dice si las variables existen, nunca sus valores.
export function GET() {
  return Response.json({
    ok: true,
    servicio: 'aiuda',
    config: {
      supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabase_servidor: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      url_app: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      cifrado: Boolean(process.env.APP_ENCRYPTION_KEY),
      instagram: Boolean(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET),
    },
  })
}
