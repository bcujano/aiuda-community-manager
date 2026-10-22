// AiUDA CM vive en su propio esquema: el proyecto de Supabase ya contiene otra app en `public` y no se toca.
export const ESQUEMA_DB = process.env.NEXT_PUBLIC_DB_SCHEMA || 'aiuda_cm'
