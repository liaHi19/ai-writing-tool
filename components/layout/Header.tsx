import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "../auth/SignOutButton";
import { UserEmail } from "./UserEmail";

export function Header() {
  return (
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
  );
}
