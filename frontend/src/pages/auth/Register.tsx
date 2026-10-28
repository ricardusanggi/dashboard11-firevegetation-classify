//path:  frontend/src/pages/auth/Register.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import {
  User,
  Mail,
  Lock,
  LockKeyhole,
  Eye,
  EyeOff,
  Leaf,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  /* ================= FIX TRAINING LOCK ================= */

  useEffect(() => {
    document.body.classList.remove("training-locked");
  }, []);

  /* ================= DEVICE DETECTION ================= */

  const [lowPerformance, setLowPerformance] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches || reducedMotion.matches) {
      setLowPerformance(true);
    }
  }, []);

  /* ================= STATE ================= */

  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirm_password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showPendingNotice, setShowPendingNotice] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= EMAIL VALIDATION ================= */

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ================= PASSWORD STRENGTH ================= */

  function getPasswordStrength(pw: string) {
    if (pw.length < 6) return 0;
    if (pw.length < 10) return 1;
    return 2;
  }

  /* ================= USERNAME CHECK ================= */

  useEffect(() => {
    if (!form.username) return;

    setCheckingUsername(true);
    setUsernameAvailable(null);

    const delay = setTimeout(async () => {
      try {
        const res = await api.get(`/users/check-username?username=${form.username}`);
        setUsernameAvailable(!res.data.exists);
      } catch {
        setUsernameAvailable(null);
      }

      setCheckingUsername(false);
    }, 500);

    return () => clearTimeout(delay);
  }, [form.username]);

  /* ================= EMAIL CHECK ================= */

  useEffect(() => {
    if (!form.email) return;

    const delay = setTimeout(async () => {
      try {
        const res = await api.get(`/users/check-email?email=${form.email}`);
        setEmailAvailable(!res.data.exists);
      } catch {
        setEmailAvailable(null);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [form.email]);

  /* ================= VALIDATION ================= */

  useEffect(() => {
    setErrors({
      email: form.email && !validateEmail(form.email) ? "Format email tidak valid" : "",
      password: validateStrongPassword(form.password),
      confirm_password:
        form.confirm_password !== form.password ? "Konfirmasi password tidak cocok" : "",
      full_name: !form.full_name.trim() ? "Nama lengkap wajib diisi" : ""
    });
  }, [form]);

  /* ================= FORM VALID ================= */

  const formValid =
    usernameAvailable === true &&
    emailAvailable === true &&
    !errors.email &&
    !errors.password &&
    !errors.confirm_password &&
    !errors.full_name &&
    agree;

  /* ================= REGISTER ================= */

  async function register() {
    if (!formValid) return;

    try {
      setLoading(true);

      await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        full_name: form.full_name,
        password: form.password
      });

      // tampilkan modal informasi pending review
      setShowPendingNotice(true);

    } catch (err: any) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        alert(detail.map((d: any) => d.msg).join(", "));
      } else {
        alert(detail || "Registrasi gagal");
      }

    } finally {
      setLoading(false);
    }
  }

  const strength = getPasswordStrength(form.password);
  const strengthColors = ["bg-red-400", "bg-green-400", "bg-green-500"];

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-emerald-900 to-orange-700 relative overflow-hidden">

      {/* BACK BUTTON */}

      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
      >
        <ArrowLeft size={18} />
        Kembali ke Beranda
      </Link>

      {/* BACKGROUND GLOW hanya jika device kuat */}

      {!lowPerformance && (
        <>
          <div className="absolute w-[650px] h-[650px] bg-green-500/20 blur-[140px] rounded-full top-[-200px] left-[-200px]" />
          <div className="absolute w-[550px] h-[550px] bg-yellow-500/20 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
        </>
      )}

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white">

        {/* TITLE */}

        <div className="flex items-center justify-center gap-3 mb-4">
          <Leaf className="w-8 h-8 text-green-300" />
          <h2 className="text-3xl font-bold tracking-wide">
            Klasifikasi Citra Vegetasi
          </h2>
        </div>

        <p className="text-center text-sm text-white/80 mb-6 leading-relaxed">
          Daftar sebagai kontributor untuk membantu pengembangan dataset
          citra jenis <b>vegetasi</b> serta meningkatkan performa model klasifikasi
          berbasis <b>Kecerdasan Artifisial</b> menggunakan <b> Deep Learning</b>.
        </p>

        {/* FORM */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            register();
          }}
          className="space-y-4"
        >

          {/* USERNAME */}
          <Input
            icon={<User />}
            placeholder="Username"
            value={form.username}
            onChange={(v: string) => setForm({ ...form, username: v })}
            disabled={loading}
          />

          {checkingUsername && (
            <p className="text-xs text-white/70">Mengecek username...</p>
          )}
          {usernameAvailable === false && <ErrorText text="Username sudah digunakan" />}
          {usernameAvailable && <SuccessText text="Username tersedia" />}

          {/* EMAIL */}
          <Input
            icon={<Mail />}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(v: string) => setForm({ ...form, email: v })}
            disabled={loading}
          />
          {errors.email && <ErrorText text={errors.email} />}
          {emailAvailable === false && <ErrorText text="Email sudah digunakan" />}

          {/* FULL NAME */}
          <Input
            icon={<User />}
            placeholder="Nama Lengkap"
            value={form.full_name}
            onChange={(v: string) => setForm({ ...form, full_name: v })}
            disabled={loading}
          />

          {errors.full_name && <ErrorText text={errors.full_name} />}

          {/* PASSWORD */}
          <Input
            icon={<Lock />}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            rightIcon={
              showPassword ? (
                <EyeOff className="cursor-pointer" onClick={() => setShowPassword(false)} />
              ) : (
                <Eye className="cursor-pointer" onClick={() => setShowPassword(true)} />
              )
            }
            onChange={(v: string) => setForm({ ...form, password: v })}
            disabled={loading}
          />

          {form.password && (
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
                style={{ width: `${(strength + 1) * 33}%` }}
              />
            </div>
          )}

          {errors.password && <ErrorText text={errors.password} />}

          {/* CONFIRM PASSWORD */}
          <Input
            icon={<LockKeyhole />}
            type={showConfirm ? "text" : "password"}
            placeholder="Konfirmasi Password"
            value={form.confirm_password}
            rightIcon={
              showConfirm ? (
                <EyeOff className="cursor-pointer" onClick={() => setShowConfirm(false)} />
              ) : (
                <Eye className="cursor-pointer" onClick={() => setShowConfirm(true)} />
              )
            }
            onChange={(v: string) => setForm({ ...form, confirm_password: v })}
            disabled={loading}
          />

          {errors.confirm_password && <ErrorText text={errors.confirm_password} />}

          {/* TERMS */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="accent-green-500 w-4 h-4"
            />
            <span className="text-sm">Saya menyetujui Syarat dan Ketentuan</span>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={!formValid || loading}
            className={`w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-400 hover:to-yellow-400 shadow-lg transition-all disabled:opacity-40 ${!lowPerformance ? "hover:shadow-xl hover:scale-[1.02]" : ""}`}
          >
            {loading ? "Membuat akun..." : "Daftar"}
          </button>
        </form>

        {/* FOOTER */}

        <div className="text-center text-sm text-white/70 mt-6">
          Sudah memiliki akun?
          <Link
            to="/login"
            className="ml-1 font-semibold text-green-200 hover:text-white transition underline"
          >
            Login
          </Link>
        </div>
      </div>
      {showPendingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="bg-white text-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center">

            <Leaf className="mx-auto mb-4 text-green-500 w-10 h-10" />

            <h3 className="text-xl font-semibold mb-2">
              Registrasi Berhasil
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Akun Anda telah berhasil dibuat.  
              Untuk menjaga kualitas dataset, setiap akun kontributor
              akan melalui proses <b>review oleh administrator</b> sebelum
              dapat mengunggah dataset dan berkontribusi pada sistem.
            </p>

            <p className="text-sm text-slate-600 mb-6">
              Silakan menunggu hingga akun Anda disetujui oleh reviewer.
            </p>

            <button
              onClick={() => {
                setShowPendingNotice(false);
                navigate("/login");
              }}
              className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black font-semibold transition"
            >
              Kembali ke Login
            </button>

          </div>

        </div>
      )}
    </div>
  );
}

/* ================= INPUT COMPONENT ================= */

function Input({
  icon,
  rightIcon,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled
}: any) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-3 text-white/60">{icon}</div>
      {rightIcon && (
        <div className="absolute right-4 top-3 text-white/60">{rightIcon}</div>
      )}
      <input
        type={type}
        autoComplete={type === "password" ? "new-password" : "username"}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-green-400/60 outline-none transition"
      />
    </div>
  );
}

/* ================= ERROR TEXT ================= */

function ErrorText({ text }: { text: string }) {
  return (
    <p className="text-xs text-red-300 flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3" />
      {text}
    </p>
  );
}

/* ================= SUCCESS TEXT ================= */

function SuccessText({ text }: { text: string }) {
  return <p className="text-xs text-green-300 mt-1">{text}</p>;
}

/* ================= PASSWORD VALIDATION ================= */

function validateStrongPassword(password: string) {
  if (password.length < 8) return "Minimal 8 karakter";
  if (!/[A-Z]/.test(password)) return "Harus ada huruf besar";
  if (!/[a-z]/.test(password)) return "Harus ada huruf kecil";
  if (!/[0-9]/.test(password)) return "Harus ada angka";
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return "Harus ada simbol";
  return "";
}