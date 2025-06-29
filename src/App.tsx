// src/App.tsx
import React, { useState, useEffect } from 'react';
import {
  Bell,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  User,
  CalendarDays, // Ensure this is imported if used in the dashboard itself
  Ticket, // For any ticket-related icons if needed
  Calendar, // For the sidebar header icon
  Plus, // For quick actions
  Home
} from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate, // For programmatic navigation
} from "react-router-dom";
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
  SidebarRail,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Dashboard } from './pages/Dashboard'; // Import from pages directory
import { cn } from './lib/utils'; // Import cn for combining classNames
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
      icon: FileText,
      items: [
        {
          title: "All Invoices",
          url: "/invoices",
        },
        // You can add more invoice sub-routes here if needed
      ],
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

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  return (
    <div className="flex min-h-screen bg-gray-50"> {/* Updated to match your old App background */}
      <Sidebar collapsible="icon" className="fixed lg:relative z-30 inset-y-0 left-0 border-r border-gray-200 bg-white/70 backdrop-blur-xl shadow-lg">
        <SidebarHeader className="border-b border-gray-200 p-4 flex justify-between items-center">
          <a href="/" className="flex items-center space-x-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-gray-900">EventDash</span>
          </a>
          <SidebarTrigger className="lg:hidden text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md p-1 transition-colors" />
        </SidebarHeader>

        <SidebarContent className="p-4">
          {/* Search */}
          <form className="mb-4">
            <SidebarGroup className="py-0">
              <SidebarGroupContent className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 select-none opacity-50" />
                <SidebarInput placeholder="Search events..." className="pl-8" />
              </SidebarGroupContent>
            </SidebarGroup>
          </form>

          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarNavData.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.items ? (
                      <SidebarMenuButton asChild>
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={activeRoute === item.url}
                        onClick={() => handleNavigation(item.url)}
                      >
                        <a href={item.url} className="flex items-center"> {/* Use anchor for initial load */}
                          <item.icon className="mr-3 h-5 w-5" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Secondary Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarNavData.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeRoute === item.url}
                      onClick={() => handleNavigation(item.url)}
                    >
                      <a href={item.url} className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.title}</span>
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
              <SidebarMenuButton size="lg" asChild>
                <a href="/profile"> {/* Example profile link */}
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">John Doe</span>
                    <span className="truncate text-xs text-gray-500">Admin</span>
                  </div>
                  <Settings className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64"> {/* Adjusted ml-64 for sidebar */}
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => { /* Handle mobile sidebar toggle if you implement one */ }}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 capitalize">
            {activeRoute === "/" ? "Dashboard" : activeRoute === "/invoices" ? "Invoices" : "Page"}
          </h1>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="relative p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">John Doe</span>
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto"> {/* Container for content */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invoices" element={<Invoices />} />
              {/* Add more routes here as you expand your application */}
              {/* Example: <Route path="/settings" element={<SettingsPage />} /> */}
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