import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** @deprecated Use `createClient` from `@/lib/supabase/client` (browser) or `@/lib/supabase/server` (server) instead */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Re-export the new browser client factory for gradual migration
export { createClient } from "@/lib/supabase/client";
