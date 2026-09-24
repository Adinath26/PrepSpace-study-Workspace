import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { IoBookOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Enter your email and password to continue.");
      return;
    }
    try {
      setSubmitting(true);
      await login(form);
      toast.success("Welcome back.");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't sign you in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Editorial side panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-pine-700 p-12 text-paper-50 lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-paper-50/10 font-display text-base font-semibold">
            Ps
          </span>
          <span className="font-display text-xl font-semibold">PrepSpace</span>
        </div>
        <div>
          <IoBookOutline size={36} className="mb-6 text-brass-400" />
          <h1 className="max-w-md font-display text-4xl leading-tight">
            Your notes, your PDFs, and an assistant that's actually read them.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-paper-100/80">
            Organize study material into notebooks, then ask questions grounded in exactly what you uploaded.
          </p>
        </div>
        <p className="text-xs text-paper-100/50">A study workspace, built for exam season.</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brass-400/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-paper-50/5" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine font-display text-base font-semibold text-paper-50">
              Ps
            </span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink-700">Welcome back</h2>
          <p className="mt-1.5 text-sm text-ink-500">Sign in to get back to your notebooks.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg border border-clay-100 bg-clay-100/60 px-3.5 py-2.5 text-sm text-clay">
                {error}
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@university.edu"
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update("password")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <IoEyeOffOutline size={17} /> : <IoEyeOutline size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New to PrepSpace?{" "}
            <Link to="/register" className="font-semibold text-pine hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
