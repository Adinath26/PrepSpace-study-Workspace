import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoLogOutOutline, IoPersonCircleOutline, IoChevronDown } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper-50/90 px-6 backdrop-blur">
      <Link to="/dashboard" className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-pine text-paper-50 font-display text-sm font-semibold">
          Ps
        </span>
        <span className="font-display text-lg font-semibold text-ink-700">PrepSpace</span>
      </Link>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-paper-200"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brass-100 text-xs font-semibold text-brass-600">
            {initials}
          </span>
          <span className="hidden text-sm font-medium text-ink-700 sm:inline">{user?.name}</span>
          <IoChevronDown className="text-ink-300" size={14} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 card p-1.5 shadow-pop">
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-paper-200"
              >
                <IoPersonCircleOutline size={17} /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-clay hover:bg-clay-100"
              >
                <IoLogOutOutline size={17} /> Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
