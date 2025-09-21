// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = "https://zlaohrqdibnjlavbyoxh.supabase.co"
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsYW9ocnFkaWJuamxhdmJ5b3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0Mzk5MzQsImV4cCI6MjA3NDAxNTkzNH0.W9huCGW2C88_Sg7ccBHpgnf2XYG_WWTnVN7fyd4BJZE"
const service = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsYW9ocnFkaWJuamxhdmJ5b3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQzOTkzNCwiZXhwIjoyMDc0MDE1OTM0fQ.OuK5bwrD0GnnJ4bc3HUwBBxe3jdPnUORWVok0Yub64w"
export const supabase = createClient(
  url!,
  anonKey!
);


export const supabaseServer = createClient(
  url!,
  service!
);