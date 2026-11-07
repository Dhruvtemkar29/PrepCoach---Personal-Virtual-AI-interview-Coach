
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AppSidebar from "./AppSidebar";
import AppNavbar from "./AppNavbar";
import PrepBot from "../common/PrepBot";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  // Close mobile sidebar after navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-background min-h-screen">

      {/* Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Application */}
      <main
        className={`
          min-h-screen transition-all duration-300
          ${collapsed ? "lg:ml-[82px]" : "lg:ml-[260px]"}
        `}
      >
        {/* Navbar */}
        <AppNavbar
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page Content */}
        <div className="mx-auto min-h-[calc(100vh-66px)] max-w-[1600px] p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Global AI Assistant */}
      <PrepBot />

    </div>
  );
}
