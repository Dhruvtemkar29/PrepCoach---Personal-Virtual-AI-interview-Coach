
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Search as SearchIcon,
  Notifications as Bell,
  Menu as MenuIcon,
  KeyboardArrowDown,
  Close,
  DoneAll,
  Person,
  Settings,
  ArrowForward,
} from "@mui/icons-material";

import ThemeToggle from "../common/ThemeToggle";

const searchItems = [
  { name: "Overview", path: "/app" },
  { name: "AI Interview", path: "/app/interview" },
  { name: "Interview History", path: "/app/history" },
  { name: "Analytics", path: "/app/analytics" },
  { name: "Resume Manager", path: "/app/resumes" },
  { name: "Resume Builder", path: "/app/resume-builder" },
  { name: "Preparation Roadmap", path: "/app/roadmap" },
  { name: "My Profile", path: "/app/profile" },
  { name: "Settings", path: "/app/settings" },
];

export default function AppNavbar({ onMenuClick }) {
  const navigate = useNavigate();

  const headerRef = useRef(null);
  const searchRef = useRef(null);

  const [search, setSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationRead, setNotificationRead] = useState(false);

  const filteredResults = searchItems.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Close dropdowns and search when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleShortcut = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

        searchRef.current?.focus();
        setShowSearchResults(true);
        setShowNotifications(false);
        setShowProfile(false);
      }

      if (event.key === "Escape") {
        setShowSearchResults(false);
        setShowNotifications(false);
        setShowProfile(false);

        searchRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  // Navigate to a selected page
  const openPage = (path) => {
    navigate(path);

    setSearch("");
    setShowSearchResults(false);
    setShowNotifications(false);
    setShowProfile(false);
  };

  // Search keyboard interaction
  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && filteredResults.length > 0) {
      openPage(filteredResults[0].path);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearch("");
    setShowSearchResults(false);
    searchRef.current?.focus();
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setShowNotifications((previous) => !previous);
    setShowProfile(false);
    setShowSearchResults(false);
  };

  // Toggle profile menu
  const toggleProfile = () => {
    setShowProfile((previous) => !previous);
    setShowNotifications(false);
    setShowSearchResults(false);
  };

  return (
    <header
      ref={headerRef}
      className="
        glass-navbar sticky top-3 z-30
        mx-3 flex h-[66px] items-center justify-between
        rounded-2xl px-3 sm:px-4 md:mx-6 md:px-6
      "
    >
      {/* LEFT SECTION */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">

        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="
            shrink-0 rounded-lg p-2
            text-[var(--text-secondary)]
            transition-colors
            hover:bg-[var(--dropdown-hover)]
            lg:hidden
          "
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </button>

        {/* Search */}
        <div className="relative w-[clamp(110px,30vw,210px)] sm:w-[210px] md:w-[240px] xl:w-[320px]">

          <SearchIcon
            className="
              pointer-events-none absolute left-3 top-1/2
              -translate-y-1/2 text-[var(--text-muted)]
            "
            fontSize="small"
          />

          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowSearchResults(true);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={handleSearchKeyDown}
            className="
              glass-input !w-full !py-2 !pl-10
              !pr-9 !text-xs sm:!text-sm
            "
            placeholder="Search..."
            aria-label="Search PrepCoach pages"
            aria-expanded={showSearchResults && !!search.trim()}
            aria-controls="navbar-search-results"
            autoComplete="off"
          />

          {/* Search Clear / Shortcut */}
          {search ? (
            <button
              type="button"
              onClick={clearSearch}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                rounded-md p-1 text-[var(--text-muted)]
                transition-colors hover:text-[var(--text-primary)]
              "
              aria-label="Clear search"
            >
              <Close sx={{ fontSize: 16 }} />
            </button>
          ) : (
            <span
              className="
                pointer-events-none absolute right-3 top-1/2
                hidden -translate-y-1/2 text-[10px]
                text-[var(--text-muted)] sm:block
              "
            >
              Ctrl K
            </span>
          )}

          {/* Search Results */}
          {showSearchResults && search.trim() && (
            <div
              id="navbar-search-results"
              className="
                  left-0 top-12
                w-[260px]
                p-2 shadow-2xl sm:w-[300px]
                absolute z-50
                rounded-2xl overflow-hidden
                border border-[var(--dropdown-border)]
                bg-[var(--dropdown-bg)]
                text-[var(--dropdown-text)]
                shadow-[0_20px_60px_rgba(0,0,0,0.20)]
              "
              role="listbox"
              aria-label="Search results"
            >
              <p className="
                px-3 py-2 text-[10px] font-semibold
                tracking-wider text-[var(--text-muted)]
              ">
                SEARCH RESULTS
              </p>

              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => openPage(item.path)}
                    className="
                      flex w-full items-center justify-between
                      rounded-xl px-3 py-2.5 text-left text-sm
                      text-[var(--text-secondary)]
                      transition-colors
                      hover:bg-[var(--dropdown-hover)]
                      hover:text-[var(--text-primary)]
                    "
                  >
                    {item.name}

                    <ArrowForward sx={{ fontSize: 15 }} />
                  </button>
                ))
              ) : (
                <p className="
                  px-3 py-4 text-xs
                  text-[var(--text-muted)]
                ">
                  No matching pages found.
                </p>
              )}

              <div className="
                border-t border-[var(--border-color)]
                px-3 py-2
              ">
                <p className="text-[10px] text-[var(--text-muted)]">
                  Press Enter to open the first result · Esc to close
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="
        flex shrink-0 items-center
        gap-1 sm:gap-2 md:gap-3
      ">

        {/* Notifications */}
        <div className="relative">

          <button
            type="button"
            onClick={toggleNotifications}
            className="
              relative rounded-xl p-2
              text-[var(--text-secondary)]
              transition-colors
              hover:bg-[var(--dropdown-hover)]
              hover:text-[var(--text-primary)]
            "
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-haspopup="true"
          >
            <Bell />

            {!notificationRead && (
              <span className="
                absolute right-2 top-2 h-2 w-2
                rounded-full bg-[#ff3b3b]
                ring-2 ring-[var(--bg-primary)]
              " />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="
                absolute z-50
                right-0 top-12
                rounded-2xl overflow-hidden
                w-[min(290px,calc(100vw-24px))]
                sm:w-[340px]
                border border-[var(--dropdown-border)]
                bg-[var(--dropdown-bg)]
                text-[var(--dropdown-text)]
                shadow-[0_20px_60px_rgba(0,0,0,0.20)]
              ">

              <div className="
                flex items-center justify-between
                border-b border-[var(--border-color)] p-4
              ">
                <div>
                  <h3 className="
                    text-sm font-semibold
                    text-[var(--text-primary)]
                  ">
                    Notifications
                  </h3>

                  <p className="
                    mt-1 text-[10px]
                    text-[var(--text-muted)]
                  ">
                    Your latest updates
                  </p>
                </div>

                {!notificationRead && (
                  <button
                    type="button"
                    onClick={() => setNotificationRead(true)}
                    className="
                      flex items-center gap-1
                      text-[10px] font-medium
                      text-[#ff5555]
                      transition-colors hover:text-[#ff7777]
                    "
                  >
                    <DoneAll sx={{ fontSize: 14 }} />
                    Mark read
                  </button>
                )}
              </div>

              <div className="p-2">
                {!notificationRead ? (
                  <div className="
                    flex gap-3 rounded-xl
                    bg-red-500/5 p-3
                  ">
                    <div className="
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-xl bg-red-500/10
                      text-[#ff5555]
                    ">
                      <Bell fontSize="small" />
                    </div>

                    <div>
                      <p className="
                        text-xs font-semibold
                        text-[var(--text-primary)]
                      ">
                        Welcome to PrepCoach!
                      </p>

                      <p className="
                        mt-1 text-xs leading-relaxed
                        text-[var(--text-secondary)]
                      ">
                        Your preparation workspace is ready.
                        Start practicing and improve your
                        interview skills.
                      </p>

                      <p className="
                        mt-2 text-[10px]
                        text-[var(--text-muted)]
                      ">
                        Just now
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <DoneAll
                      sx={{
                        fontSize: 28,
                        color: "var(--text-muted)",
                        mb: 1,
                      }}
                    />

                    <p className="
                      text-xs text-[var(--text-secondary)]
                    ">
                      You're all caught up!
                    </p>
                  </div>
                )}
              </div>

              <div className="
                border-t border-[var(--border-color)] p-3
              ">
                <p className="
                  text-center text-[10px]
                  text-[var(--text-muted)]
                ">
                  Notification center · Demo mode
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="
          hidden h-8 w-px
          bg-[var(--border-color)] sm:block
        " />

        {/* Profile Dropdown */}
        <div className="relative">

          <button
            type="button"
            onClick={toggleProfile}
            className="
              flex items-center gap-2 rounded-xl
              p-1.5 transition-colors
              hover:bg-[var(--dropdown-hover)]
            "
            aria-label="Open profile menu"
            aria-expanded={showProfile}
            aria-haspopup="true"
          >
            <div className="
              flex h-9 w-9 items-center justify-center
              rounded-xl bg-gradient-to-br
              from-[#ff7777] to-[#a51d1d]
              text-sm font-bold text-white
              shadow-md shadow-red-500/10
            ">
              D
            </div>

            <div className="hidden text-left md:block">
              <p className="
                text-xs font-semibold
                text-[var(--text-primary)]
              ">
                Your Profile
              </p>

              <p className="
                text-[10px] text-[var(--text-muted)]
              ">
                Free Account
              </p>
            </div>

            <KeyboardArrowDown
              className="hidden text-[var(--text-muted)] md:block"
              fontSize="small"
            />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfile && (
            <div className="
              w-[210px] p-2
              absolute z-50 right-0 top-12
              rounded-2xl overflow-hidden
              border border-[var(--dropdown-border)]
              bg-[var(--dropdown-bg)]
              text-[var(--dropdown-text)]
              shadow-[0_20px_60px_rgba(0,0,0,0.20)]
            ">

              <div className="
                border-b border-[var(--border-color)]
                px-3 py-3
              ">
                <p className="
                  text-xs font-semibold
                  text-[var(--text-primary)]
                ">
                  Your Profile
                </p>

                <p className="
                  mt-1 text-[10px]
                  text-[var(--text-muted)]
                ">
                  Manage your account
                </p>
              </div>

              <NavLink
                to="/app/profile"
                onClick={() => setShowProfile(false)}
                className="
                  mt-2 flex items-center gap-3
                  rounded-xl px-3 py-2.5 text-xs
                  text-[var(--text-secondary)]
                  transition-colors
                  hover:bg-[var(--dropdown-hover)]
                  hover:text-[var(--text-primary)]
                "
              >
                <Person sx={{ fontSize: 18 }} />
                My Profile
              </NavLink>

              <NavLink
                to="/app/settings"
                onClick={() => setShowProfile(false)}
                className="
                  flex items-center gap-3
                  rounded-xl px-3 py-2.5 text-xs
                  text-[var(--text-secondary)]
                  transition-colors
                  hover:bg-[var(--dropdown-hover)]
                  hover:text-[var(--text-primary)]
                "
              >
                <Settings sx={{ fontSize: 18 }} />
                Settings
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
