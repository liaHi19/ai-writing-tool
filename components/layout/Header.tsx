import { getInitials } from "@/lib/helpers";
import { fetchHistory } from "@/lib/history";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { HeaderNav } from "./HeaderNav";

export async function Header() {
  const { user } = await getAuthenticatedUser();

  const localPart = user?.email?.split("@")[0] ?? "user";
  const initials = getInitials(localPart);
  const count = user ? (await fetchHistory(user.id)).length : 0;

  return (
    <header className="pt-6">
      <div className="container max-w-6xl grid grid-cols-[1fr_auto_1fr] items-center gap-6 mb-7">
        <div className="flex items-center gap-3">
          <div className="size-7 flex items-center justify-center font-mono font-medium text-[14px] tracking-[-0.02em] bg-(--fg) text-(--bg) rounded-sm">
            P
          </div>
          <div className="flex flex-col leading-none gap-0.75">
            <span className="text-[17px] font-medium tracking-[-0.01em] text-(--fg)">
              Polish
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-(--fg-muted)">
              WRITING
            </span>
          </div>
        </div>

        <HeaderNav
          count={count}
          userLocalPart={localPart}
          initials={initials}
        />
      </div>
    </header>
  );
}
