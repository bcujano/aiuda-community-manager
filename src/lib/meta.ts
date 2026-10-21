// Una sola constante de versión de Graph (verificar la vigente en developers.facebook.com).
export const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v22.0'
export const IG_GRAPH = 'https://graph.instagram.com'
export const IG_OAUTH = 'https://www.instagram.com/oauth/authorize'
export const IG_TOKEN = 'https://api.instagram.com/oauth/access_token'

// Instagram Login (ruta A): sin Página de Facebook. Los DMs requieren Advanced Access (App Review).
export const IG_SCOPES = [
  'instagram_business_basic',
  'instagram_business_content_publish',
  'instagram_business_manage_comments',
  'instagram_business_manage_insights',
]

export function appUrl(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL
  if (!u) throw new Error('Falta NEXT_PUBLIC_APP_URL')
  return u.replace(/\/$/, '')
}
