"use server";

import { createClient } from "@/utils/supabase/server";

export async function forgot(formData: FormData) {
  const supabase = await createClient();
  const options = {
    redirectTo: process.env.SITE_URL,
  };
  await supabase.auth.resetPasswordForEmail(
    formData.get("email") as string,
    options,
  );
}
