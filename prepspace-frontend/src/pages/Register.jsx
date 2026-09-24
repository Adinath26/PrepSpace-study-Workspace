import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { IoBookOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Tell us your name.";
    if (!form.email.trim()) return "Enter your email.";
    if (form.password.length < 6) return "Password should be at least 6 characters.";
    if (form.password !== form.confirm) return "Passwords don't match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    try {
      setSubmitting(true);
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success("Account created. Let's set up your first notebook.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't create your account. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
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
            Bring every PDF, note, and past paper into one place.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-paper-100/80">
            Notebooks for every subject. Flashcards and quizzes generated straight from what you upload.
          </p>
        </div>
        <p className="text-xs text-paper-100/50">A study workspace, built for exam season.</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brass-400/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-paper-50/5" />
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine font-display text-base font-semibold text-paper-50">
              Ps
            </span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink-700">Create your account</h2>
          <p className="mt-1.5 text-sm text-ink-500">Start organizing your study material today.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg border border-clay-100 bg-clay-100/60 px-3.5 py-2.5 text-sm text-clay">
                {error}
              </div>
            )}
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" className="input" placeholder="Adinath Kulkarni" value={form.name} onChange={update("name")} autoComplete="name" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" placeholder="you@university.edu" value={form.email} onChange={update("email")} autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={update("password")}
                  autoComplete="new-password"
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
            <div>
              <label className="label" htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={update("confirm")}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-pine hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
