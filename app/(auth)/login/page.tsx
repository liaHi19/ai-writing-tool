import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Brand block */}
      <div className="flex items-center gap-3 mb-8">
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

      {/* Bento card */}
      <div className="w-full max-w-sm bg-(--surface) border border-border rounded-(--radius) p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-(--fg-muted)">
            Enter your email and password to continue
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-(--fg-muted)">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="underline underline-offset-4 hover:text-(--fg)"
          >
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
