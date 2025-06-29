/// <reference types="vite/client" />
// src/api/api.ts
// TypeScript definitions for Vite environment variables
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
  }
  
  // --- Type for Invoice ---
  export interface Invoice { // Renamed from RecentInvoice for the 'all invoices' context
    id: string // Or invoice number/order number
    customerName: string
    date: string // Backend sends LocalDate, which serializes as YYYY-MM-DD string
    amount: string // Backend sends BigDecimal, can receive as string to handle precision
    status: string // e.g., "paid", "pending", "overdue"
  }
  
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
  // ... (other imports and apiClient setup) ...
  
  // Base API URL - you can make this configurable via environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9003/api/v1/admin/dashboard"
  
  // --- Types for Dashboard Metrics (mirroring backend DTOs) ---
  export interface MetricValue {
    currentValue: number // Using number, BigDecimal from backend will be serialized to number
    changePercentage: number | null // null if no previous period or previous value was 0 and current is 0
    trend: "increase" | "decrease" | "neutral"
  }
  
  export interface DashboardMetrics {
    totalRevenue: MetricValue
    ticketsSold: MetricValue
    customers: MetricValue
    pendingInvoices: MetricValue
  }
  
  
  
  // --- Types for Individual Events ---
  export interface EventStats {
    id: string
    name: string
    date: string // YYYY-MM-DD format
    location: string
    status: "upcoming" | "ongoing" | "completed" | "cancelled"
    category: string
    attendees: number
    capacity: number
    revenue: number
    views: number
    ticketsSold: number
  }
  
  export interface EventsResponse {
    events: EventStats[]
    totalEvents: number
  }
  
  /**
   * Fetches dashboard summary metrics.
   * @param period - Optional period in "YYYY-MM" format (e.g., "2023-10").
   *                 If null, backend defaults to current month.
   */
  export const getDashboardMetrics = async (period?: string): Promise<DashboardMetrics> => {
    try {
      const params = period ? new URLSearchParams({ period }).toString() : ""
      const url = `${API_BASE_URL}/metrics${params ? "?" + params : ""}`
  
      console.log(`Requesting Dashboard Metrics URL: ${url}`)
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any other headers you need, like Authorization
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
      })
  
      if (!response.ok) {
        let errorMessage = `Failed to fetch dashboard metrics: ${response.status} ${response.statusText}`
        try {
          const errorJson = await response.json()
          if (errorJson.message) errorMessage += ` - ${errorJson.message}`
        } catch (e) {
          // Ignore JSON parsing error if response body isn't JSON
        }
        throw new Error(errorMessage)
      }
  
      const data: DashboardMetrics = await response.json()
      return data
    } catch (error: any) {
      console.error("Error fetching dashboard metrics:", error)
      throw new Error(error.message || "An unexpected error occurred while fetching metrics.")
    }
  }
  
  /**
   * Fetches recent invoices.
   * @param limit - Number of recent invoices to fetch (defaults to 5).
   */
  export const getRecentInvoices = async (limit = 5): Promise<Invoice[]> => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() }).toString()
      const url = `${API_BASE_URL}/recent-invoices?${params}`
  
      console.log(`Requesting Recent Invoices URL: ${url}`)
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
  
      if (!response.ok) {
        let errorMessage = `Failed to fetch recent invoices: ${response.status} ${response.statusText}`
        try {
          const errorJson = await response.json()
          if (errorJson.message) errorMessage += ` - ${errorJson.message}`
        } catch (e) {
          // Ignore
        }
        throw new Error(errorMessage)
      }
  
      const data: Invoice[] = await response.json()
      return data
    } catch (error: any) {
      console.error("Error fetching recent invoices:", error)
      throw new Error(error.message || "An unexpected error occurred while fetching recent invoices.")
    }
  }
  
  /**
   * Fetches individual event statistics.
   * @param limit - Number of events to fetch (defaults to 10).
   * @param status - Optional status filter ('upcoming', 'ongoing', 'completed', 'cancelled').
   */
  export const getEventStats = async (limit = 10, status?: string): Promise<EventsResponse> => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (status) {
        params.append("status", status)
      }
  
      const url = `${API_BASE_URL}/events?${params.toString()}`
  
      console.log(`Requesting Event Stats URL: ${url}`)
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
  
      if (!response.ok) {
        let errorMessage = `Failed to fetch event statistics: ${response.status} ${response.statusText}`
        try {
          const errorJson = await response.json()
          if (errorJson.message) errorMessage += ` - ${errorJson.message}`
        } catch (e) {
          // Ignore JSON parsing error if response body isn't JSON
        }
        throw new Error(errorMessage)
      }
  
      const data: EventsResponse = await response.json()
      console.log("Event Stats Data:", data)
      return data
    } catch (error: any) {
      console.error("Error fetching event statistics:", error)
      throw new Error(error.message || "An unexpected error occurred while fetching event statistics.")
    }
  }
  
  // Helper to format BigDecimal strings from backend
  export const formatCurrency = (amount: string | number | undefined): string => {
    if (amount == null) return "$0.00"
  
    // Remove any character that's not digit, decimal point, minus sign, or exponent
    const sanitized = typeof amount === "string" ? amount.replace(/[^0-9eE.+-]/g, "") : amount.toString()
  
    const numAmount = Number.parseFloat(sanitized)
    if (isNaN(numAmount)) return "$0.00"
    return `$${numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  
  // Helper to format date
  export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  /**
   * Fetches ALL invoices.
   * Assumes an endpoint like /invoices exists or /recent-invoices with limit=0/all.
   * Here, we assume a /invoices endpoint exists.
   */
  export const getAllInvoices = async (): Promise<Invoice[]> => { // Using Invoice type
    try {
      // Assuming the endpoint for all invoices is '/invoices' under the admin path
      // If your backend requires a parameter like ?limit=all or ?pagination=false, adjust the URL here.
      // If it's a paginated endpoint, you might need to fetch multiple pages.
      // For this example, let's assume a simple /invoices endpoint returns all data.
      const url = `${API_BASE_URL}/invoices` // Assumed endpoint for all invoices
  
      console.log(`Requesting All Invoices URL: ${url}`)
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
  
      if (!response.ok) {
        let errorMessage = `Failed to fetch all invoices: ${response.status} ${response.statusText}`
        try {
          const errorJson = await response.json()
          if (errorJson.message) errorMessage += ` - ${errorJson.message}`
        } catch (e) {
          // Ignore
        }
        throw new Error(errorMessage)
      }
  
      const data: Invoice[] = await response.json()
      return data
    } catch (error: any) {
      console.error("Error fetching all invoices:", error)
      throw new Error(error.message || "An unexpected error occurred while fetching all invoices.")
    }
  }
  
  // Format date for display used in the table
  export const formatDisplayDate = (dateString: string): string => {
    try {
       if (!dateString) return 'Invalid Date';
       // Attempt to parse as YYYY-MM-DD first
       const [year, month, day] = dateString.split('-').map(Number);
       if (year && month && day) {
         // Adjust month as it's 0-indexed in Date constructor
         const date = new Date(year, month - 1, day);
          // Check if the parsed date is valid
         if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("en-US", {
               month: "2-digit",
               day: "2-digit",
               year: "numeric",
            });
         }
       }
        // Fallback for other formats or invalid dates
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-US", {
             month: "2-digit",
             day: "2-digit",
             year: "numeric",
          });
        }
       return 'Invalid Date';
    } catch (error) {
       console.error("Error formatting date:", dateString, error);
       return 'Invalid Date';
    }
  }
  