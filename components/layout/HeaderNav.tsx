"use client";

import { signOut } from "@/actions/auth";
import { HEADER_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

type Props = {
  count: number;
  userLocalPart: string;
  initials: string;
};

export function HeaderNav({ count, userLocalPart, initials }: Props) {
  const pathname = usePathname();
  const isWrite = pathname === "/";
  const isHistory = pathname === "/history";

  return (
    <>
      {/* Middle: segmented pill tabs */}
      <nav className="inline-flex rounded-full p-1 gap-0.5 bg-(--surface) border border-border">
        <Link
          href="/"
          data-on={isWrite}
          aria-current={isWrite ? "page" : undefined}
          className={cn(
            "flex items-center gap-2 px-4 py-1.75 rounded-full text-[13px] font-medium tracking-[-0.005em] transition-colors duration-120",
            isWrite
              ? "bg-(--fg) text-(--bg)"
              : "text-(--fg-muted) hover:text-(--fg)",
          )}
        >
          <Icon d={HEADER_ICONS.write} />
          Write
        </Link>
        <Link
          href="/history"
          data-on={isHistory}
          aria-current={isHistory ? "page" : undefined}
          className={cn(
            "flex items-center gap-2 px-4 py-1.75 rounded-full text-[13px] font-medium tracking-[-0.005em] transition-colors duration-120",
            isHistory
              ? "bg-(--fg) text-(--bg)"
              : "text-(--fg-muted) hover:text-(--fg)",
          )}
        >
          <Icon d={HEADER_ICONS.history} />
          History
          <span
            className={cn(
              "font-mono text-[10px] px-1.5 py-px rounded-full tracking-[0.04em]",
              isHistory
                ? "bg-white/16 text-(--bg)"
                : "bg-(--surface-2) text-(--fg-muted)",
            )}
          >
            {count}
          </span>
        </Link>
      </nav>

      {/* Right: meta string + user chip + sign-out */}
      <div className="flex items-center justify-end gap-3">
        <span className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.08em] text-(--fg-muted)">
          {/* mode is getting from mode selector in the future */}
          {isHistory ? `${count} ENTRIES` : "IMPROVE MODE"}
        </span>
        <div className="inline-flex items-center gap-2.5 rounded-full bg-(--surface) border border-border py-1 px-3">
          <span className="text-[13px] font-medium text-(--fg)">
            {userLocalPart}
          </span>
          <div className="size-7 rounded-full flex items-center justify-center font-mono text-[11px] font-medium bg-(--fg) text-(--bg)">
            {initials}
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            title="Sign out"
            className="size-7 rounded-full flex items-center justify-center transition-colors duration-120 text-(--fg-muted) hover:bg-(--surface-2) hover:text-(--fg) cursor-pointer"
          >
            <Icon d={HEADER_ICONS.signout} />
          </button>
        </form>
      </div>
    </>
  );
}
