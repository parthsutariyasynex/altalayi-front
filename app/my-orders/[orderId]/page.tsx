"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/utils/helpers";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/app/components/Navbar";

export default function OrderDetailsPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const { orderId } = useParams();

    // State
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auth Guard
    useEffect(() => {
        if (authStatus === "unauthenticated") {
            router.replace("/login");
        }
    }, [authStatus, router]);

    // API Call
    const fetchOrderDetails = useCallback(async () => {
        const token = (session as any)?.accessToken;
        if (!token || !orderId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/kleverapi/order/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch order details");
            }

            const data = await response.json();
            setOrder(data);
        } catch (err: any) {
            setError(err.message || "Something went wrong while fetching order details");
        } finally {
            setIsLoading(false);
        }
    }, [session, orderId]);

    useEffect(() => {
        if (authStatus === "authenticated") {
            fetchOrderDetails();
        }
    }, [authStatus, fetchOrderDetails]);

    // Helpers
    const formatStatus = (status: string) => {
        if (!status) return;
        if (status === "approval_pending") return "Check Pending";
        return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number | string | undefined | null) => {
        return formatPrice(amount);
    };

    if (authStatus === "loading" || (isLoading && !order)) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="flex max-w-[1440px] mx-auto mt-[100px]">
                    <Sidebar />
                    <main className="flex-1 p-8 bg-[#fcfcfc] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623]"></div>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="flex max-w-[1440px] mx-auto mt-[100px]">
                    <Sidebar />
                    <main className="flex-1 p-8 bg-[#fcfcfc]">
                        <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-lg text-center">
                            <p className="font-bold text-[16px] mb-2">Error Loading Order</p>
                            <p className="text-[14px]">{error}</p>
                            <button
                                onClick={fetchOrderDetails}
                                className="mt-4 px-6 py-2 bg-red-600 text-white rounded font-bold text-[12px] uppercase"
                            >
                                Try Again
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const shippingAddress = order.extension_attributes?.shipping_assignments?.[0]?.shipping?.address || order.shipping_address;
    const billingAddress = order.billing_address;
    const paymentMethod = order.payment?.additional_information?.[0] || order.payment?.method || "N/A";

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="flex max-w-[1440px] mx-auto mt-[100px]">
                {/* Left Sidebar */}
                <Sidebar />

                {/* Right Content */}
                <main className="flex-1 p-8 bg-[#fcfcfc] min-h-screen">
                    {/* Header Section */}
                    <div className="flex flex-col mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-4 mb-1">
                                    <h1 className="text-[26px] font-black text-black tracking-tighter uppercase leading-none">
                                        ORDER # {order.increment_id}
                                    </h1>
                                    <div className="px-5 py-1.5 bg-white border border-gray-300 text-black text-[12px] font-bold uppercase rounded-sm shadow-sm">
                                        {formatStatus(order.status)}
                                    </div>
                                </div>
                                <p className="text-gray-900 text-[14px] font-medium">
                                    {formatDate(order.created_at)}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center w-full mt-4">
                            <button
                                onClick={() => console.log("Reorder triggered for", order.increment_id)}
                                className="bg-[#f4b400] hover:bg-[#d9a000] text-black font-bold py-3 px-10 rounded-sm text-[13px] uppercase tracking-wide transition-colors shadow-sm"
                            >
                                REORDER
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-[#f4b400] hover:bg-[#d9a000] text-black font-bold py-3 px-8 rounded-sm text-[13px] uppercase tracking-wide transition-colors shadow-sm flex items-center gap-2"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                                PRINT ORDER
                            </button>
                        </div>
                    </div>

                    {/* Items Ordered Table */}
                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden mb-10 shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4 bg-[#f8f8f8]">
                            <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-tight">
                                Items Ordered
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#fcfcfc] text-[11px] font-bold text-black uppercase border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-black">PRODUCT NAME</th>
                                        <th className="px-6 py-4 font-black">SKU</th>
                                        <th className="px-6 py-4 font-black text-right">PRICE</th>
                                        <th className="px-6 py-4 font-black text-center">QTY</th>
                                        <th className="px-6 py-4 font-black text-right">ITEM TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {order.items?.map((item: any) => (
                                        <tr key={item.item_id || item.id} className="text-[13px] hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-5 text-gray-900 font-bold">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">
                                                {item.sku}
                                            </td>
                                            <td className="px-6 py-5 text-right text-gray-900 font-medium">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-6 py-5 text-center text-gray-700">
                                                Ordered: {Math.round(item.qty_ordered)}
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-black">
                                                {formatCurrency(item.row_total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Order Summary */}
                        <div className="flex justify-end p-8 bg-white border-t border-gray-50">
                            <div className="w-full max-w-[340px] space-y-4">
                                <div className="flex justify-between items-center text-[14px]">
                                    <span className="text-gray-900 font-bold uppercase text-right flex-1 mr-10">Items Total</span>
                                    <span className="font-bold text-gray-900 w-[110px] text-right">
                                        {formatCurrency(order.subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-[14px]">
                                    <span className="text-gray-900 font-bold uppercase text-right flex-1 mr-10">VAT (15%)</span>
                                    <span className="font-bold text-gray-900 w-[110px] text-right">
                                        {formatCurrency(order.tax_amount)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-black pt-2">
                                    <span className="font-black uppercase text-right flex-1 mr-10 text-[18px]">Grand Total</span>
                                    <span className="font-black w-[110px] text-right text-[18px]">
                                        {formatCurrency(order.grand_total)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-[14px] pt-1">
                                    <span className="text-gray-900 font-bold uppercase text-right flex-1 mr-10">Total Qty</span>
                                    <span className="font-bold text-black w-[110px] text-right">
                                        {Math.round(order.total_item_count || order.items?.reduce((acc: number, item: any) => acc + (item.qty_ordered || 0), 0))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Information Section */}
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                                Order Information
                            </h2>
                            <div className="h-[1px] bg-gray-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Address */}
                            <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
                                <div className="bg-[#f0f0f0] px-5 py-3 border-b border-gray-200">
                                    <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-tight">Shipping Address</h3>
                                </div>
                                <div className="p-6 text-[14px] text-gray-800 leading-[1.6] min-h-[140px]">
                                    {shippingAddress ? (
                                        <>
                                            <p className="font-bold text-black">{shippingAddress.firstname} {shippingAddress.lastname}</p>
                                            <p>{shippingAddress.street?.join(", ")}</p>
                                            <p>{shippingAddress.city}, {shippingAddress.postcode}</p>
                                            <p>{shippingAddress.country_id === "SA" ? "Saudi Arabia" : shippingAddress.country_id}</p>
                                            <p className="mt-2 font-bold">T: {shippingAddress.telephone}</p>
                                        </>
                                    ) : (
                                        "No shipping address available"
                                    )}
                                </div>
                            </div>

                            {/* Shipping Method */}
                            <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
                                <div className="bg-[#f0f0f0] px-5 py-3 border-b border-gray-200">
                                    <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-tight">Shipping Method</h3>
                                </div>
                                <div className="p-6 text-[14px] text-gray-800 leading-[1.6] min-h-[140px]">
                                    <p className="font-bold">{order.shipping_description || "Standard Shipping"}</p>
                                </div>
                            </div>

                            {/* Billing Address */}
                            <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
                                <div className="bg-[#f0f0f0] px-5 py-3 border-b border-gray-200">
                                    <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-tight">Billing Address</h3>
                                </div>
                                <div className="p-6 text-[14px] text-gray-800 leading-[1.6] min-h-[140px]">
                                    {billingAddress ? (
                                        <>
                                            <p className="font-bold text-black">{billingAddress.firstname} {billingAddress.lastname}</p>
                                            <p>{billingAddress.street?.join(", ")}</p>
                                            <p>{billingAddress.city}, {billingAddress.postcode}</p>
                                            <p>{billingAddress.country_id === "SA" ? "Saudi Arabia" : billingAddress.country_id}</p>
                                            <p className="mt-2 font-bold">T: {billingAddress.telephone}</p>
                                        </>
                                    ) : (
                                        "No billing address available"
                                    )}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
                                <div className="bg-[#f0f0f0] px-5 py-3 border-b border-gray-200">
                                    <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-tight">Payment Method</h3>
                                </div>
                                <div className="p-6 text-[14px] text-gray-800 leading-[1.6] min-h-[140px]">
                                    <p className="font-bold">{order.payment?.method_title || paymentMethod}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Attachments Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-[14px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                                Order Attachments
                            </h2>
                            <div className="h-[1px] bg-gray-200 flex-1"></div>
                        </div>

                        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#fcfcfc] text-[11px] font-bold text-black uppercase border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 font-black">File Name</th>
                                            <th className="px-6 py-4 font-black">Document Type</th>
                                            <th className="px-6 py-4 font-black">Created On</th>
                                            <th className="px-6 py-4 font-black">Invoice Due</th>
                                            <th className="px-6 py-4 font-black">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(order.extension_attributes?.attachments ||
                                            order.extension_attributes?.order_attachments ||
                                            order.attachments)?.length > 0 ? (
                                            (order.extension_attributes?.attachments ||
                                                order.extension_attributes?.order_attachments ||
                                                order.attachments).map((attachment: any, idx: number) => (
                                                    <tr key={idx} className="text-[13px] hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-5">
                                                            <a href={attachment.file_url} target="_blank" rel="noreferrer" className="text-gray-900 font-bold hover:underline">
                                                                {attachment.file_name}
                                                            </a>
                                                        </td>
                                                        <td className="px-6 py-5 text-gray-600 uppercase text-[12px]">{attachment.document_type || "N/A"}</td>
                                                        <td className="px-6 py-5 text-gray-600">
                                                            {attachment.created_at ? new Date(attachment.created_at).toLocaleDateString("en-GB") : "-"}
                                                        </td>
                                                        <td className="px-6 py-5 text-gray-600">{attachment.invoice_due || "-"}</td>
                                                        <td className="px-6 py-5 text-gray-600">{attachment.payment_status || "-"}</td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic">
                                                    No attachments found for this order
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Custom Styles for Printing */}
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    main { margin-top: 0 !important; padding: 0 !important; }
                    .flex.max-w-\[1440px\] { display: block !important; }
                    aside, nav { display: none !important; }
                }
            `}</style>
        </div>
    );
}
