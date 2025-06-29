import {
  FileText,
  LayoutDashboard,
  Menu
} from "lucide-react";
import { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="flex min-h-screen">
            <Sidebar>
              <SidebarHeader>
                <SidebarTrigger />
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/">
                        <LayoutDashboard />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/invoices">
                        <FileText />
                        <span>Invoices</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
              {/* Mobile header */}
              <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
                  <div className="w-10" /> {/* Spacer for centering */}
                </div>
              </header>

              {/* Main content */}
              <main className="flex-1 p-6 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/invoices" element={<Invoices />} />
                  {/* Add more routes as needed */}
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </Router>
  );
}
export default App;