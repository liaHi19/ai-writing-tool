import { Header } from "@/components/layout/Header";
import { ModeProvider } from "@/providers/ModeProvider";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
      </div>
    </ModeProvider>
  );
}
