/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TMDB_API_KEY: string
    readonly VITE_GOOGLE_BOOKS_API_KEY: string
    readonly VITE_SPOTIFY_CLIENT_ID: string
    readonly VITE_SPOTIFY_CLIENT_SECRET: string
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
