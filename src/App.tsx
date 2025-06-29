import {
  Bell,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  User
} from "lucide-react";
import { useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';

// Custom hook to get current location for active menu highlighting
function useActiveRoute() {
  const location = useLocation();
  return location.pathname;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const activeRoute = useActiveRoute();

  const menuItems = [
    {
      path: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      description: "Overview and analytics"
    },
    {
      path: "/invoices",
      icon: FileText,
      label: "Invoices",
      description: "Manage all invoices"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex min-h-screen">
        {/* Enhanced Sidebar */}
        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl">
          <SidebarHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">EventDash</h1>
                  <p className="text-blue-100 text-xs">Event Management</p>
                </div>
              </div>
              <SidebarTrigger className="text-white hover:bg-white/20 rounded-md p-1 transition-colors" />
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                        }`}
                    >
                      <a href={item.path} className="flex items-center space-x-3 p-3">
                        <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                          }`} />
                        <div className="flex-1">
                          <span className="font-medium">{item.label}</span>
                          <p className={`text-xs mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500'
                            }`}>
                            {item.description}
                          </p>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {/* Bottom section with user info */}
            <div className="mt-auto pt-6 border-t border-slate-200">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">John Doe</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <Settings className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors" />
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Enhanced Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          {/* Enhanced Mobile header */}
          <header className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 py-4 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Menu className="w-5 h-5 text-slate-700" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-slate-900">EventDash</h1>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors relative">
                  <Bell className="w-5 h-5 text-slate-700" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                  <Search className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>
          </header>

          {/* Enhanced Desktop header */}
          <header className="hidden lg:flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {activeRoute === "/" ? "Dashboard" : activeRoute === "/invoices" ? "Invoices" : "EventDash"}
              </h1>
              <div className="h-6 w-px bg-slate-300"></div>
              <p className="text-slate-600">
                {activeRoute === "/" ? "Overview and analytics" : activeRoute === "/invoices" ? "Manage all invoices" : "Event Management"}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-700" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">John Doe</span>
              </div>
            </div>
          </header>

          {/* Enhanced Main content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/invoices" element={<Invoices />} />
                {/* Add more routes as needed */}
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}

export default App;