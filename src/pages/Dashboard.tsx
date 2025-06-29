"use client"

import { type DashboardMetrics, type EventsResponse, type Invoice, type MetricValue } from "@/api";


// --- Define initial state shapes ---
const initialMetricValue: MetricValue = {
    currentValue: 0,
    changePercentage: null,
    trend: "neutral",
}

const initialDashboardMetrics: DashboardMetrics = {
    totalRevenue: { ...initialMetricValue },
    ticketsSold: { ...initialMetricValue },
    customers: { ...initialMetricValue },
    pendingInvoices: { ...initialMetricValue },
}

const initialInvoices: Invoice[] = []
const initialEventsResponse: EventsResponse = {
    events: [],
    totalEvents: 0,
}

function getStatusColor(status: string) {
    switch (status) {
        case "upcoming":
            return "bg-blue-100 text-blue-800"
        case "ongoing":
            return "bg-green-100 text-green-800"
        case "completed":
            return "bg-green-100 text-green-800"
        case "cancelled":
            return "bg-red-100 text-red-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

// Format date for display
const formatDisplayDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    })
}

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome to your event dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900">Total Events</h3>
                    <p className="text-3xl font-bold text-blue-600">24</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900">Active Events</h3>
                    <p className="text-3xl font-bold text-green-600">12</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
                    <p className="text-3xl font-bold text-purple-600">$45,230</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900">Tickets Sold</h3>
                    <p className="text-3xl font-bold text-orange-600">1,234</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
