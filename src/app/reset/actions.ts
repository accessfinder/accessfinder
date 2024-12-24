"use server";

import { createClient } from "@/utils/supabase/server";

export async function reset(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.updateUser({
    password: formData.get("password") as string,
  });
}
