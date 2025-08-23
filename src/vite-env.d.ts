/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_OFFLINE_MODE: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_ITEMS_PER_PAGE: string
  readonly VITE_REFRESH_INTERVAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}