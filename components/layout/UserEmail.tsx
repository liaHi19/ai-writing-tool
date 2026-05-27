import { createClient } from "@/lib/supabase/server";

export async function UserEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <span className="hidden text-xs text-zinc-400 sm:block">{user.email}</span>
  );
}
