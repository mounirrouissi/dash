"use client"

import { formatCurrency, formatDate, getDashboardMetrics, getEventStats, getRecentInvoices, type DashboardMetrics, type EventsResponse, type Invoice, type MetricValue } from "@/api";
import { ArrowDownRight, ArrowUpRight, CalendarDays, CircleDollarSign, Clock, Eye, MapPin, TicketIcon, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";


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

export default function Dashboard() {
    // *** State for fetched dashboard data and loading/error states ***
    const [dashboardData, setDashboardData] = useState<DashboardMetrics>(initialDashboardMetrics)
    const [recentInvoicesData, setRecentInvoicesData] = useState<Invoice[]>(initialInvoices)
    const [eventsData, setEventsData] = useState<EventsResponse>(initialEventsResponse)

    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // *** Fetch dashboard metrics, recent invoices, and events on component mount ***
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Fetch Metrics, Invoices, and Events concurrently using Promise.all
                const [metricsData, invoicesData, eventsResponse] = await Promise.all([
                    
                    getDashboardMetrics(), // Fetch for the current month
                    getRecentInvoices(5), // Fetch latest 5 invoices
                    getEventStats(10), // Fetch latest 10 events
                ])

                setDashboardData(metricsData)
                setRecentInvoicesData(invoicesData)
                setEventsData(eventsResponse)
            } catch (error: any) {
                console.error("Failed to load dashboard data:", error)
                setError(error.message || "Could not load dashboard data.")
            } finally {
                setIsLoading(false)
                setIsLoadingMetrics(false)
            }
        }

        fetchDashboardData()
    }, [])

    // --- Prepare stats array dynamically from fetched data ---
    const stats = [
        {
            title: "Total Revenue",
            value: isLoadingMetrics ? "Loading..." : formatCurrency(dashboardData.totalRevenue.currentValue),
            icon: CircleDollarSign,
            changePercentage: dashboardData.totalRevenue.changePercentage ?? null,
            trend: dashboardData.totalRevenue.trend,
        },
        {
            title: "Tickets Sold",
            value: isLoadingMetrics ? "Loading..." : dashboardData.ticketsSold.currentValue.toLocaleString(),
            icon: TicketIcon,
            changePercentage: dashboardData.ticketsSold.changePercentage,
            trend: dashboardData.ticketsSold.trend,
        },
        {
            title: "Customers",
            value: isLoadingMetrics ? "Loading..." : dashboardData.customers.currentValue.toLocaleString(),
            icon: Users,
            changePercentage: dashboardData.customers.changePercentage,
            trend: dashboardData.customers.trend,
        },
        {
            title: "Pending Invoices",
            value: isLoadingMetrics ? "Loading..." : dashboardData.pendingInvoices?.currentValue.toLocaleString(),
            icon: Clock,
            changePercentage: dashboardData.pendingInvoices?.changePercentage,
            trend: dashboardData.pendingInvoices?.trend,
        },
    ]

    // Helper function to render metric value with loading state
    const renderMetricValue = (value: number | string, format?: "currency" | "number") => {
        if (isLoading) {
            return <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
        }
        if (format === "currency") {
            return <div className="text-2xl font-bold">{value ? formatCurrency(value) : "$0"}</div>
        }
        return <div className="text-2xl font-bold">{value ? value.toLocaleString() : "0"}</div>
    }

    // Helper function to render metric change percentage with loading state
    const renderMetricChange = (changePercentage: number | null, trend: string) => {
        if (isLoading) {
            return <p className="text-xs text-muted-foreground">Loading change...</p>
        }

        if (changePercentage === null) {
            return <p className="text-xs text-muted-foreground">-</p>
        }

        const trendIcon =
            trend === "increase" ? (
                <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : trend === "decrease" ? (
                <ArrowDownRight className="h-3 w-3 text-red-600" />
            ) : null

        const trendClass = trend === "increase" ? "text-green-600" : trend === "decrease" ? "text-red-600" : "text-muted-foreground"

        const formattedChange = `${changePercentage >= 0 ? "+" : ""}${changePercentage.toFixed(1)}%`

        return (
            <p className="text-xs text-muted-foreground">
                {trendIcon && <span className="inline-flex items-center gap-1">{trendIcon}</span>}
                <span className={trendClass}>{formattedChange}</span> from last month
            </p>
        )
    }

    return (
        <div className="dashboard bg-black">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <h1 className="text-lg font-medium text-foreground">Events Dashboard</h1>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {/* Overall Error Display */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
                        <span className="font-semibold text-red-800">Error!</span> {error}
                    </div>
                )}

                {/* Global Statistics */}
                <div className="mb-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Global Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {renderMetricValue(stat.value, stat.title === "Total Revenue" ? "currency" : "number")}
                                    {renderMetricChange(Number(stat.changePercentage), stat.trend)}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Events List */}
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Event Statistics</h2>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading events...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">Error loading events: {error}</div>
                    ) : eventsData.events.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No events found.</div>
                    ) : (
                        <div className="grid gap-6">
                            {eventsData.events.map((event) => (
                                <Card key={event.id} className="overflow-hidden">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl">{event.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {formatDate(event.date)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {event.location}
                                                    </span>
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">{event.category}</Badge>
                                                <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {/* Attendance */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Attendance</span>
                                                    <span className="font-medium">
                                                        {event.attendees} / {event.capacity}
                                                    </span>
                                                </div>
                                                <Progress value={(event.attendees / event.capacity) * 100} className="h-2" />
                                                <div className="text-xs text-muted-foreground">
                                                    {((event.attendees / event.capacity) * 100).toFixed(1)}% capacity
                                                </div>
                                            </div>

                                            {/* Revenue */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <CircleDollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm text-muted-foreground">Revenue</span>
                                                </div>
                                                <div className="text-2xl font-bold text-green-600">{formatCurrency(event.revenue)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {event.attendees > 0 ? formatCurrency(event.revenue / event.attendees) : "$0"} per attendee
                                                </div>
                                            </div>

                                            {/* Views & Registrations */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm text-muted-foreground">Views</span>
                                                </div>
                                                <div className="text-2xl font-bold text-blue-600">{event.attendees.toLocaleString()}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {event.attendees > 0 ? ((event.attendees / event.attendees) * 100).toFixed(1) : "0"}% conversion rate
                                                </div>
                                            </div>

                                            {/* Registrations */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4 text-purple-600" />
                                                    <span className="text-sm text-muted-foreground">Registrations</span>
                                                </div>
                                                <div className="text-2xl font-bold text-purple-600">{(event.attendees ?? 0).toLocaleString()}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {event.status === "completed" && event.attendees > 0
                                                        ? `${((event.attendees / event.attendees) * 100).toFixed(1)}% showed up`
                                                        : event.status === "upcoming"
                                                            ? "Pending event"
                                                            : "No registrations"}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Invoices Table */}
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h2>
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg">Latest Invoices</CardTitle>
                            <CardDescription>
                                Latest {recentInvoicesData.length > 0 ? recentInvoicesData.length : "5"} invoices processed in your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading recent invoices...</div>
                            ) : error ? (
                                <div className="text-center py-8 text-red-600">Error loading invoices: {error}</div>
                            ) : recentInvoicesData.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No recent invoices found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="font-semibold">Invoice</TableHead>
                                                <TableHead className="font-semibold">Customer</TableHead>
                                                <TableHead className="font-semibold">Date</TableHead>
                                                <TableHead className="font-semibold">Amount</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentInvoicesData.map((invoice) => (
                                                <TableRow key={invoice.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                                    <TableCell>{invoice.customerName}</TableCell>
                                                    <TableCell>{formatDisplayDate(invoice.date)}</TableCell>
                                                    <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                invoice.status === "paid"
                                                                    ? "default"
                                                                    : invoice.status === "pending"
                                                                        ? "secondary"
                                                                        : "destructive"
                                                            }
                                                        >
                                                            {invoice.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}


