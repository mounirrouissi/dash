// src/components/Invoices.tsx
"use client"
import { formatCurrency, formatDate, formatDisplayDate, getAllInvoices, getDashboardMetrics, getEventStats, getRecentInvoices, type DashboardMetrics, type EventsResponse, type Invoice, type MetricValue } from "@/api";
import { ArrowDownRight, ArrowUpRight, CalendarDays, CircleDollarSign, Clock, Eye, FileText, MapPin, TicketIcon, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const initialInvoices: Invoice[] = []

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllInvoices = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getAllInvoices() // Use the new function
        setInvoices(data)
      } catch (error: any) {
        console.error("Failed to load all invoices:", error)
        setError(error.message || "Could not load invoices.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllInvoices()
  }, []) // Empty dependency array means fetch only once on mount

  return (
    <div className="invoices-page">
    {/* Header 
       <header className="invoices-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-title">
              <FileText className="header-icon" />
              <h1 className="text-2xl font-bold text-gray-900">All Invoices</h1>
            </div>
          </div>
        </div>
      </header>*/}

      <main className="invoices-main">
         <div className="invoices-content space-y-8">
            {/* Overall Error Display */}
            {error && (
               <div className="error-alert rounded-xl border-l-4 border-red-500 bg-red-50 p-4" role="alert">
                  <span className="error-label font-semibold">Error!</span> {error}
               </div>
            )}

            <Card className="invoices-section border-0 shadow-lg">
               <CardHeader className="pb-6">
                  <CardTitle className="section-title text-xl font-bold">
                    <FileText className="section-icon text-primary" />
                    All Invoices
                  </CardTitle>
                  <CardDescription className="section-description text-gray-600">
                     A comprehensive list of all {invoices.length} invoices in your account.
                  </CardDescription>
               </CardHeader>
               <CardContent className="table-container">
                  {isLoading ? (
                     <div className="loading-state">Loading invoices...</div>
                  ) : error ? (
                     <div className="error-state">Error loading invoices: {error}</div>
                  ) : invoices.length === 0 ? (
                     <div className="empty-state">No invoices found.</div>
                  ) : (
                     <div className="table-wrapper">
                        <Table>
                           <TableHeader>
                              <TableRow className="bg-gray-50">
                                 <TableHead className="font-semibold text-gray-700">Invoice</TableHead>
                                 <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                                 <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                 <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                 <TableHead className="font-semibold text-gray-700">Status</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {invoices.map((invoice) => (
                                 <TableRow key={invoice.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <TableCell className="invoice-id font-semibold">{invoice.id}</TableCell>
                                    <TableCell className="text-gray-700">{invoice.customerName}</TableCell>
                                    <TableCell className="text-gray-600">{formatDisplayDate(invoice.date)}</TableCell>
                                    <TableCell className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</TableCell>
                                    <TableCell>
                                       <Badge
                                          variant={
                                             invoice.status === "paid"
                                                ? "default"
                                                : invoice.status === "pending"
                                                   ? "secondary"
                                                   : "destructive"
                                          }
                                          className="font-medium"
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
      </main>
    </div>
  )
}