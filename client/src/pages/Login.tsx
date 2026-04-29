import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { isAxiosError } from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import authServices from "../services/authServices";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthSession } = useAuth();
  const redirectToastShown = useRef(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Login | EStock";
  }, []);

  useEffect(() => {
    const state = location.state as { authMessage?: string } | null;

    if (!state?.authMessage || redirectToastShown.current) {
      return;
    }

    toast.error(state.authMessage);
    redirectToastShown.current = true;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const identifier = username.trim();

    if (!identifier) {
      toast.error("Username atau email wajib diisi");
      return;
    }

    if (!password) {
      toast.error("Password wajib diisi");
      return;
    }

    try {
      setSubmitting(true);

      const response = await authServices.login({
        username: identifier,
        password,
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      setAuthSession({
        accessToken: response.data.accessToken,
        user: response.data.user,
      });

      toast.success("Login berhasil");
      navigate("/products", { replace: true });
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message;
        toast.error(message || "Terjadi kesalahan saat login");
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }

      toast.error("Terjadi kesalahan saat login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-red-50 via-white to-white px-4 py-8 sm:px-6">
      <Toaster position="top-center" />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-2xl border border-red-100 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-red-500 p-2.5 text-white shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
              <p className="text-sm text-slate-500">
                Masuk sebagai super-admin atau staff.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Username atau Email
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-red-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Masukkan username atau email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 pr-12 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 hover:border-red-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition-colors hover:text-red-500"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Lihat password"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {submitting ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
