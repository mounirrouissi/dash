// src/App.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe, // For quick actions
  Home,
  Search,
  Settings,
} from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate, // For programmatic navigation
} from "react-router-dom";

import { Dashboard } from "./pages/Dashboard"; // Import from pages directory
import Invoices from "./pages/Invoices";

// --- Data for the Sidebar Navigation ---
const sidebarNavData = {
  navMain: [
    {
      title: "navigation.dashboard",
      url: "/",
      icon: Home,
      description: "Overview and analytics",
    },
    {
      title: "navigation.invoices",
      url: "/invoices",
      icon: FileText,
    },
    // Add other main navigation items if you expand your app
  ],
  navSecondary: [
    {
      title: "navigation.settings",
      url: "/settings",
      icon: Settings,
    },
  ],
};

// --- Custom hook to get current route for active menu highlighting ---
function useActiveRoute() {
  const location = useLocation();
  return location.pathname;
}

// --- Main App Content Component (handles layout and routing) ---
function AppContent() {
  const activeRoute = useActiveRoute();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Sidebar open/collapse state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMedium, setIsMedium] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Mobile: < 768px
      setIsMedium(width >= 768 && width < 1024); // Medium: 768px - 1023px

      // Auto-collapse sidebar on medium screens
      if (width >= 768 && width < 1024) {
        setIsSidebarOpen(false);
      } else if (width >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleNavigation = (url: string) => {
    navigate(url);
    if (isMobile || isMedium) setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Language toggle function
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "fr" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Overlay for mobile and medium screens */}
      {(isMobile || isMedium) && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      {/* Sidebar */}
      <Sidebar
        collapsible="icon"
        className={`
          fixed
          z-50 inset-y-0 left-0
          ${
            (isMobile || isMedium) && !isSidebarOpen
              ? "-translate-x-full w-64"
              : (isMobile || isMedium) && isSidebarOpen
              ? "w-64"
              : isSidebarOpen
              ? "w-64"
              : "w-16"
          }
          transition-all duration-300 ease-in-out
          border-r border-gray-200 bg-white/90 backdrop-blur-xl shadow-lg
        `}
      >
        <SidebarHeader>
          {/* Profile section at the top */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Home className="size-4" />
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            {isSidebarOpen && <SidebarGroupLabel>Main</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarNavData.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeRoute === item.url}
                      onClick={() => handleNavigation(item.url)}
                    >
                      <a href={item.url}>
                        <item.icon className="size-4" />
                        {isSidebarOpen && <span>{t(item.title)}</span>}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {/* Secondary Navigation */}
          {/* <SidebarGroup>
            {isSidebarOpen && <SidebarGroupLabel>Tools</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarNavData.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeRoute === item.url}
                      onClick={() => handleNavigation(item.url)}
                    >
                      <a href={item.url}>
                        <item.icon className="size-4" />
                        {isSidebarOpen && <span>{t(item.title)}</span>}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup> */}
          {/* Quick Actions */}
          {/* <SidebarGroup>
            {isSidebarOpen && (
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/events/create">
                      <FileText className="size-4" />
                      {isSidebarOpen && (
                        <span>{t("navigation.createEvent")}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/invoices/create">
                      <FileText className="size-4" />
                      {isSidebarOpen && (
                        <span>{t("navigation.newInvoice")}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup> */}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/profile">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  {isSidebarOpen && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">John Doe</span>
                      <span className="truncate text-xs">john@example.com</span>
                    </div>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* Sidebar Toggle Button - positioned outside sidebar */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 z-50 p-2 rounded-full bg-white border border-gray-200 shadow-lg hover:bg-gray-50 transition-all duration-200 ease-in-out"
          style={{
            left: isSidebarOpen ? "248px" : "66px", // Position based on sidebar width
            transform: "translateX(-50%)",
          }}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className=" h-4 w-4 text-gray-600" />
          )}
        </button>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          // On mobile/medium screens, always no margin (sidebar overlays)
          isMobile || isMedium
            ? "ml-0"
            : // On desktop, margin based on sidebar state
            isSidebarOpen
            ? "ml-64"
            : "ml-16"
        }`}
      >
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-sm">
          {/* Mobile/Medium Menu Button */}
          {(isMobile || isMedium) && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
              title="Toggle sidebar"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900">
            {activeRoute === "/"
              ? t("dashboard.title")
              : activeRoute === "/invoices"
              ? t("navigation.invoices")
              : "Page"}
          </h1>
          <div className="flex items-center space-x-4 ml-auto">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder={t("navigation.searchHeader")}
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
              title={`Switch to ${
                i18n.language === "en" ? "French" : "English"
              }`}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">
                {i18n.language === "en" ? "EN" : "FR"}
              </span>
              <span className="text-xs text-gray-500 hidden md:inline">
                {i18n.language === "en" ? "English" : "Français"}
              </span>
            </button>
          </div>
        </header>
        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard searchTerm={searchTerm} />} />
              <Route path="/invoices" element={<Invoices />} />
              {/* Add more routes here as you expand your application */}
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Root App Component ---
function App() {
  return (
    <Router>
      <SidebarProvider>
        {" "}
        {/* Provider for sidebar context */}
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}

export default App;
