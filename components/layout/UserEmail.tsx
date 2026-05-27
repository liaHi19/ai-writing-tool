import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function UserEmail() {
  const { user } = await getAuthenticatedUser();

  if (!user) return null;

  return (
    <span className="hidden text-xs text-zinc-400 sm:block">{user.email}</span>
  );
}
