"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Coding from "@/LottieFiles/anims/Coding";
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showSignup, setShowSignup] = useState(false);
  const [name, setName] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  const redirectByRole = (role: string) => {
    if (role === "admin" || role === "superadmin")
      return router.replace("/admin");
    if (role === "teacher") return router.replace("/teacher");
    return router.replace("/student");
  };

  useEffect(() => {
    // If already logged in, redirect to their dashboard
    fetch("/api/auth/me")
      .then(async (r) => {
        const data = await r.json();
        if (data?.user?.role) redirectByRole(data.user.role);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      redirectByRole(data.role);
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSignupLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      redirectByRole(data.role);
    } catch (err: any) {
      setError(err.message || "Signup failed");
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans">
      <div
        className="w-full max-w-4xl bg-card shadow-xl rounded-xl flex overflow-hidden animate-in fade-in duration-500"
        style={{ minHeight: 500 }}
      >
        {/* Left: Lottie animation */}
        <div className="w-full md:w-1/2 hidden md:flex items-center justify-center bg-primary dark:bg-sidebar p-10 relative">
          <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-4">
            <div className="w-64 md:w-72">
              <Coding />
            </div>
            <div className="text-xl text-primary-foreground font-semibold tracking-tight mt-4 animate-in fade-in slide-in-from-bottom duration-700 select-none">
              Welcome To
            </div>
            <div className="text-3xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-400 to-red-500 animate-gradient">
              EDU-<span className="text-red-600">XIE</span>
            </div>
          </div>
        </div>
        {/* Right: Login Form */}
        <div className="flex-1 flex items-center justify-center bg-background p-8 md:p-12 animate-in fade-in slide-in-from-right duration-700">
          <form
            onSubmit={showSignup ? onSignup : onLogin}
            className="w-full max-w-sm mx-auto flex flex-col gap-6 animate-fadeInUp"
            style={{ minWidth: 300 }}
          >
            <h2 className="text-2xl md:text-3xl text-center font-bold text-primary mb-2">
              {showSignup ? "Create Account" : "Welcome Back!"}
            </h2>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2 animate-in fade-in duration-700 delay-100">
              {showSignup && (
                <>
                  <label
                    htmlFor="name"
                    className="font-medium text-sm ml-1 text-muted-foreground uppercase tracking-wide"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    className="px-4 py-2 rounded-md bg-input border border-border focus:ring-2 focus:ring-ring outline-none transition-all text-base"
                    required={showSignup}
                    disabled={loading || signupLoading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ fontFamily: "var(--font-sans)" }}
                  />
                </>
              )}
              <label
                htmlFor="email"
                className="font-medium text-sm ml-1 text-muted-foreground uppercase tracking-wide"
              >
                Email ID
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="username"
                className="px-4 py-2 rounded-md bg-input border border-border focus:ring-2 focus:ring-ring outline-none transition-all text-base"
                required
                disabled={loading || signupLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontFamily: "var(--font-sans)" }}
              />
            </div>
            <div className="flex flex-col gap-2 animate-in fade-in duration-700 delay-150">
              <label
                htmlFor="password"
                className="font-medium text-sm ml-1 text-muted-foreground uppercase tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="********"
                autoComplete="current-password"
                className="px-4 py-2 rounded-md bg-input border border-border focus:ring-2 focus:ring-ring outline-none transition-all text-base"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontFamily: "var(--font-sans)" }}
              />
              <a
                href="/forgot-password"
                className="w-fit ml-auto text-xs text-blue-600 hover:underline mt-1 transition-colors"
              >
                Forgot Password?
              </a>
            </div>
            <Button
              type="submit"
              className="mt-4 w-full h-12 text-lg font-bold shadow-md transition-all active:scale-[.98] focus:ring-2 focus:ring-ring focus:outline-none"
              size="lg"
              disabled={loading || signupLoading}
            >
              {(loading || signupLoading) ? (
                <Skeleton className="w-1/2 h-6 mx-auto" />
              ) : showSignup ? (
                "Create Account"
              ) : (
                "Log In"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {showSignup ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setShowSignup(false); setError(''); }}
                    className="text-blue-600 hover:underline"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setShowSignup(true); setError(''); }}
                    className="text-blue-600 hover:underline"
                  >
                    Create one
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
