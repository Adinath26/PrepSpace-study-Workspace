import React from "react";
import { useNavigate } from "react-router-dom";
import { IoPersonCircleOutline, IoMailOutline, IoLogOutOutline } from "react-icons/io5";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-xl px-6 py-10 sm:px-10">
        <h1 className="mb-8 font-display text-2xl font-semibold text-ink-700">Profile</h1>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-brass-100 font-display text-xl font-semibold text-brass-600">
              {initials}
            </span>
            <div>
              <p className="text-lg font-semibold text-ink-700">{user?.name}</p>
              <p className="text-sm text-ink-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-line pt-6">
            <div className="flex items-center gap-3 text-sm text-ink-500">
              <IoPersonCircleOutline size={18} className="text-ink-300" />
              <span>{user?.name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-500">
              <IoMailOutline size={18} className="text-ink-300" />
              <span>{user?.email}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-danger mt-6 w-full">
            <IoLogOutOutline size={17} /> Log out
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
