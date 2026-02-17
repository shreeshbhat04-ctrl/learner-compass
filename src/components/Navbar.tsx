import { Link, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, LayoutDashboard, Search, Menu, X, LogOut, Settings, Code } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Tracks", href: "/tracks", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Practice", href: "/practice", icon: GraduationCap },
  { label: "Lab", href: "/lab/virtual-lab", icon: Code },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-900/95 backdrop-blur-xl shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-110">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Learn<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Path</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button className="flex h-10 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 text-sm text-slate-400 hover:border-slate-600 hover:bg-slate-800 transition-all duration-200 min-w-[240px]">
            <Search className="h-4 w-4" />
            <span>Search courses...</span>
            <kbd className="ml-auto rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-xs text-slate-500">⌘K</kbd>
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-800 transition-all duration-200">
                  <Avatar className="h-8 w-8 border-2 border-emerald-500/50">
                    <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                      {(user.displayName || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white">{user.displayName || "User"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem className="text-xs text-slate-400">
                  {user.branch.toUpperCase()}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:shadow-emerald-500/50 hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800 bg-slate-900 md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="my-2 border-t border-slate-800"></div>
                  <div className="px-4 py-2 text-xs text-slate-500">
                    {user.displayName || "User"} • {user.branch.toUpperCase()}
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/20 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/30"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 rounded-lg px-4 py-3 text-center text-sm font-semibold text-slate-200 border border-slate-700 hover:bg-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;