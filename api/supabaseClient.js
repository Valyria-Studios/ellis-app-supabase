import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const {
  authSupabaseUrl,
  authSupabaseAnonKey,
  dataSupabaseUrl,
  dataSupabaseAnonKey,
} = Constants.expoConfig.extra;

export const authSupabase = createClient(authSupabaseUrl, authSupabaseAnonKey);
export const dataSupabase = createClient(dataSupabaseUrl, dataSupabaseAnonKey);
