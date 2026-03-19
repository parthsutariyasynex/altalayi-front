"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/app/components/Navbar";
import Filters from "@/components/Filters";
import OrdersTable, { Order } from "@/components/OrdersTable";
import Pagination from "@/components/Pagination";
import { useCart } from "@/modules/cart/context/CartContext";
import { toast } from "react-hot-toast";

function mapOrder(item: any): Order {
    // Order #
    const id = item.increment_id || "";

    // SAP Order Number — not in API
    const sapOrderNumber = item.sap_order_number || "";

    // Date → M/D/YY (e.g. "3/17/26")
    let date = "";
    if (item.created_at) {
        const d = new Date(item.created_at);
        date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
    }

    // Grand Total → "﷼ 5,836.25"
    const grandTotal = formatPrice(item.grand_total);

    // Ordered By - prioritize direct ordered_by field, fallback to billing address or customer name
    let orderedBy = item.ordered_by || "";
    if (!orderedBy && item.billing_address) {
        orderedBy = `${item.billing_address.firstname || ""} ${item.billing_address.lastname || ""}`.trim();
    }
    if (!orderedBy && (item.customer_firstname || item.customer_lastname)) {
        orderedBy = `${item.customer_firstname || ""} ${item.customer_lastname || ""}`.trim();
    }

    // Status
    let status = item.status || "";
    if (status === "approval_pending") {
        status = "Check Pending";
    } else if (status) {
        status = status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    }

    return {
        id,
        sapOrderNumber,
        date,
        grandTotal,
        orderedBy,
        status,
        increment_id: item.increment_id || "",
        entity_id: (item.entity_id || item.order_id || item.increment_id || "").toString(),
    };
}

export default function MyOrdersPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const { refetchCart } = useCart();

    const [orders, setOrders] = useState<Order[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [appliedStatus, setAppliedStatus] = useState("All");

    useEffect(() => {
        if (authStatus === "unauthenticated") {
            router.replace("/login");
        }
    }, [authStatus, router]);

    const fetchOrders = useCallback(async () => {
        const token = (session as any)?.accessToken;
        if (!token) return;

        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                pageSize: pageSize.toString(),
                currentPage: currentPage.toString(),
            });
            if (appliedStatus !== "All") {
                params.append("status", appliedStatus);
            }
            if (appliedSearch) {
                params.append("orderNumber", appliedSearch);
            }

            const res = await fetch(`/api/kleverapi/my-orders?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

            const items: any[] = data.items || [];
            setOrders(items.map(mapOrder));
            setTotalItems(data.total_count || items.length);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
            setHasFetched(true);
        }
    }, [session, currentPage, pageSize, appliedSearch, appliedStatus]);

    useEffect(() => {
        if (authStatus === "authenticated") {
            fetchOrders();
        }
    }, [authStatus, fetchOrders]);

    const handleSearchClick = () => {
        setAppliedSearch(search);
        setAppliedStatus(selectedStatus);
        setCurrentPage(1);
    };

    const handleResetClick = () => {
        setSearch("");
        setSelectedStatus("All");
        setAppliedSearch("");
        setAppliedStatus("All");
        setCurrentPage(1);
    };

    const handleViewOrder = (entityId: string) => {
        router.push(`/my-orders/${entityId}`);
    };

    const handleReorder = async (order: Order) => {
        const token = (session as any)?.accessToken;
        if (!token) {
            toast.error("You must be logged in to reorder.");
            return;
        }

        const toastId = toast.loading("Adding items to cart...");
        try {
            const res = await fetch(`/api/kleverapi/order/${order.entity_id}/reorder`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to reorder");

            await refetchCart();
            toast.success("Items added to cart", { id: toastId });
            router.push("/cart");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong", { id: toastId });
        }
    };

    const handleExportOrders = async () => {
        const token = (session as any)?.accessToken;
        if (!token) {
            toast.error("You must be logged in to export orders.");
            return;
        }

        setIsExporting(true);
        const toastId = toast.loading("Exporting orders...");

        try {
            const response = await fetch("/api/kleverapi/orders/export", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to export orders");

            const base64Content = data.pdf_base64 || data.content || data.base64 || data.csv_base64;
            if (!base64Content) throw new Error("No file content received from server");

            // --- Base64 to Blob (Uint8Array approach) ---
            const byteCharacters = atob(base64Content);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "text/csv" });

            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = data.filename || `Orders_Export_${new Date().getTime()}.csv`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);

            toast.success("Orders exported successfully", { id: toastId });
        } catch (err: any) {
            console.error("Export Error:", err);
            toast.error(err.message || "Something went wrong", { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    const totalPages = Math.ceil(totalItems / pageSize);

    if (authStatus === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#f5a623]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-['Rubik']">
            <Navbar />

            <div className="flex max-w-[1440px] mx-auto mt-[80px]">
                <Sidebar />

                <main className="flex-1 p-8 min-h-screen">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-[24px] font-bold text-black uppercase">
                            MY ORDERS
                        </h1>
                        <button
                            onClick={handleExportOrders}
                            disabled={isExporting}
                            className={`flex items-center gap-2 border-2 border-[#f5a623] text-black text-[12px] font-bold px-5 py-2 uppercase tracking-wide hover:bg-[#f5a623] transition-colors ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isExporting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                            {isExporting ? 'Exporting...' : 'Export Orders'}
                        </button>
                    </div>

                    <Filters
                        status={selectedStatus}
                        search={search}
                        onStatusChange={setSelectedStatus}
                        onSearchChange={setSearch}
                        onApplySearch={handleSearchClick}
                        onReset={handleResetClick}
                    />

                    {(isLoading || (authStatus === "authenticated" && !hasFetched)) ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f5a623]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 text-red-500">
                            <p className="text-[14px] font-medium mb-3">{error}</p>
                            <button onClick={fetchOrders} className="text-[12px] font-bold uppercase underline underline-offset-4 text-black hover:text-[#f5a623]">
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <OrdersTable
                                orders={orders}
                                onViewOrder={handleViewOrder}
                                onReorder={handleReorder}
                            />
                            {totalItems > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    pageSize={pageSize}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
