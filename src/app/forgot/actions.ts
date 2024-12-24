import { createClient } from "@/utils/supabase/server";

export async function forgot(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    formData.get("email") as string,
  );
}
