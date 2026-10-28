// frontend/src/components/navbar/PublicNavbar.tsx
import { Link } from "react-router-dom";
import { LogIn, UserPlus, Leaf } from "lucide-react";
import { useEffect, useState } from "react";

export default function PublicNavbar() {

  const [lowPerformance, setLowPerformance] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches || reducedMotion.matches) {
      setLowPerformance(true);
    }
  }, []);

  return (
    <div
      className="
        navbar backdrop-blur-lg bg-white/70
        border-b border-green-200
        sticky top-0 z-50 shadow-sm
        dark:bg-slate-900/70 dark:border-slate-700
      "
    >
      <div className="flex-1">
        <Link
          to="/"
          className="
            flex items-center gap-2
            text-2xl font-extrabold text-green-600
            hover:text-green-700 transition
            dark:text-green-400 dark:hover:text-green-300
          "
        >
          <Leaf size={26} />
          Kenali Vegetasi
        </Link>
      </div>

      {/* ACTION BUTTONS */}
      <div
        className="
          flex flex-row items-center flex-nowrap
          gap-1 sm:gap-2 md:gap-4 lg:gap-6
        "
      >
        <Link
          to="/login"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full
            bg-slate-200 text-slate-700
            hover:bg-slate-300
            transition-all shadow-sm whitespace-nowrap
            dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600
            ${!lowPerformance ? "hover:scale-105" : ""}
          `}
        >
          <LogIn size={18} />
          Login
        </Link>

        <Link
          to="/register"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full
            bg-gradient-to-r from-green-500 to-yellow-500
            hover:from-green-600 hover:to-yellow-600
            text-white transition-all shadow-md whitespace-nowrap
            ${!lowPerformance ? "hover:scale-105" : ""}
          `}
        >
          <UserPlus size={18} />
          Daftar
        </Link>
      </div>
    </div>
  );
}