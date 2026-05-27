import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";

async function UserEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <span className="hidden text-xs text-zinc-400 sm:block">{user.email}</span>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <nav className="flex gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-zinc-700 transition-colors hover:text-zinc-900"
            >
              Editor
            </Link>
            <Link
              href="/history"
              className="text-zinc-700 transition-colors hover:text-zinc-900"
            >
              History
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Suspense fallback={null}>
              <UserEmail />
            </Suspense>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
