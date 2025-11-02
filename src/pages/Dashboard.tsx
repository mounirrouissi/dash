// src/pages/Dashboard.tsx
"use client"; // This is typically for Next.js, if not using Next.js, you can remove it.

import i18n from "i18next";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Clock,
  Eye,
  MapPin,
  TicketIcon,
  UserCheck,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import from your API and utility files
import {
  type DashboardMetrics,
  type EventsResponse,
  formatCurrency,
  formatDate,
  getDashboardMetrics,
  getEventStats,
  getRecentInvoices,
  type Invoice,
  type MetricValue,
} from "@/api";

// --- Define initial state shapes ---
const initialMetricValue: MetricValue = {
  currentValue: 0,
  changePercentage: null,
  trend: "neutral",
};

const initialDashboardMetrics: DashboardMetrics = {
  totalRevenue: { ...initialMetricValue },
  ticketsSold: { ...initialMetricValue },
  customers: { ...initialMetricValue },
  pendingInvoices: { ...initialMetricValue },
};

const initialInvoices: Invoice[] = [];
const initialEventsResponse: EventsResponse = {
  events: [],
  totalEvents: 0,
};

function getStatusColor(status: string): string {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "ongoing":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Format date for display in tables
const formatDisplayDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

export function Dashboard({ searchTerm = "" }: { searchTerm?: string }) {
  // Export as named function
  const { t } = useTranslation();

  // *** State for fetched dashboard data and loading/error states ***
  const [dashboardData, setDashboardData] = useState<DashboardMetrics>(
    initialDashboardMetrics
  );
  const [recentInvoicesData, setRecentInvoicesData] =
    useState<Invoice[]>(initialInvoices);
  const [eventsData, setEventsData] = useState<EventsResponse>(
    initialEventsResponse
  );

  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // General loading for all sections
  const [error, setError] = useState<string | null>(null);

  // Add sorting state
  const sortOptions = ["date", "revenue", "attendees", "capacity"] as const;
  type SortKey = (typeof sortOptions)[number];
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  React.useEffect(() => {
    console.log("Sorting changed:", {
      sortKey,
      sortOrder,
      eventsCount: eventsData.events.length,
    });
  }, [sortKey, sortOrder, eventsData.events.length]);
  // Enhanced sorting implementation with debugging
  const sortedEvents = React.useMemo(() => {
    if (!eventsData.events || eventsData.events.length === 0) {
      return [];
    }

    return [...eventsData.events].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      try {
        // Map sort keys to actual property names
        switch (sortKey) {
          case "date":
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            // Check for invalid dates
            if (isNaN(aValue)) aValue = 0;
            if (isNaN(bValue)) bValue = 0;
            break;
          case "revenue":
            aValue = Number(a.revenue) || 0;
            bValue = Number(b.revenue) || 0;
            break;
          case "attendees":
            aValue = Number(a.attendees) || 0;
            bValue = Number(b.attendees) || 0;
            break;
          case "capacity":
            aValue = Number(a.capacity) || 0;
            bValue = Number(b.capacity) || 0;
            break;
          default:
            console.warn(`Unknown sort key: ${sortKey}`);
            aValue = 0;
            bValue = 0;
        }

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === "asc" ? -1 : 1;
        if (bValue == null) return sortOrder === "asc" ? 1 : -1;

        // Perform comparison
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      } catch (error) {
        console.error("Error in sorting:", error, { a, b, sortKey, sortOrder });
        return 0;
      }
    });
  }, [eventsData.events, sortKey, sortOrder]);

  // Filter sortedEvents by searchTerm
  const filteredEvents = React.useMemo(() => {
    if (!searchTerm) return sortedEvents;
    const lower = searchTerm.toLowerCase();
    return sortedEvents.filter(
      (event) =>
        event?.name?.toLowerCase().includes(lower) ||
        event?.location?.toLowerCase().includes(lower) ||
        event?.category?.toLowerCase().includes(lower)
    );
  }, [sortedEvents, searchTerm]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const EVENTS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortKey, sortOrder]);

  const pagedEvents = React.useMemo(() => {
    const start = (currentPage - 1) * EVENTS_PER_PAGE;
    return filteredEvents.slice(start, start + EVENTS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  // *** Fetch dashboard metrics, recent invoices, and events on component mount ***
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch Metrics, Invoices, and Events concurrently using Promise.all
        const [metricsData, invoicesData, eventsResponse] = await Promise.all([
          getDashboardMetrics(), // Fetch for the current month
          getRecentInvoices(5), // Fetch latest 5 invoices
          getEventStats(10), // Fetch latest 10 events
        ]);

        setDashboardData(metricsData);
        setRecentInvoicesData(invoicesData);
        setEventsData(eventsResponse);
      } catch (error: any) {
        console.error("Failed to load dashboard data:", error);
        setError(error.message || "Could not load dashboard data.");
      } finally {
        setIsLoading(false);
        setIsLoadingMetrics(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Prepare stats array dynamically from fetched data ---
  const stats = [
    {
      title: t("statistics.totalRevenue"),
      value: isLoadingMetrics
        ? t("dashboard.loading")
        : formatCurrency(dashboardData.totalRevenue.currentValue),
      icon: CircleDollarSign,
      changePercentage: dashboardData.totalRevenue.changePercentage ?? null,
      trend: dashboardData.totalRevenue.trend,
    },
    {
      title: t("statistics.ticketsSold"),
      value: isLoadingMetrics
        ? t("dashboard.loading")
        : dashboardData.ticketsSold.currentValue.toLocaleString(),
      icon: TicketIcon,
      changePercentage: dashboardData.ticketsSold.changePercentage,
      trend: dashboardData.ticketsSold.trend,
    },
    {
      title: t("statistics.customers"),
      value: isLoadingMetrics
        ? t("dashboard.loading")
        : dashboardData.customers.currentValue.toLocaleString(),
      icon: Users,
      changePercentage: dashboardData.customers.changePercentage,
      trend: dashboardData.customers.trend,
    },
    {
      title: t("statistics.pendingInvoices"),
      value: isLoadingMetrics
        ? t("dashboard.loading")
        : dashboardData.pendingInvoices?.currentValue.toLocaleString() || "0", // Handle undefined
      icon: Clock,
      changePercentage: dashboardData.pendingInvoices?.changePercentage ?? null, // Handle undefined
      trend: dashboardData.pendingInvoices?.trend ?? "neutral", // Handle undefined
    },
  ];

  // Helper function to render metric value with loading state and formatting
  const renderMetricValue = (
    value: number | string,
    format?: "currency" | "number"
  ): React.ReactNode => {
    if (isLoading) {
      return (
        <div className="text-2xl font-bold text-muted-foreground">
          {t("dashboard.loading")}
        </div>
      );
    }
    if (format === "currency") {
      return (
        <div className="text-2xl font-bold">
          {typeof value === "number" ? formatCurrency(value) : value}
        </div>
      );
    }
    return (
      <div className="text-2xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    );
  };

  // Helper function to render metric change percentage with loading state
  const renderMetricChange = (
    changePercentage: number | null,
    trend: string
  ): React.ReactNode => {
    if (isLoading) {
      return (
        <p className="text-xs text-muted-foreground">
          {t("statistics.loadingChange")}
        </p>
      );
    }

    if (changePercentage === null) {
      return <p className="text-xs text-muted-foreground">-</p>;
    }

    const trendIcon =
      trend === "increase" ? (
        <ArrowUpRight className="h-3 w-3 text-green-600" />
      ) : trend === "decrease" ? (
        <ArrowDownRight className="h-3 w-3 text-red-600" />
      ) : null;

    const trendClass =
      trend === "increase"
        ? "text-green-600"
        : trend === "decrease"
        ? "text-red-600"
        : "text-muted-foreground";

    const formattedChange = `${
      changePercentage >= 0 ? "+" : ""
    }${changePercentage.toFixed(1)}%`;

    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {trendIcon}
        <span className={trendClass}>{formattedChange}</span>{" "}
        {t("statistics.fromLastMonth")}
      </p>
    );
  };

  return (
    <div className="space-y-10 dashboard-content animate-fade-in-up">
      {/* Overall Error Display */}
      {error && (
        <div
          className="rounded-xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 p-4 mb-6 shadow-lg"
          role="alert"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <span className="font-semibold text-red-800">
                {t("dashboard.error")}
              </span>
              <span className="text-red-700 ml-2">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Global Statistics */}
      <section className="dashboard-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold gradient-text">
            {t("dashboard.globalStatistics")}
          </h2>
        </div>
        <div className="dashboard-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className="metric-card card-modern hover-lift interactive-hover"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                  <stat.icon className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {renderMetricValue(
                    stat.value,
                    stat.title === t("statistics.totalRevenue")
                      ? "currency"
                      : "number"
                  )}
                  {renderMetricChange(
                    Number(stat.changePercentage),
                    stat.trend
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      {/* Events List */}
      <section className="dashboard-section">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-gradient-to-b from-green-500 to-blue-600 rounded-full"></div>
          <h2 className="text-2xl font-bold gradient-text">
            {t("dashboard.eventStatistics")}
          </h2>
        </div>
        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t("events.sortBy")}
            </label>
            <select
              className="search-modern px-3 py-2 text-sm font-medium focus:outline-none"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`events.${option}`)}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-gradient px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            onClick={() =>
              setSortOrder((order) => (order === "asc" ? "desc" : "asc"))
            }
            title={t("events.toggleSort")}
          >
            {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>
        </div>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("dashboard.loadingEvents")}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            {t("dashboard.errorLoadingEvents")} {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("dashboard.noEvents")}
          </div>
        ) : (
          <>
            <div className="dashboard-grid">
              {pagedEvents.map((event) => (
                <Card
                  key={event.date + event.attendees + event.id}
                  className="card-modern hover-lift interactive-hover group"
                >
                  <CardHeader className="relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl"></div>
                    <div className="flex items-start justify-between pt-2">
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {event.name}
                        </CardTitle>
                        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-500" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg">
                            <MapPin className="h-4 w-4 text-green-500" />
                            {event.location}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 font-medium"
                        >
                          {(() => {
                            const categoryKey = `categories.${event.category.toLowerCase()}`;
                            const hasTranslation = i18n.exists(categoryKey);
                            console.log("Category Debug:", {
                              original: event.category,
                              key: categoryKey,
                              hasTranslation,
                              translated: hasTranslation
                                ? t(categoryKey)
                                : event.category,
                              currentLang: i18n.language,
                            });
                            return hasTranslation
                              ? t(categoryKey)
                              : event.category;
                          })()}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div
                            className={`status-dot status-${event.status}`}
                          ></div>
                          <Badge
                            className={`${getStatusColor(
                              event.status
                            )} font-medium`}
                          >
                            {(() => {
                              const statusKey = `status.${event.status}`;
                              const hasTranslation = i18n.exists(statusKey);
                              return hasTranslation
                                ? t(statusKey)
                                : event.status;
                            })()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Attendance */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-purple-600" />
                            <span className="text-muted-foreground">
                              {t("events.attendance")}
                            </span>
                          </div>
                          <span className="font-medium">
                            {event.attendees} / {event.capacity}
                          </span>
                        </div>
                        <Progress
                          value={
                            event.capacity > 0
                              ? (event.attendees / event.capacity) * 100
                              : 0
                          }
                          className="dashboard-progress"
                        />
                        <div className="text-xs text-muted-foreground">
                          {event.capacity > 0
                            ? (
                                (event.attendees / event.capacity) *
                                100
                              ).toFixed(1)
                            : "0"}
                          {t("events.capacityPercentage")}
                        </div>
                      </div>
                      {/* Revenue */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CircleDollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-muted-foreground">
                            {t("events.revenue")}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(event.revenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.attendees > 0
                            ? formatCurrency(event.revenue / event.attendees)
                            : "$0"}{" "}
                          {t("events.perAttendee")}
                        </div>
                      </div>
                      {/* Views */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-muted-foreground">
                            {t("events.views")}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {event.attendees.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.attendees > 0
                            ? (
                                (event.attendees / event.attendees) *
                                100
                              ).toFixed(1)
                            : "0"}
                          {t("events.conversionRate")}
                        </div>
                      </div>
                      {/* Registrations */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-muted-foreground">
                            {t("events.registrations")}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {(event.attendees ?? 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.status === "completed" && event.attendees > 0
                            ? `${(
                                (event.attendees / event.attendees) *
                                100
                              ).toFixed(1)}${t("events.showedUp")}`
                            : event.status === "upcoming"
                            ? t("events.pendingEvent")
                            : t("events.noRegistrations")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Pagination controls */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="dashboard-pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t("pagination.previous")}
              </button>
              <span className="text-sm">
                {t("pagination.page", {
                  current: currentPage,
                  total: totalPages,
                })}
              </span>
              <button
                className="dashboard-pagination-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                {t("pagination.next")}
              </button>
            </div>
          </>
        )}
      </section>
      {/* Recent Invoices Table */}
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">
          {t("dashboard.recentInvoices")}
        </h2>
        <Card className="dashboard-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">
              {t("invoices.latestInvoices")}
            </CardTitle>
            <CardDescription>
              {t("invoices.latestInvoicesDescription", {
                count:
                  recentInvoicesData.length > 0 ? recentInvoicesData.length : 5,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("dashboard.loadingInvoices")}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {t("dashboard.errorLoadingInvoices")} {error}
              </div>
            ) : recentInvoicesData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("dashboard.noInvoices")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="dashboard-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">
                        {t("invoices.invoice")}
                      </TableHead>
                      <TableHead className="font-semibold">
                        {t("invoices.customer")}
                      </TableHead>
                      <TableHead className="font-semibold">
                        {t("events.date")}
                      </TableHead>
                      <TableHead className="font-semibold">
                        {t("invoices.amount")}
                      </TableHead>
                      <TableHead className="font-semibold">
                        {t("invoices.status")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoicesData.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {invoice.id}
                        </TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{formatDisplayDate(invoice.date)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className="dashboard-badge"
                          >
                            {t(`invoices.${invoice.status}`)}
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
      </section>
    </div>
  );
}
