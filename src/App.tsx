// src/App.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from "@/components/ui/sidebar";
import {
  ChevronLeft,
  ChevronRight,
  FileText, // For quick actions
  Home,
  Menu,
  Search,
  Settings,
  X
} from "lucide-react";
import React, { useState } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate, // For programmatic navigation
} from "react-router-dom";

import { Dashboard } from './pages/Dashboard'; // Import from pages directory
import Invoices from './pages/Invoices';

// --- Data for the Sidebar Navigation ---
const sidebarNavData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      description: "Overview and analytics",
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: FileText,

    },
    // Add other main navigation items if you expand your app
  ],
  navSecondary: [
    {
      title: "Settings",
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

  // Sidebar open/collapse state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigation = (url: string) => {
    navigate(url);
    if (isMobile) setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      {/* Sidebar */}
      <Sidebar
        className={`
          ${isMobile ? 'fixed' : 'relative'}
          z-50 inset-y-0 left-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'w-64' : isSidebarOpen ? 'w-64' : 'w-16'}
          transition-all duration-300 ease-in-out
          border-r border-gray-200 bg-white/90 backdrop-blur-xl shadow-lg
        `}
      >
        <SidebarHeader className="border-b border-gray-200 p-4 flex justify-between items-center h-16">
          <div className={`flex items-center space-x-2 ${!isSidebarOpen && !isMobile ? 'justify-center' : ''}`}>
            {(isSidebarOpen || isMobile) && (
              <span className="text-lg font-semibold text-gray-900">EventDash</span>
            )}
          </div>
          {/* Toggle button */}
          <button
            onClick={toggleSidebar}
            className="p-1 h-4 w-10 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            style={{ marginLeft: 'auto' }} // <-- Add this line
          >
            {isMobile ? (
              <X className="h-5 w-5" />
            ) : isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </SidebarHeader>
        <SidebarContent className="p-4 flex-1 overflow-y-auto">
          {/* Search - only show when sidebar is open */}
          {(isSidebarOpen || isMobile) && (
            <form className="mb-4">
              <SidebarGroup className="py-0">
                <SidebarGroupContent className="relative">
                  <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 select-none opacity-50" />
                  <SidebarInput placeholder="Search events..." className="pl-8" />
                </SidebarGroupContent>
              </SidebarGroup>
            </form>
          )}
          {/* Main Navigation */}
          <SidebarGroup>
            {(isSidebarOpen || isMobile) && <SidebarGroupLabel>Main</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarNavData.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeRoute === item.url}
                      onClick={() => handleNavigation(item.url)}
                      className={`${!isSidebarOpen && !isMobile ? 'justify-center px-2' : ''}`}
                    >
                      <a href={item.url} className="flex items-center">
                        <item.icon className={`h-5 w-5 ${(isSidebarOpen || isMobile) ? 'mr-3' : ''}`} />
                        {(isSidebarOpen || isMobile) && <span>{item.title}</span>}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {/* Secondary Navigation */}
          <SidebarGroup className="mt-6">
            {(isSidebarOpen || isMobile) && <SidebarGroupLabel>Tools</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarNavData.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeRoute === item.url}
                      onClick={() => handleNavigation(item.url)}
                      className={`${!isSidebarOpen && !isMobile ? 'justify-center px-2' : ''}`}
                    >
                      <a href={item.url} className="flex items-center">
                        <item.icon className={`h-5 w-5 ${(isSidebarOpen || isMobile) ? 'mr-3' : ''}`} />
                        {(isSidebarOpen || isMobile) && <span>{item.title}</span>}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-gray-200 p-4 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className={`${!isSidebarOpen && !isMobile ? 'justify-center px-2' : ''}`}>
                <a href="/profile">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  {(isSidebarOpen || isMobile) && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                        <span className="truncate font-semibold">John Doe</span>
                        <span className="truncate text-xs text-gray-500">Admin</span>
                      </div>
                      <Settings className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-sm">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* Desktop toggle - only show when sidebar is collapsed */}
          {!isMobile && !isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900 capitalize">
            {activeRoute === "/" ? "Dashboard" : activeRoute === "/invoices" ? "Invoices" : "Page"}
          </h1>
          <div className="flex items-center space-x-4 ml-auto">
            {isMobile && <div className="relative hidden sm:block">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>}
            <div className="h-6 w-px bg-gray-300"></div>
          </div>
        </header>
        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
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
      <SidebarProvider> {/* Provider for sidebar context */}
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}

export default App;