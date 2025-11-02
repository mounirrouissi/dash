/// <reference types="vite/client" />
// src/api/api.ts
// TypeScript definitions for Vite environment variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

// --- Type for Invoice ---
export interface Invoice {
  // Renamed from RecentInvoice for the 'all invoices' context
  id: string; // Or invoice number/order number
  customerName: string;
  date: string | number[]; // Backend can send LocalDate as string "YYYY-MM-DD" or array [YYYY, MM, DD]
  amount: string; // Backend sends BigDecimal, can receive as string to handle precision
  status: "paid" | "pending" | "overdue" | "expired"; // Valid invoice statuses
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ... (other imports and apiClient setup) ...

// Base API URL - you can make this configurable via environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:9003/api/v1/dashboard";

// --- Types for Dashboard Metrics (mirroring backend DTOs) ---
export interface MetricValue {
  currentValue: number; // Using number, BigDecimal from backend will be serialized to number
  changePercentage: number | null; // null if no previous period or previous value was 0 and current is 0
  trend: "increase" | "decrease" | "neutral";
}

export interface DashboardMetrics {
  totalRevenue: MetricValue;
  ticketsSold: MetricValue;
  customers: MetricValue;
  pendingInvoices: MetricValue;
}

export interface EventStats {
  id: string; // Keep as string for consistency
  name: string;
  date: string;
  location: string;
  status: "ONSALE" | "PUBLISHED" | "DRAFT" | "CANCELLED" | string; // Add actual statuses
  category: string;
  attendees: number;
  capacity: number;
  revenue: number;
  views?: number; // Make optional since backend doesn't return it
  ticketsSold?: number; // Make optional
}

// Spring Page response structure
export interface SpringPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface EventsResponse {
  events: EventStats[];
  totalEvents: number;
  totalPages?: number;
  currentPage?: number;
}

// Helper to extract a message from unknown error-like values
export const getErrorMessage = (error: unknown): string => {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    const obj = error as Record<string, unknown>;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return String(error);
};

// small access helpers that avoid `any`
const getString = (obj: unknown, keys: string[], fallback = ""): string => {
  if (!obj || typeof obj !== "object") return fallback;
  for (const k of keys) {
    const v = (obj as Record<string, unknown>)[k];
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
  }
  return fallback;
};

const getNumber = (obj: unknown, keys: string[], fallback = 0): number => {
  if (!obj || typeof obj !== "object") return fallback;
  for (const k of keys) {
    const v = (obj as Record<string, unknown>)[k];
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return fallback;
};

/**
 * Fetch a single event by id using HAL+JSON response format.
 * Endpoint: /{version}/sales/events/{eventId}
 * @param eventId - numeric id of the event
 * @param apiVersion - API version path segment (default: 'v1')
 */
export const getEventById = async (
  eventId: number | string,
  apiVersion = "v1"
): Promise<EventStats> => {
  try {
    const url = `${API_BASE_URL.replace(
      "/api/v1/dashboard",
      ""
    )}/${apiVersion}/sales/events/${eventId}`;
    console.log(`Requesting Event by ID URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/hal+json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch event ${eventId}: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.message)
          errorMessage += ` - ${errorJson.message}`;
      } catch (err) {
        // ignore json parse errors
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // HAL responses may wrap the resource directly or under _embedded. Try to find the event resource.
    let eventPayload: any = data;
    if (data && data._embedded) {
      // try common keys - this is heuristic because HAL embedded collection/resource names vary
      const keys = Object.keys(data._embedded);
      if (keys.length === 1) {
        eventPayload = data._embedded[keys[0]];
      } else if (keys.includes("event")) {
        eventPayload = data._embedded["event"];
      } else {
        // fallback to first embedded value
        eventPayload = data._embedded[keys[0]];
      }
    }

    // If the embedded value is an array, pick the first element
    if (Array.isArray(eventPayload)) {
      eventPayload = eventPayload[0];
    }

    // Map HAL fields to EventStats where possible. Assume backend uses similar field names.
    const mapped: EventStats = {
      id: String(eventPayload.id ?? eventPayload.eventId ?? eventId),
      name: eventPayload.name ?? eventPayload.title ?? "",
      date: eventPayload.date ?? eventPayload.startDate ?? "",
      location: eventPayload.location ?? eventPayload.venue ?? "",
      status: (eventPayload.status ?? "upcoming") as EventStats["status"],
      category: eventPayload.category ?? eventPayload.type ?? "",
      attendees: Number(
        eventPayload.attendees ?? eventPayload.attendeeCount ?? 0
      ),
      capacity: Number(eventPayload.capacity ?? eventPayload.maxCapacity ?? 0),
      revenue: Number(eventPayload.revenue ?? eventPayload.totalRevenue ?? 0),
      views: Number(eventPayload.views ?? 0),
      ticketsSold: Number(eventPayload.ticketsSold ?? eventPayload.sold ?? 0),
    };

    return mapped;
  } catch (error: any) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw new Error(
      error?.message ||
        `An unexpected error occurred while fetching event ${eventId}`
    );
  }
};

/**
 * Fetches dashboard summary metrics.
 * @param period - Optional period in "YYYY-MM" format (e.g., "2023-10").
 *                 If null, backend defaults to current month.
 */
export const getDashboardMetrics = async (
  period?: string
): Promise<DashboardMetrics> => {
  try {
    const params = period ? new URLSearchParams({ period }).toString() : "";
    const url = `${API_BASE_URL}/metrics${params ? "?" + params : ""}`;

    console.log(`Requesting Dashboard Metrics URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add any other headers you need, like Authorization
        // 'Authorization': `Bearer ${yourAuthToken}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch dashboard metrics: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) errorMessage += ` - ${errorJson.message}`;
      } catch (e) {
        // Ignore JSON parsing error if response body isn't JSON
      }
      throw new Error(errorMessage);
    }

    const data: DashboardMetrics = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    // error may be unknown; stringify safely
    const message =
      error && typeof error === "object" && "message" in error
        ? (error as any).message
        : String(error);
    throw new Error(
      message || "An unexpected error occurred while fetching metrics."
    );
  }
};

/**
 * Fetches recent invoices.
 * @param limit - Number of recent invoices to fetch (defaults to 5).
 */
export const getRecentInvoices = async (
  page = 0,
  size = 5
): Promise<Invoice[]> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    }).toString();
    const url = `${API_BASE_URL}/recent-invoices?${params}`;

    console.log(`Requesting Recent Invoices URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch recent invoices: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson && (errorJson as any).message)
          errorMessage += ` - ${(errorJson as any).message}`;
      } catch (_) {
        // Ignore JSON parsing errors
      }
      throw new Error(errorMessage);
    }

    const data: Invoice[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching recent invoices:", error);
    const message =
      error && typeof error === "object" && "message" in error
        ? (error as any).message
        : String(error);
    throw new Error(
      message || "An unexpected error occurred while fetching recent invoices."
    );
  }
};

/**
 * Fetches individual event statistics from the sales API endpoint.
 * Uses the backend route: /{version}/sales/events
 * @param page - page index (0-based)
 * @param size - page size
 * @param status - Optional status filter ('upcoming', 'ongoing', 'completed', 'cancelled').
 * @param apiVersion - API version path segment (e.g. 'v1')
 */
export const getEventStats = async (
  page = 0,
  size = 10,
  status?: string
): Promise<EventsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (status) {
      params.append("status", status);
    }

    const url = `${API_BASE_URL}/events?${params.toString()}`;
    console.log(`Requesting Event Stats URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch event statistics: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.message) errorMessage += ` - ${errorJson.message}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    // Backend returns Spring Page object
    const pageData: SpringPageResponse<EventStats> = await response.json();
    console.log("Event Stats Page Data:", pageData);

    // Transform to your expected format
    const transformedData: EventsResponse = {
      events: pageData.content.map((event) => ({
        ...event,
        id: String(event.id), // Convert to string if needed
        // Add default values for missing fields
        views: event.attendees, // Use attendees as views (as per your frontend)
        ticketsSold: event.attendees, // Use attendees as ticketsSold
        // Normalize status to lowercase
        status: event.status.toLowerCase() as any,
      })),
      totalEvents: pageData.totalElements,
      totalPages: pageData.totalPages,
      currentPage: pageData.number,
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching event statistics:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      message || "An unexpected error occurred while fetching event statistics."
    );
  }
};

// Helper to format BigDecimal strings from backend
export const formatCurrency = (amount: string | number | undefined): string => {
  if (amount == null) return "$0.00";

  // Remove any character that's not digit, decimal point, minus sign, or exponent
  const sanitized =
    typeof amount === "string"
      ? amount.replace(/[^0-9eE.+-]/g, "")
      : amount.toString();

  const numAmount = Number.parseFloat(sanitized);
  if (isNaN(numAmount)) return "$0.00";
  return `$${numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Helper to format date
export const formatDate = (dateValue: any): string => {
  if (Array.isArray(dateValue)) {
    // Important: In JavaScript, months are 0-based (0 = January)
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    const date = new Date(year, month - 1, day, hour, minute, second);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // fallback if it’s already a string or Date
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


export const getAllInvoices = async (): Promise<Invoice[]> => {
  // Using Invoice type
  try {
    const url = `${API_BASE_URL}/invoices`;

    console.log(`Requesting All Invoices URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch all invoices: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson && typeof (errorJson as any)?.message === "string") {
          errorMessage += ` - ${(errorJson as any).message}`;
        }
      } catch (parseErr) {
        // Ignore JSON parsing error if response body isn't JSON; log if needed
        console.debug(
          "Ignored JSON parse error while reading error body for all invoices:",
          parseErr
        );
      }
      throw new Error(errorMessage);
    }

    const data: Invoice[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all invoices:", error);
    const msg = getErrorMessage(error);
    throw new Error(
      msg || "An unexpected error occurred while fetching all invoices."
    );
  }
};

// Format date for display used in the table
export const formatDisplayDate = (dateInput: string | number[]): string => {
  try {
    if (!dateInput) return "Invalid Date";

    let year: number, month: number, day: number;

    // Handle array format [2025, 9, 27]
    if (Array.isArray(dateInput)) {
      [year, month, day] = dateInput;
    } else {
      // Handle string format "2025-09-27"
      const parts = dateInput.split("-").map(Number);
      [year, month, day] = parts;
    }

    // Validate the parsed values
    if (
      year &&
      month &&
      day &&
      year > 1900 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      // Create date (month is 0-indexed in Date constructor)
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

    // Fallback for other formats - only if input is string
    if (typeof dateInput === "string") {
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });
      }
    }

    return "Invalid Date";
  } catch (error) {
    console.error("Error formatting date:", dateInput, error);
    return "Invalid Date";
  }
};
