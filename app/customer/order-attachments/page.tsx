"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Search, RotateCcw } from "lucide-react";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import { redirectToLogin } from "@/utils/helpers";

// Fetcher with token
const fetcher = async (url: string, token: string | null) => {
    if (!token) return null;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        // @ts-ignore
        error.info = await res.json();
        // @ts-ignore
        error.status = res.status;
        throw error;
    }
    return res.json();
};

export default function OrderAttachmentsPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    // Filters state
    const [searchText, setSearchText] = useState("");
    const [searchOrderId, setSearchOrderId] = useState("");
    const [documentType, setDocumentType] = useState("All");
    const [invoiceDue, setInvoiceDue] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [openingFileId, setOpeningFileId] = useState<string | null>(null);

    // Auth Guard
    useEffect(() => {
        if (authStatus === "unauthenticated") {
            redirectToLogin(router);
        }
    }, [authStatus, router]);

    // Construct API URL with query params
    const token = (session as any)?.accessToken;
    const queryParams = new URLSearchParams();
    if (searchOrderId) queryParams.append("order_id", searchOrderId);
    if (documentType !== "All") queryParams.append("document_type", documentType);
    if (invoiceDue !== "All") queryParams.append("invoice_due", invoiceDue);
    queryParams.append("pageSize", pageSize.toString());
    queryParams.append("currentPage", currentPage.toString());

    const apiUrl = token
        ? `/api/kleverapi/order-attachments/search${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        : null;

    // SWR for data fetching
    const { data, error, isLoading, mutate } = useSWR(
        apiUrl ? [apiUrl, token] : null,
        ([url, t]) => fetcher(url, t)
    );

    // Filter Options
    const { data: filterOptionsData } = useSWR(
        token ? [`/api/kleverapi/order-attachments/filter-options`, token] : null,
        ([url, t]) => fetcher(url, t)
    );

    const docTypeOptions = filterOptionsData?.document_type_options || filterOptionsData?.document_types || [];
    const invoiceDueOptions = filterOptionsData?.invoice_due_options || filterOptionsData?.invoice_due || [];

    // Helper to ensure "All" is present and at the start
    const getOptionsWithAll = (options: any[]) => {
        if (!options || options.length === 0) return ["All"];
        const hasAll = options.some(opt => {
            const label = typeof opt === 'string' ? opt : (opt.label || opt.name || opt.status || "");
            return label.toLowerCase() === "all";
        });
        return hasAll ? options : ["All", ...options];
    };

    const finalDocTypes = getOptionsWithAll(docTypeOptions);
    const finalInvoiceDues = getOptionsWithAll(invoiceDueOptions);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSearchOrderId(searchText);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSearchText("");
        setSearchOrderId("");
        setDocumentType("All");
        setInvoiceDue("All");
        setCurrentPage(1);
    };

    const handleViewOrder = (orderId: string) => {
        if (!orderId) return;
        router.push(`/my-orders/${orderId}`);
    };

    const handleViewFile = async (attachment: any) => {
        const id = attachment.attachment_id || attachment.id;
        const fileUrl = attachment.file_url;
        if (!id) return;

        setOpeningFileId(id);
        try {
            // Build proxy URL with optional file_url for better reliability
            let proxyUrl = `/api/kleverapi/order-attachments/file/${id}`;
            if (fileUrl) {
                proxyUrl += `?url=${encodeURIComponent(fileUrl)}`;
            }

            const res = await fetch(proxyUrl, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Could not fetch file");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');

            // Clean up: revoking immediately might break if the tab isn't loaded, 
            // but we'll let the user decide. Usually, we don't revoke until later.
        } catch (error: any) {
            console.error("View File Error:", error);
            toast.error(error.message || "Unable to open file");
        } finally {
            setOpeningFileId(null);
        }
    };

    const getDocTypeLabel = (fileName: string, origType: string) => {
        // If the backend provides a type (like "Invoice" or "Purchase Order"), use it directly
        if (origType && origType !== "-") return origType;

        if (!fileName) return "Document";
        const ext = fileName.split('.').pop()?.toLowerCase();

        switch (ext) {
            case 'pdf': return "PDF Document";
            case 'jpg':
            case 'jpeg':
            case 'png': return "Image";
            case 'doc':
            case 'docx': return "Word Document";
            case 'xls':
            case 'xlsx': return "Excel Document";
            default: return "Document";
        }
    };

    const formatDate = (dateStr: string | undefined | null) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        } catch {
            return dateStr;
        }
    };

    const attachments = Array.isArray(data) ? data : data?.attachments || data?.items || [];
    const totalItems = data?.total_count || attachments.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    return (
        <>


            <div className="min-h-screen flex flex-col w-full bg-[#fcfcfc] font-rubik">
                <div className="flex flex-1 w-full">
                    {/* Left Sidebar */}
                    <Sidebar />

                    {/* Right Content */}
                    <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-10 min-w-0">
                        <h1 className="text-[26px] font-black text-black mb-10 uppercase tracking-wide">
                            MY ORDER ATTACHMENTS
                        </h1>

                        {/* Search Section */}
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-[200px]">
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Search Order..."
                                    className="w-full bg-white border border-[#ebebeb] rounded-md px-4 py-2.5 text-xs text-black focus:outline-none focus:border-yellow-400 placeholder:text-gray-400 font-bold shadow-sm"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black font-black py-2.5 px-6 rounded-md text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95"
                            >
                                SEARCH
                            </button>
                        </div>

                        {/* Filters Section */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-10 bg-white p-6 border border-[#ebebeb] rounded-md shadow-sm">
                            {/* Document Type */}
                            <div className="md:col-span-3">
                                <label className="block text-xs font-black text-black mb-3 uppercase tracking-wider">
                                    Document
                                </label>
                                <div className="relative">
                                    <select
                                        value={documentType}
                                        onChange={(e) => {
                                            setDocumentType(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full h-[40px] bg-white text-black font-bold border border-gray-300 rounded-md px-4 py-2 text-xs focus:outline-none focus:border-yellow-400 appearance-none cursor-pointer"
                                    >
                                        {finalDocTypes.map((opt: any, idx: number) => {
                                            const label = typeof opt === 'string' ? opt : (opt.label || opt.name || opt.status || String(idx));
                                            const value = typeof opt === 'string' ? opt : (opt.value || opt.id || label);
                                            return (
                                                <option key={`${label}-${idx}`} value={value}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                            <path d="M5 7.5L0 2.5H10L5 7.5Z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Due */}
                            <div className="md:col-span-3">
                                <label className="block text-xs font-black text-black mb-3 uppercase tracking-wider">
                                    Invoice Due
                                </label>
                                <div className="relative">
                                    <select
                                        value={invoiceDue}
                                        onChange={(e) => {
                                            setInvoiceDue(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full h-[40px] bg-white text-black font-bold border border-gray-300 rounded-md px-4 py-2 text-xs focus:outline-none focus:border-yellow-400 appearance-none cursor-pointer"
                                    >
                                        {finalInvoiceDues.map((opt: any, idx: number) => {
                                            const label = typeof opt === 'string' ? opt : (opt.label || opt.name || opt.status || String(idx));
                                            const value = typeof opt === 'string' ? opt : (opt.value || opt.id || label);
                                            return (
                                                <option key={`${label}-${idx}`} value={value}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                            <path d="M5 7.5L0 2.5H10L5 7.5Z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <div className="md:col-span-2">
                                <button
                                    onClick={handleReset}
                                    className="bg-black hover:bg-gray-800 text-white font-black h-[40px] px-8 rounded-md text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
                                >
                                    RESET
                                </button>
                            </div>
                        </div>

                        {/* Table Section */}
                        {error ? (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-md text-center">
                                <p className="font-black text-xs uppercase mb-2">Error Loading Attachments</p>
                                <p className="text-xs">{error.message}</p>
                                <button
                                    onClick={() => mutate()}
                                    className="mt-6 px-10 py-3 bg-red-600 text-white rounded-md font-black text-xs uppercase tracking-widest shadow-md active:scale-95"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : isLoading ? (
                            <div className="bg-white p-16 flex flex-col items-center justify-center border border-[#ebebeb] rounded-md shadow-sm">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mb-4"></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
                            </div>
                        ) : attachments.length > 0 ? (
                            <>
                                <div className="overflow-x-auto w-full border border-[#ebebeb] rounded-md shadow-sm">
                                    <table className="w-full text-left border-collapse bg-white">
                                        <thead className="bg-gray-50 border-b border-[#ebebeb]">
                                            <tr className="h-[50px]">
                                                <th className="px-6 py-3 font-black text-xs text-black uppercase tracking-wider text-center">
                                                    # Order
                                                </th>
                                                <th className="px-6 py-3 font-black text-xs text-black uppercase tracking-wider">
                                                    File Name
                                                </th>
                                                <th className="px-6 py-3 font-black text-xs text-black uppercase tracking-wider text-center">
                                                    Document Type
                                                </th>
                                                <th className="px-6 py-3 font-black text-xs text-black uppercase tracking-wider">
                                                    Created On
                                                </th>
                                                <th className="px-6 py-3 font-black text-xs text-black uppercase tracking-wider">
                                                    Invoice Due
                                                </th>
                                                <th className="px-6 py-3 font-black text-xs text-black uppercase tracking-wider">
                                                    Payment
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attachments.map((attachment: any, idx: number) => {
                                                const attId = attachment.id || attachment.attachment_id || String(idx);
                                                const isOpening = openingFileId === String(attId);

                                                // Mapping based on user provided structure
                                                const orderDisplay = attachment.order_increment_id || attachment.order_id || "-";
                                                const fileName = attachment.file_name || attachment.label || "Download File";
                                                const docTypeLabel = getDocTypeLabel(fileName, attachment.comment || attachment.document_type || attachment.attachment_type);
                                                const createdAt = formatDate(attachment.created_at || attachment.upload_date);
                                                const invoiceDue = attachment.invoice_due ? formatDate(attachment.invoice_due) : "";
                                                const paymentStatus = attachment.payment || attachment.payment_status || "";

                                                return (
                                                    <tr key={attId} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-[#ebebeb] hover:bg-yellow-50/30 transition-colors text-xs`}>
                                                        <td className="px-6 py-4 text-center font-black">
                                                            <button
                                                                onClick={() => handleViewOrder(attachment.order_id)}
                                                                className="text-black hover:text-yellow-600 hover:underline transition-all cursor-pointer focus:outline-none"
                                                            >
                                                                {orderDisplay}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-left font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => {
                                                                        // Use file_path if file_url is missing
                                                                        const useUrl = attachment.file_url || attachment.file_path;
                                                                        handleViewFile({ ...attachment, file_url: useUrl, attachment_id: attId });
                                                                    }}
                                                                    disabled={isOpening}
                                                                    className={`text-black hover:underline inline-block break-all text-left focus:outline-none font-bold ${isOpening ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                >
                                                                    {fileName}
                                                                </button>
                                                                {isOpening && (
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400"></div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold text-gray-600 uppercase">
                                                            {docTypeLabel}
                                                        </td>
                                                        <td className="px-6 py-4 text-left font-bold text-gray-500">
                                                            {createdAt}
                                                        </td>
                                                        <td className="px-6 py-4 text-left font-bold text-gray-500">
                                                            {invoiceDue}
                                                        </td>
                                                        <td className="px-6 py-4 text-left">
                                                            <span className={`px-2 py-1 rounded-md font-black uppercase text-[10px] ${paymentStatus.toLowerCase().includes('paid') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {paymentStatus || "-"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalItems > 0 && (
                                    <div className="mt-8 flex justify-center">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            pageSize={pageSize}
                                            onPageChange={handlePageChange}
                                            onPageSizeChange={handlePageSizeChange}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="border border-[#ebebeb] p-24 text-center rounded-md bg-white shadow-sm">
                                <p className="text-gray-400 italic text-xs uppercase tracking-widest">No order attachments found.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

        </>
    );
}
