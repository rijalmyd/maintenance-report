import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useLogout } from "@/hooks/useUser";
import {
  Bell,
  CarTaxiFront,
  ChevronDown,
  CreditCard,
  Drill,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  ToolCase,
  User,
  Users,
  UserStar,
  Wrench,
  X,
} from "lucide-react";
import Image from 'next/image.js';
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Toaster } from "sonner";

const AdminLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", to: "/admin/dashboard", label: "Dashboard", icon: Home },
    {
      id: "maintenence",
      to: "/admin/maintenences",
      label: "Maintenence",
      icon: Wrench,
    },
    {
      id: "drivers",
      to: "/admin/drivers",
      label: "Driver",
      icon: UserStar,
    },
    {
      id: "assets",
      to: "/admin/assets",
      label: "Asset",
      icon: CarTaxiFront,
    },
    {
      id: "sparepart",
      to: "/admin/spareparts",
      label: "Sparepart",
      icon: ToolCase,
    },
    { id: "users", to: "/admin/users", label: "Users", icon: Users },
    // {
    //   id: "settings",
    //   to: "/admin/settings",
    //   label: "Settings",
    //   icon: Settings,
    // },
  ];

  const { user, isLoading } = useAuthGuard();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Navbar */}
        <div className="px-4 sm:px-6 lg:px-8 border-b border-gray-200">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src="https://www.pt-aau.com/wp-content/uploads/2025/05/logo-circle.png"
                    alt="Logo PT. AAU"
                    fill
                    className="object-contain"
                    priority // Menambahkan priority karena ini adalah elemen LCP (di atas lipatan)
                  />
                </div>
                <h1 className="font-bold text-gray-900 leading-tight">
                  <span className="hidden sm:inline">
                    PT. ADITYA ANDHIKA UTAMA Report
                  </span>

                  <span className="sm:hidden">
                    PT. AAU
                  </span>
                </h1>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              {/* <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="w-5 h-5" />
              </Button> */}

              {/* Notifications */}
              {/* <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </Button> */}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.fullname
                      .split(" ")
                      .map((word) => word.charAt(0).toUpperCase())
                      .join("") ?? "MR"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    {/* <button className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-50 text-sm">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-50 text-sm">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button> */}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-50 text-sm text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Navigation - Below Navbar */}
        <nav className="hidden lg:flex items-center gap-1 px-4 sm:px-6 lg:px-8 py-3 bg-white">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                asChild
                variant="ghost"
                key={item.id}
                className={`flex items-center hover:bg-primary hover:text-white gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${pathname === item.to
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-white hover:text-gray-900"
                  }`}
              >
                <Link href={item.to}>
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    asChild
                    variant="ghost"
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                    }}
                    className={`flex justify-start items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-normal transition-all ${pathname === item.to
                      ? "bg-blue-50 text-primary"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <Link href={item.to}>
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {menuItems.find((item) => item.to === pathname)?.label}
          </h2>
          <p className="text-gray-600 mt-1">
            {user
              ? `Selamat datang kembali ${user?.fullname}! Semoga harimu menyenangkan
            :)`
              : "...."}
          </p>
        </div>
        <Toaster richColors position="top-center" />
        {isLoading ? <p>Loading ...</p> : children}
      </main>
    </div>
  );
};

export default AdminLayout;
