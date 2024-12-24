"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      redirectTo: process.env.DEPLOY_PRIME_URL,
      emailRedirectTo: process.env.DEPLOY_PRIME_URL,
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.log(error)
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
