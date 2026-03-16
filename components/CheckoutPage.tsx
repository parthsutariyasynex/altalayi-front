"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "@/app/components/Navbar";
import { useCart } from "@/modules/cart/hooks/useCart";
import { useCheckout, Address } from "@/modules/checkout/hooks/useCheckout";
import {
    Search,
    Plus,
    Edit2,
    ChevronDown,
    Upload,
    Truck,
    Warehouse,
    CreditCard,
    Check,
    MapPin,
    Phone,
    User,
    ShoppingBag,
    Loader2,
    ArrowLeft,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import SelectedAddressCard from "./SelectedAddressCard";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Sub-components ---

const SectionHeader = ({ title, step }: { title: string; step?: number }) => (
    <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        {step && (
            <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">
                {step}
            </span>
        )}
        <h3 className="text-[14px] font-black text-black uppercase tracking-[0.2em]">
            {title}
        </h3>
    </div>
);

const CheckoutPageUI: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Hooks
    const { cart, isLoading: isCartLoading, updateCartItem } = useCart();
    const {
        addresses,
        shippingMethods,
        paymentMethods,
        totals,
        isLoading: isCheckoutLoading,
        isTotalsLoading,
        setShippingAddress,
        addAddress,
        placeOrder,
        savePoNumber,
        uploadPoFile,
        getPoUpload,
        deletePoFile,
        setShippingMethod,
        stores,
        refetchPickupStores,
        fetchPickupTimeSlots,
    } = useCheckout();

    // --- State ---
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [poNumber, setPoNumber] = useState("");
    const [shippingType, setShippingType] = useState<"delivery" | "pickup">("delivery");
    const [selectedWarehouse, setSelectedWarehouse] = useState("");
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [selectedShippingMethodCode, setSelectedShippingMethodCode] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("credit_account");
    const [comment, setComment] = useState("");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isPoUploadOpen, setIsPoUploadOpen] = useState(false);
    const [uploadedPO, setUploadedPO] = useState<{ fileName: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isPaymentCommitmentOpen, setIsPaymentCommitmentOpen] = useState(false);
    const [isItemsListOpen, setIsItemsListOpen] = useState(true);
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [tempSelectedWarehouse, setTempSelectedWarehouse] = useState<{ id: string; name: string } | null>(null);

    // Pickup Form States
    const [isPickupFormOpen, setIsPickupFormOpen] = useState(false);
    const [pickupName, setPickupName] = useState("");
    const [pickupId, setPickupId] = useState("");
    const [pickupMobile, setPickupMobile] = useState("");
    const [pickupDate, setPickupDate] = useState<Date | null>(null);
    const [pickupTime, setPickupTime] = useState("");
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<{ time: string; label: string; enabled: boolean }[]>([]);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
    const timeRef = useRef<HTMLDivElement>(null);
    const dateRef = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<any>(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (timeRef.current && !timeRef.current.contains(event.target as Node)) {
                setIsTimeDropdownOpen(false);
            }
            if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
                setIsDateDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Generate next 14 days
    useEffect(() => {
        const dates = [];
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        setAvailableDates(dates);

        // Auto-select today by default if nothing is selected
        if (!pickupDate && dates.length > 0) {
            setPickupDate(dates[0]);
        }
    }, []);
    // Fetch stores if pickup is selected
    useEffect(() => {
        if (shippingType === "pickup" && stores.length === 0) {
            refetchPickupStores();
        }
    }, [shippingType, stores.length, refetchPickupStores]);
    // Fetch dynamic time slots
    useEffect(() => {
        const getSlots = async () => {
            if (shippingType === "pickup" && selectedWarehouseId && pickupDate) {
                setIsLoadingTimeSlots(true);
                try {
                    const year = pickupDate.getFullYear();
                    const month = String(pickupDate.getMonth() + 1).padStart(2, '0');
                    const day = String(pickupDate.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;

                    let slots = await fetchPickupTimeSlots(selectedWarehouseId, formattedDate);

                    // If API returns empty or we want to ensure "this type proper" intervals as per user image
                    if (!slots || slots.length === 0) {
                        const generatedSlots = [];
                        for (let h = 0; h < 24; h++) {
                            for (let m = 0; m < 60; m += 30) {
                                let hh = h % 12;
                                if (hh === 0) hh = 12;
                                const ampm = h < 12 ? 'am' : 'pm';
                                const mm = m === 0 ? '00' : '30';
                                const h24 = String(h).padStart(2, '0');
                                const m24 = String(m).padStart(2, '0');
                                generatedSlots.push({
                                    time: `${h24}:${m24}`,
                                    label: `${hh}:${mm}${ampm}`,
                                    enabled: true
                                });
                            }
                        }
                        slots = generatedSlots;
                    }

                    setAvailableTimeSlots(slots);

                    // Reset selected time if it's not in the new slots or disabled
                    const currentSlot = slots.find((s: { time: string; enabled: boolean }) => s.time === pickupTime);
                    if (pickupTime && (!currentSlot || !currentSlot.enabled)) {
                        setPickupTime("");
                    }
                } catch (error) {
                    console.error("Failed to fetch time slots:", error);
                    toast.error("Failed to fetch available time slots");
                } finally {
                    setIsLoadingTimeSlots(false);
                }
            }
        };
        getSlots();
    }, [shippingType, selectedWarehouseId, pickupDate, fetchPickupTimeSlots]);

    // File inputs refs
    const poUploadRef = useRef<HTMLInputElement>(null);
    const paymentCommitmentRef = useRef<HTMLInputElement>(null);

    // Auth Guard
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callback=/checkout");
        }
    }, [status, router]);

    // Defaults
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setShippingAddress(defaultAddr.id).catch(() => { });
        }
    }, [addresses]);

    // Fetch existing PO Upload
    useEffect(() => {
        const fetchPoUpload = async () => {
            try {
                const data = await getPoUpload();
                if (data && data.fileName) {
                    setUploadedPO({ fileName: data.fileName });
                }
            } catch (err) {
                console.error("Failed to fetch PO upload:", err);
            }
        };

        if (status === "authenticated") {
            fetchPoUpload();
        }
    }, [status, getPoUpload]);

    // Memoized filtered addresses
    const filteredAddresses = useMemo(() => {
        return addresses.filter(addr =>
            `${addr.firstname} ${addr.lastname} ${addr.street} ${addr.city}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
    }, [addresses, searchQuery]);

    // Handlers
    const handleAddressSelect = async (id: string) => {
        setSelectedAddressId(id);
        try {
            await setShippingAddress(id);
        } catch {
            toast.error("Failed to update shipping address");
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a shipping address");
            return;
        }

        setIsPlacingOrder(true);
        try {
            if (!selectedShippingMethodCode) {
                toast.error("Please select a shipping method");
                setIsPlacingOrder(false);
                return;
            }

            await placeOrder({
                address_id: Number(selectedAddressId),
                shipping_method: selectedShippingMethodCode,
                payment_method: paymentMethod,
            });
            toast.success("Order placed successfully!");
            router.push("/checkout/success");
        } catch (error: any) {
            toast.error(error.message || "Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handlePoNumberBlur = async () => {
        if (!poNumber) return;
        try {
            await savePoNumber(poNumber);
            toast.success("PO Number saved");
        } catch (error: any) {
            toast.error(error.message || "Failed to save PO number");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Content = reader.result?.toString().split(",")[1];
            if (!base64Content) {
                toast.error("Failed to read file");
                setIsUploading(false);
                return;
            }

            try {
                await uploadPoFile({
                    fileName: file.name,
                    fileContent: base64Content,
                    type: "po",
                });
                setUploadedPO({ fileName: file.name });
                toast.success("PO File uploaded successfully");
            } catch (error: any) {
                toast.error(error.message || "Failed to upload file");
            } finally {
                setIsUploading(false);
            }
        };
        reader.onerror = () => {
            toast.error("File reading error");
            setIsUploading(false);
        };
    };

    const handleDeletePo = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!uploadedPO) return;

        try {
            setIsUploading(true);
            await deletePoFile(uploadedPO.fileName);
            setUploadedPO(null);
            toast.success("PO File removed successfully");
            if (poUploadRef.current) poUploadRef.current.value = "";
        } catch (error: any) {
            toast.error(error.message || "Failed to remove file");
        } finally {
            setIsUploading(false);
        }
    };

    const handleShippingMethodSelect = async (code: string) => {
        const method = shippingMethods.find(m => m.code === code);
        if (!method) return;

        setSelectedShippingMethodCode(code);
        try {
            await setShippingMethod(method.carrierCode, method.methodCode);
        } catch (error: any) {
            toast.error(error.message || "Failed to update shipping method");
        }
    };
    if (isCartLoading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#F5B21B] rounded-full animate-spin" />
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">Preparing Checkout...</p>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto py-24 px-6 text-center">
                    <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
                    <h1 className="text-2xl font-black text-black uppercase tracking-widest mb-4">Your cart is empty</h1>
                    <Link href="/products" className="inline-flex items-center gap-2 bg-[#F5B21B] text-black font-black px-8 py-4 text-[12px] uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    const displayTotals = {
        subtotal: totals?.subtotal ?? cart.subtotal,
        tax_amount: totals?.tax_amount ?? cart.tax_amount,
        shipping_amount: totals?.shipping_amount ?? 0,
        grand_total: totals?.grand_total ?? cart.grand_total,
    };

    return (
        <div className="bg-[#F8F9FA] min-h-screen font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto py-10 px-4 lg:px-6">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/cart" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-[11px] font-black uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Cart
                    </Link>
                    <h1 className="text-2xl font-black text-black uppercase tracking-[0.2em]">Checkout</h1>
                    <div className="w-24"></div> {/* Spacer */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ═══════════ Left Column ═══════════ */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. Shipping Address */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
                            <SectionHeader title="Shipping Address" step={1} />
                            <div className="p-4">
                                {/* Search */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search Address"
                                        className="w-full px-4 py-2 bg-white border border-gray-200 outline-none text-[14px] transition-all placeholder:text-gray-400 focus:border-[#F5B21B]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Address List Container */}
                                <div className="max-h-[460px] overflow-y-auto pr-1 card-scrollbar space-y-4">
                                    {filteredAddresses.map((addr) => (
                                        selectedAddressId === addr.id ? (
                                            <SelectedAddressCard
                                                key={addr.id}
                                                address={addr}
                                                onEdit={() => {
                                                    toast.success("Edit feature coming soon!");
                                                }}
                                            />
                                        ) : (
                                            <div
                                                key={addr.id}
                                                className="relative flex items-start gap-4 cursor-pointer group p-5 border border-gray-100 bg-gray-50/30 hover:border-gray-300 hover:bg-white transition-all duration-300 rounded-sm"
                                                onClick={() => handleAddressSelect(addr.id)}
                                            >
                                                {/* Selection Indicator */}
                                                <div className="relative flex-shrink-0 mt-1">
                                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-gray-400 flex items-center justify-center transition-all duration-300">
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">

                                                    <div className="text-[13px] text-gray-600 leading-relaxed mb-4">
                                                        <p className="font-medium text-[14px] text-black">
                                                            <span className="font-black">{addr.firstname} {addr.lastname}</span>{" "}
                                                            {addr.street} {addr.city}, {addr.postcode}{" "}
                                                            {addr.country_id === 'SA' ? 'Saudi Arabia' : addr.country_id} {addr.telephone}
                                                            {[
                                                                addr.custom_attributes?.find(ca => ca.attribute_code === 'store_view')?.value,
                                                                addr.custom_attributes?.find(ca => ca.attribute_code === 'region_ship_to_party')?.value
                                                            ].filter(Boolean).map(val => ` ${val}`).join("")}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-3 pt-2">
                                                        <button
                                                            className="text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 transition-all duration-300 border bg-white text-black border-gray-200 hover:bg-black hover:text-white hover:border-black"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddressSelect(addr.id);
                                                            }}
                                                        >
                                                            Ship Here
                                                        </button>
                                                        <button
                                                            className="text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 bg-white text-gray-400 border border-gray-100 hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all duration-300"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toast.success("Edit feature coming soon!");
                                                            }}
                                                        >
                                                            Edit Address
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}

                                    {filteredAddresses.length === 0 && (
                                        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-sm">
                                            <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">No matching addresses found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Customer PO Number */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                            <SectionHeader title="Customer PO Number" step={2} />
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">PO Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 outline-none text-[14px] font-medium transition-all placeholder:text-gray-300 focus:bg-white focus:border-black"
                                        value={poNumber}
                                        onChange={(e) => setPoNumber(e.target.value)}
                                        onBlur={handlePoNumberBlur}
                                        placeholder="Enter your Purchase Order number"
                                    />
                                </div>

                                <div className="border border-gray-100 rounded-sm">
                                    <div
                                        className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-100 cursor-pointer group hover:bg-white transition-colors"
                                        onClick={() => setIsPoUploadOpen(!isPoUploadOpen)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[12px] font-black text-black uppercase tracking-widest">Upload PO Document</span>
                                            {uploadedPO && (
                                                <div className="flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-100 rounded-sm">
                                                    <span className="text-[10px] text-green-700 flex items-center gap-1 font-bold truncate max-w-[150px]">
                                                        {uploadedPO.fileName} <Check size={12} />
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePo(e);
                                                        }}
                                                        disabled={isUploading}
                                                        className="p-1 hover:bg-green-100 rounded-full transition-colors"
                                                        title="Remove file"
                                                    >
                                                        <Trash2 size={12} className="text-green-600 hover:text-red-500" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-400 transition-transform duration-300 ${isPoUploadOpen ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                    {isPoUploadOpen && (
                                        <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-300">
                                            <div
                                                className={`w-full py-12 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 rounded-sm ${isUploading
                                                    ? "border-gray-100 opacity-50 cursor-wait"
                                                    : "border-gray-200 bg-gray-50/50 hover:border-black hover:bg-white"
                                                    }`}
                                                onClick={() => !isUploading && poUploadRef.current?.click()}
                                            >
                                                {isUploading ? (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Loader2 size={24} className="animate-spin text-black" />
                                                        <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-center px-6">
                                                        <p className="text-[14px] text-black font-bold mb-1">Click or drag file to upload</p>
                                                        <p className="text-[10px] text-gray-400 font-medium max-w-[280px] mx-auto">
                                                            Accepted formats: JPG, PNG, PDF, DOCX, XLS, CSV. Max size 5MB.
                                                        </p>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={poUploadRef}
                                                    onChange={handleFileUpload}
                                                    accept=".jpg,.jpeg,.png,.zip,.rar,.docx,.doc,.pdf,.xls,.xlsx,.csv,.msg"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Shipping Methods */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                            <div className="bg-[#F2F2F2] px-6 py-4 border-b border-gray-200">
                                <h3 className="text-[14px] font-black text-[#333] uppercase tracking-wider">
                                    SHIPPING METHODS
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Delivery Option */}
                                    <div
                                        className="flex items-center gap-4 cursor-pointer group"
                                        onClick={() => {
                                            setShippingType("delivery");
                                            const deliveryMethod = shippingMethods.find(m => !m.code.includes("pickup"));
                                            if (deliveryMethod) handleShippingMethodSelect(deliveryMethod.code);
                                        }}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${shippingType === "delivery" ? "border-black" : "border-gray-400 group-hover:border-gray-600"}`}>
                                            {shippingType === "delivery" && (
                                                <div className="w-2.5 h-2.5 bg-black rounded-full" />
                                            )}
                                        </div>
                                        <span className={`text-[15px] font-bold transition-colors ${shippingType === "delivery" ? "text-black" : "text-[#555]"}`}>
                                            Delivery
                                        </span>
                                    </div>

                                    <div className="border-t border-dashed border-gray-300 w-full" />

                                    {/* Pickup Option */}
                                    <div className="space-y-5">
                                        <div
                                            className="flex items-center gap-4 cursor-pointer group"
                                            onClick={() => {
                                                setShippingType("pickup");
                                                const pickupMethod = shippingMethods.find(m => m.code.includes("pickup"));
                                                if (pickupMethod) handleShippingMethodSelect(pickupMethod.code);
                                            }}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${shippingType === "pickup" ? "border-black" : "border-gray-400 group-hover:border-gray-600"}`}>
                                                {shippingType === "pickup" && (
                                                    <div className="w-2.5 h-2.5 bg-black rounded-full" />
                                                )}
                                            </div>
                                            <span className={`text-[15px] font-bold transition-colors ${shippingType === "pickup" ? "text-black" : "text-[#555]"}`}>
                                                Pickup from Warehouse
                                            </span>
                                        </div>

                                        {shippingType === "pickup" && (
                                            <div className="ml-9 space-y-4">
                                                <div className="flex flex-col items-start gap-4">
                                                    <button
                                                        className="bg-[#F5B21B] text-black px-8 py-3 text-[12px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95 border border-transparent shadow-sm"
                                                        onClick={() => {
                                                            setIsWarehouseModalOpen(true);
                                                            setIsPickupFormOpen(!isPickupFormOpen);
                                                        }}
                                                    >
                                                        SELECT WAREHOUSE
                                                    </button>

                                                    {selectedWarehouse && (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-sm">
                                                            <span className="text-[12px] font-bold text-gray-800 uppercase tracking-widest">
                                                                Selected: <span className="text-black">{selectedWarehouse}</span>
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsWarehouseModalOpen(true);
                                                                }}
                                                                className="text-[10px] text-blue-600 font-bold hover:underline"
                                                            >
                                                                Change
                                                            </button>
                                                            <div className="w-px h-3 bg-gray-300 mx-1" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsPickupFormOpen(!isPickupFormOpen);
                                                                }}
                                                                className="text-[10px] text-black font-bold hover:underline"
                                                            >
                                                                {isPickupFormOpen ? "Hide" : "Edit"} Details
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Pickup Details Form */}
                                                {isPickupFormOpen && (
                                                    <div className="p-6 bg-[#F8F9FA] border border-gray-200 rounded-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                        {/* Row 1: Name & ID */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap min-w-[110px]">Person Name *</label>
                                                                <input
                                                                    type="text"
                                                                    value={pickupName}
                                                                    onChange={(e) => setPickupName(e.target.value)}
                                                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 outline-none text-[14px] font-medium transition-all focus:border-black hover:border-gray-400 h-10"
                                                                    placeholder="Enter Name"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap min-w-[90px] md:min-w-[80px]">Person ID *</label>
                                                                <input
                                                                    type="text"
                                                                    value={pickupId}
                                                                    onChange={(e) => setPickupId(e.target.value)}
                                                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 outline-none text-[14px] font-medium transition-all focus:border-black hover:border-gray-400 h-10"
                                                                    placeholder="Enter ID"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Row 2: Mobile Number */}
                                                        <div className="flex items-center gap-3">
                                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap min-w-[110px]">Mobile Number *</label>
                                                            <input
                                                                type="tel"
                                                                value={pickupMobile}
                                                                onChange={(e) => setPickupMobile(e.target.value)}
                                                                className="flex-1 px-4 py-2 bg-white border border-gray-300 outline-none text-[14px] font-medium transition-all focus:border-black hover:border-gray-400 h-10"
                                                                placeholder="Enter Mobile Number"
                                                            />
                                                        </div>

                                                        {/* Row 3: Date & Time */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Custom Date Picker - Dropdown List Type */}
                                                            <div className="flex items-center gap-3 relative" ref={dateRef}>
                                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap min-w-[110px]">Pick Up Date *</label>
                                                                <div className="relative flex-1">
                                                                    <div
                                                                        className="w-full h-10 px-4 py-2 bg-white border border-gray-300 outline-none text-[14px] font-medium transition-all cursor-pointer flex justify-between items-center hover:border-gray-400"
                                                                        onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                                                                    >
                                                                        <span className={pickupDate ? "text-black" : "text-gray-400"}>
                                                                            {pickupDate ? pickupDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Select Date"}
                                                                        </span>
                                                                        <ChevronDown size={14} className={`transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
                                                                    </div>

                                                                    {isDateDropdownOpen && (
                                                                        <div className="absolute z-[110] left-0 right-0 mt-1 bg-white border border-gray-300 shadow-md max-h-[220px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                                                                            {availableDates.map((date) => {
                                                                                const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                                                const isSelected = pickupDate?.toDateString() === date.toDateString();
                                                                                return (
                                                                                    <div
                                                                                        key={dateStr}
                                                                                        className={`px-3 py-1.5 text-[14px] cursor-pointer hover:bg-blue-600 hover:text-white transition-colors ${isSelected ? 'bg-gray-100 font-bold text-black' : 'text-[#444]'}`}
                                                                                        style={{ fontFamily: 'Arial, sans-serif' }}
                                                                                        onClick={() => {
                                                                                            setPickupDate(date);
                                                                                            setIsDateDropdownOpen(false);
                                                                                        }}
                                                                                    >
                                                                                        {date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Custom Time Picker */}
                                                            <div className="flex items-center gap-3 relative" ref={timeRef}>
                                                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap min-w-[90px] md:min-w-[80px]">Pick Up Time *</label>
                                                                <div className="relative flex-1">
                                                                    <div
                                                                        className="w-full h-10 px-4 py-2 bg-white border border-gray-300 outline-none text-[14px] font-medium transition-all cursor-pointer flex justify-between items-center hover:border-gray-400"
                                                                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                                                    >
                                                                        <span className={pickupTime ? "text-black" : "text-gray-400"}>
                                                                            {pickupTime ? (availableTimeSlots.find((s: { time: string; label: string }) => s.time === pickupTime)?.label || pickupTime) : "Select Time"}
                                                                        </span>
                                                                        <ChevronDown size={14} className={`transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                                                                    </div>

                                                                    {isTimeDropdownOpen && (
                                                                        <div className="absolute z-[110] left-0 right-0 mt-1 bg-white border border-gray-300 shadow-md max-h-[220px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                                                                            {isLoadingTimeSlots ? (
                                                                                <div className="px-4 py-6 text-center">
                                                                                    <Loader2 size={16} className="animate-spin mx-auto text-gray-400 mb-2" />
                                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Loading slots...</span>
                                                                                </div>
                                                                            ) : (availableTimeSlots.length > 0 ? (
                                                                                availableTimeSlots.map((slot: any) => (
                                                                                    <div
                                                                                        key={slot.time}
                                                                                        className={`px-3 py-1.5 text-[14px] transition-colors cursor-pointer hover:bg-blue-600 hover:text-white text-[#444]
                                                                                            ${pickupTime === slot.time ? 'bg-gray-100 font-bold text-black' : ''}`}
                                                                                        style={{ fontFamily: 'Arial, sans-serif' }}
                                                                                        onClick={() => {
                                                                                            setPickupTime(slot.time);
                                                                                            setIsTimeDropdownOpen(false);
                                                                                        }}
                                                                                    >
                                                                                        {slot.label}
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <div className="px-4 py-8 text-center border-t border-gray-50">
                                                                                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest block mb-1">
                                                                                        {!pickupDate ? "Please select a date first" : "No slots available"}
                                                                                    </span>
                                                                                    {pickupDate && (
                                                                                        <span className="text-[9px] text-gray-300 uppercase font-medium">Try another date or contact the warehouse</span>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Payment Method */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">
                            <SectionHeader title="Payment Method" step={4} />
                            <div className="p-6 space-y-6">
                                <div
                                    className="flex items-center gap-5 p-5 border-2 border-black bg-white shadow-md rounded-sm cursor-pointer"
                                    onClick={() => setPaymentMethod("credit_account")}
                                >
                                    <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
                                        <div className="w-3 h-3 bg-black rounded-full" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[14px] font-black text-black uppercase tracking-widest">Credit Account</p>
                                        <p className="text-[11px] text-gray-400 font-medium">Pay using your available credit limit</p>
                                    </div>
                                    <div className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                        Default
                                    </div>
                                </div>

                                <div className="border border-gray-100 rounded-sm">
                                    <div
                                        className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-100 cursor-pointer group hover:bg-white transition-colors"
                                        onClick={() => setIsPaymentCommitmentOpen(!isPaymentCommitmentOpen)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[12px] font-black text-black uppercase tracking-widest">Payment Commitment Upload</span>
                                            {/* Similar to PO upload indicator if needed */}
                                        </div>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-400 transition-transform duration-300 ${isPaymentCommitmentOpen ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                    {isPaymentCommitmentOpen && (
                                        <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-300">
                                            <div
                                                className="w-full py-12 border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-black hover:bg-white rounded-sm"
                                                onClick={() => paymentCommitmentRef.current?.click()}
                                            >
                                                <div className="text-center px-6">
                                                    <p className="text-[14px] text-black font-bold mb-1">Click or drag file to upload</p>
                                                    <p className="text-[10px] text-gray-400 font-medium max-w-[280px] mx-auto">
                                                        Accepted formats: JPG, PNG, PDF. Max size 2MB.
                                                    </p>
                                                </div>
                                                <input type="file" className="hidden" ref={paymentCommitmentRef} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════ Right Column (Order Summary) ═══════════ */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-sm sticky top-24 overflow-hidden">
                            {/* Header */}
                            <div className="bg-[#f2f2f2] px-6 py-4 flex items-center gap-3 border-b border-gray-200">
                                <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                </div>
                                <h3 className="text-[14px] font-black text-black text-center uppercase tracking-wider">
                                    Order Summary
                                </h3>
                            </div>

                            <div className="p-0">
                                {/* Collapsible Item Count Header */}
                                <div
                                    className="px-6 py-4 flex items-center justify-between border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsItemsListOpen(!isItemsListOpen)}
                                >
                                    <span className="text-[15px] font-black text-black">
                                        {cart?.items_count || 0} Items in Cart
                                    </span>
                                    <ChevronDown
                                        size={20}
                                        className={`text-black transition-transform duration-300 ${isItemsListOpen ? "rotate-180" : ""}`}
                                    />
                                </div>

                                {/* Collapsible Product List */}
                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isItemsListOpen ? "max-height-none border-b border-gray-100" : "max-h-0"}`}
                                    style={{ maxHeight: isItemsListOpen ? "1000px" : "0" }}
                                >
                                    <div className="space-y-6 p-6">
                                        {cart?.items?.map((item) => (
                                            <div key={item.item_id} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                                <div className="w-20 h-20 flex-shrink-0 border border-gray-100 rounded-sm overflow-hidden">
                                                    <img
                                                        src={item.image_url || "/images/tyre-sample.png"}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <h4 className="text-[14px] font-bold text-black leading-tight mb-2">
                                                        {item.name}
                                                    </h4>
                                                    <div className="flex items-center gap-1 mb-2 text-[14px]">
                                                        <span className="font-bold text-black">Qty :</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.qty}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                if (val > 0) updateCartItem(item.item_id, val);
                                                            }}
                                                            className="w-12 h-8 border border-gray-300 text-center text-[13px] font-bold focus:outline-none focus:border-black ml-1"
                                                        />
                                                    </div>
                                                    <div className="text-[15px] font-black text-black">
                                                        ﷼ {item.row_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals Section */}
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center text-[15px]">
                                        <span className="text-black font-medium">Subtotal</span>
                                        <span className="font-black text-black">
                                            ﷼ {displayTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-[15px]">
                                        <span className="text-black font-medium">VAT (15%)</span>
                                        <span className="font-black text-black">
                                            ﷼ {displayTotals.tax_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[18px] font-black text-black">Grand Total</span>
                                            <span className="text-[20px] font-black text-black">
                                                ﷼ {displayTotals.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Comment */}
                                <div className="p-6 pt-0">
                                    <div className="bg-[#f8f8f8] p-4 rounded-sm border border-gray-100">
                                        <textarea
                                            placeholder="Enter your comment..."
                                            rows={4}
                                            className="w-full p-4 border border-gray-200 bg-white focus:border-gray-400 outline-none text-[14px] font-medium resize-none transition-all"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Place Order Button */}
                                <div className="px-6 pb-6">
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isPlacingOrder || isTotalsLoading}
                                        className={`w-full py-5 text-[18px] font-black uppercase tracking-tight transition-all duration-300 flex items-center justify-center gap-3 rounded-sm shadow-sm ${isPlacingOrder
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-[#F5B21B] text-black hover:bg-black hover:text-white"
                                            }`}
                                    >
                                        {isPlacingOrder ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Place Order"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Warehouse Selection Modal */}
            {isWarehouseModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200">
                        {/* Modal Header */}
                        <div className="bg-black py-4 px-6 flex justify-end items-center">
                            <button
                                onClick={() => setIsWarehouseModalOpen(false)}
                                className="text-white hover:text-[#F5B21B] transition-colors"
                            >
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-4 bg-gray-50/30">
                            {stores.length > 0 ? (
                                stores.map((wh) => (
                                    <div
                                        key={wh.id}
                                        className={`p-6 border transition-all cursor-pointer bg-white group ${tempSelectedWarehouse?.id === wh.id ? "border-black ring-1 ring-black shadow-md" : "border-gray-200 hover:border-gray-400"}`}
                                        onClick={() => setTempSelectedWarehouse({ id: wh.id, name: wh.name })}
                                    >
                                        <h4 className="text-[16px] font-black text-black uppercase mb-3 tracking-wide">{wh.name}</h4>
                                        <div className="space-y-1 text-[13px]">
                                            <p className="flex items-start gap-2">
                                                <span className="font-bold text-black min-w-[80px]">Address:</span>
                                                <span className="text-gray-700">{wh.address}</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="font-bold text-black min-w-[80px]">E-Mail:</span>
                                                <a href={`mailto:${wh.email}`} className="text-[#3b82f6] hover:underline" onClick={(e) => e.stopPropagation()}>{wh.email}</a>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="font-bold text-black min-w-[80px]">GPS Location:</span>
                                                <a href={wh.gps_location} target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                    {wh.gps_location.startsWith('http') ? wh.gps_location.replace('https://', '').replace('http://', '') : 'View on Maps'}
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Loader2 className="animate-spin mx-auto text-[#F5B21B] mb-4" size={32} />
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[12px]">Fetching Pickup Locations...</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
                            <button
                                className={`px-10 py-3 text-[13px] font-black uppercase tracking-widest transition-all ${tempSelectedWarehouse ? "bg-[#F5B21B] text-black hover:bg-black hover:text-white shadow-md" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                                onClick={() => {
                                    if (tempSelectedWarehouse) {
                                        setSelectedWarehouse(tempSelectedWarehouse.name);
                                        setSelectedWarehouseId(tempSelectedWarehouse.id);
                                        setIsWarehouseModalOpen(false);
                                        setIsPickupFormOpen(true);
                                        toast.success(`Selected: ${tempSelectedWarehouse.name}`);
                                    }
                                }}
                                disabled={!tempSelectedWarehouse}
                            >
                                PICK UP HERE!
                            </button>
                            <button
                                className="px-10 py-3 bg-black text-white text-[13px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md"
                                onClick={() => setIsWarehouseModalOpen(false)}
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPageUI;
