/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string; // Legacy: still supported for backward compatibility
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string; // Preferred: use publishable key from Supabase dashboard
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
