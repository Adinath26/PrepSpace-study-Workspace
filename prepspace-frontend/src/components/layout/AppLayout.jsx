import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppLayout = ({ children, sidebarRefreshKey }) => {
  return (
    <div className="flex h-screen flex-col bg-paper">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar refreshKey={sidebarRefreshKey} />
        <main className="scrollbar-thin flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
