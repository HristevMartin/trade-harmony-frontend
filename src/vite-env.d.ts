/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_TRAVEL_SECURITY: string
  // add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}