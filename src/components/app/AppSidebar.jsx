
import { NavLink } from "react-router-dom";
import {
  Dashboard as LayoutDashboard,
  Psychology as BrainCircuit,
  History,
  Analytics as ChartNoAxesCombined,
  Description as FileText,
  EditNote as ResumeBuilderIcon,
  Route,
  Person as UserRound,
  Settings,
  MenuOpen as PanelLeftClose,
  Menu as PanelLeftOpen,
  Close as X,
} from "@mui/icons-material";

const navigation = [
  {
    label: "WORKSPACE",
    items: [
      {
        name: "Overview",
        path: "/app",
        icon: LayoutDashboard,
        end: true,
      },
      {
        name: "AI Interview",
        path: "/app/interview",
        icon: BrainCircuit,
      },
      {
        name: "Interview History",
        path: "/app/history",
        icon: History,
      },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      {
        name: "Analytics",
        path: "/app/analytics",
        icon: ChartNoAxesCombined,
      },
      {
        name: "Resume Manager",
        path: "/app/resumes",
        icon: FileText,
      },
      {
        name: "Resume Builder",
        path: "/app/resume-builder",
        icon: ResumeBuilderIcon,
      },
      {
        name: "Preparation Roadmap",
        path: "/app/roadmap",
        icon: Route,
      },
    ],
  },
  {
    label: "PREFERENCES",
    items: [
      {
        name: "My Profile",
        path: "/app/profile",
        icon: UserRound,
      },
      {
        name: "Settings",
        path: "/app/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AppSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const closeMobileSidebar = () => setMobileOpen(false);

  const toggleCollapse = () => {
    setCollapsed((previous) => !previous);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300 lg:hidden
          ${
            mobileOpen
              ? "visible opacity-100"
              : "invisible opacity-0 pointer-events-none"
          }
        `}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          glass-sidebar fixed left-0 top-0 z-50
          flex h-dvh flex-col
          w-[280px]
          ${collapsed ? "lg:w-[82px]" : "lg:w-[260px]"}
          transition-[width,transform] duration-300 ease-in-out
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-[var(--border-color)] px-5">
          <NavLink
            to="/app"
            onClick={closeMobileSidebar}
            className="flex min-w-0 items-center gap-3 overflow-hidden"
            aria-label="PrepCoach home"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5555] to-[#b91c1c] shadow-lg shadow-red-500/20">
              <BrainCircuit sx={{ color: "white", fontSize: 25 }} />
            </div>

            <div
              className={`min-w-0 whitespace-nowrap ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <h1 className="font-heading text-lg font-bold tracking-tight text-[var(--text-primary)]">
                Prep<span className="text-[#ff4545]">Coach</span>
              </h1>

              <p className="text-[9px] tracking-[2px] text-[var(--text-muted)]">
                AI INTERVIEW STUDIO
              </p>
            </div>
          </NavLink>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 lg:block"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-glass-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 lg:hidden"
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          className="flex-1 space-y-7 overflow-x-hidden overflow-y-auto px-3 py-7"
          aria-label="Application sections"
        >
          {navigation.map((section) => (
            <div key={section.label}>
              {/* Section Heading */}
              <p
                className={`
                  mb-3 px-3 text-[10px] font-semibold
                  tracking-[1.7px] text-[var(--text-muted)]
                  ${collapsed ? "lg:hidden" : ""}
                `}
              >
                {section.label}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={closeMobileSidebar}
                      title={collapsed ? item.name : undefined}
                      aria-label={item.name}
                      className={({ isActive }) => `
                        group relative flex items-center gap-3
                        overflow-hidden rounded-xl border px-3 py-3
                        text-[13px] font-medium
                        transition-all duration-200
                        focus-visible:outline-none
                        focus-visible:ring-2 focus-visible:ring-red-500

                        ${collapsed ? "lg:justify-center lg:px-2" : ""}

                        ${
                          isActive
                            ? "border-red-500/20 bg-gradient-to-r from-red-500/20 to-red-500/5 text-[#ff5555] shadow-sm shadow-red-500/5"
                            : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)] hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text-primary)]"
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Indicator */}
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#ff4545]" />
                          )}

                          <Icon
                            sx={{
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          />

                          <span
                            className={`whitespace-nowrap ${
                              collapsed ? "lg:hidden" : ""
                            }`}
                          >
                            {item.name}
                          </span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="shrink-0 border-t border-[var(--border-color)] px-5 py-4">
          <p className="text-center text-[10px] tracking-wide text-[var(--text-muted)]">
            <span className={collapsed ? "lg:hidden" : ""}>
              PREPCOACH v1.0.0
            </span>

            <span className={collapsed ? "hidden lg:inline" : "hidden"}>
              v1.0
            </span>
          </p>
        </div>
      </aside>
    </>
  );
}
