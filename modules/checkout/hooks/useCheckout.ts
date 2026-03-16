"use client";

import { useState, useCallback, useEffect } from "react";
import { getSession } from "next-auth/react";

export interface CustomAttribute {
    attribute_code: string;
    value: string;
}

export interface Address {
    id: string;
    firstname: string;
    lastname: string;
    street: string;
    city: string;
    region?: string;
    postcode?: string;
    country_id: string;
    telephone: string;
    isDefault?: boolean;
    custom_attributes?: CustomAttribute[];
}

export interface ShippingMethod {
    code: string;
    carrierCode: string;
    methodCode: string;
    title: string;
    description: string;
    price: number;
    currency: string;
}

export interface PaymentMethod {
    code: string;
    title: string;
}

export interface Store {
    id: string;
    name: string;
    address: string;
    email: string;
    gps_location: string;
}

export interface CheckoutTotals {
    subtotal: number;
    tax_amount: number;
    shipping_amount?: number;
    grand_total: number;
    currency_code: string;
}

async function getAuthToken(): Promise<string | null> {
    const session: any = await getSession();
    return session?.accessToken ?? null;
}

export function useCheckout() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [totals, setTotals] = useState<CheckoutTotals | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTotalsLoading, setIsTotalsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ─── Fetch Checkout Totals ───
    const fetchTotals = useCallback(async () => {
        try {
            setIsTotalsLoading(true);
            const token = await getAuthToken();
            if (!token) return;

            const res = await fetch("/api/kleverapi/checkout/totals", {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });
            const data = await res.json();

            if (res.ok) {
                setTotals(data);
            }
        } catch (err) {
            console.error("Fetch Totals Error:", err);
        } finally {
            setIsTotalsLoading(false);
        }
    }, []);

    // ─── Fetch Customer Addresses ───
    const fetchAddresses = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = await getAuthToken();
            if (!token) return;

            const res = await fetch("/api/kleverapi/addresses", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            // The 'addresses' endpoint usually returns an array of addresses directly,
            // or an object with an 'addresses' field if it's the customer info.
            const addressesData = Array.isArray(data) ? data : (data.addresses || []);

            if (res.ok) {
                const mapped: Address[] = addressesData.map((addr: any) => ({
                    id: (addr.id || addr.entity_id || "").toString(),
                    firstname: addr.firstname || "",
                    lastname: addr.lastname || "",
                    street: Array.isArray(addr.street) ? addr.street.join(", ") : (addr.street || ""),
                    city: addr.city || "",
                    region: typeof addr.region === 'string' ? addr.region : (addr.region?.region || addr.region?.region_code || ""),
                    postcode: addr.postcode || "",
                    country_id: addr.country_id || "SA",
                    telephone: addr.telephone || "",
                    isDefault: !!(addr.default_shipping || addr.is_default_shipping),
                    custom_attributes: addr.custom_attributes || [],
                }));
                setAddresses(mapped);
            }
        } catch (err) {
            console.error("Fetch Addresses Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ─── Fetch Shipping Methods ───
    const fetchShippingMethods = useCallback(async () => {
        try {
            const token = await getAuthToken();
            if (!token) return;

            const res = await fetch("/api/kleverapi/checkout/shipping-methods", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                // Normalize — API may return array or object with methods key
                const methods = Array.isArray(data) ? data : (data.methods || data.shipping_methods || []);
                const mapped: ShippingMethod[] = methods.map((m: any) => ({
                    code: m.code || `${m.carrier_code}_${m.method_code}`,
                    carrierCode: m.carrier_code || m.carrierCode || m.code?.split('_')[0] || "",
                    methodCode: m.method_code || m.methodCode || m.code?.split('_')[1] || m.code || "",
                    title: m.method_title || m.carrier_title || m.title || "Shipping",
                    description: m.carrier_title || m.description || "",
                    price: m.amount || m.price || 0,
                    currency: m.base_currency_code || m.currency || "SAR",
                }));
                if (mapped.length > 0) {
                    setShippingMethods(mapped);
                    return;
                }
            }
            // Fallback if API returns nothing or fails
            setShippingMethods([
                { code: "flatrate_flatrate", carrierCode: "flatrate", methodCode: "flatrate", title: "Flat Rate", description: "Standard Delivery", price: 15.00, currency: "SAR" },
                { code: "free_free", carrierCode: "free", methodCode: "free", title: "Free Shipping", description: "Orders over 500 SAR", price: 0, currency: "SAR" },
            ]);
        } catch (err) {
            console.error("Fetch Shipping Methods Error:", err);
            setShippingMethods([
                { code: "flatrate_flatrate", carrierCode: "flatrate", methodCode: "flatrate", title: "Flat Rate", description: "Standard Delivery", price: 15.00, currency: "SAR" },
                { code: "free_free", carrierCode: "free", methodCode: "free", title: "Free Shipping", description: "Orders over 500 SAR", price: 0, currency: "SAR" },
            ]);
        }
    }, []);

    // ─── Fetch Payment Methods ───
    const fetchPaymentMethods = useCallback(async () => {
        try {
            const token = await getAuthToken();
            if (!token) return;

            const res = await fetch("/api/kleverapi/checkout/payment-methods", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                const methods = Array.isArray(data) ? data : (data.methods || data.payment_methods || []);
                const mapped: PaymentMethod[] = methods.map((m: any) => ({
                    code: m.code || m.method_code || "",
                    title: m.title || m.method_title || "",
                }));
                if (mapped.length > 0) {
                    setPaymentMethods(mapped);
                    return;
                }
            }
            // Fallback
            setPaymentMethods([
                { code: "cashondelivery", title: "Cash on Delivery" },
                { code: "online_payment", title: "Online Payment" },
            ]);
        } catch (err) {
            console.error("Fetch Payment Methods Error:", err);
            setPaymentMethods([
                { code: "cashondelivery", title: "Cash on Delivery" },
                { code: "online_payment", title: "Online Payment" },
            ]);
        }
    }, []);

    // ─── Fetch Pickup Stores ───
    const fetchPickupStores = useCallback(async () => {
        try {
            const token = await getAuthToken();
            if (!token) return;

            const res = await fetch("/api/kleverapi/checkout/pickup-stores", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                const storesData = Array.isArray(data) ? data : (data.stores || []);
                const mapped: Store[] = storesData.map((s: any) => ({
                    id: s.id?.toString() || s.store_id?.toString() || "",
                    name: s.name || s.store_name || "",
                    address: s.address || "",
                    email: s.email || "",
                    gps_location: s.gps_location || "",
                }));
                setStores(mapped);
            }
        } catch (err) {
            console.error("Fetch Pickup Stores Error:", err);
        }
    }, []);

    // ─── Fetch Pickup Time Slots ───
    const fetchPickupTimeSlots = useCallback(async (storeId: string, date: string) => {
        try {
            const token = await getAuthToken();
            if (!token) return [];

            const res = await fetch(`/api/kleverapi/checkout/pickup-time-slots/${storeId}/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                // Normalize response: Expecting array of { time, label, enabled }
                const slots = Array.isArray(data) ? data : (data.slots || data.time_slots || []);
                return slots.map((s: any) => ({
                    time: s.time || "",
                    label: s.label || s.time || "",
                    enabled: typeof s.enabled === 'boolean' ? s.enabled : true
                }));
            }
            return [];
        } catch (err) {
            console.error("Fetch Pickup Time Slots Error:", err);
            return [];
        }
    }, []);

    // ─── Set Shipping Address (also refreshes totals + methods) ───
    const setShippingAddress = async (addressId: string) => {
        try {
            setIsTotalsLoading(true);
            const token = await getAuthToken();
            if (!token) throw new Error("Not authenticated");

            const res = await fetch("/api/kleverapi/checkout/shipping-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ address_id: Number(addressId) }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to set shipping address");
            }

            const data = await res.json();

            // If the API returns shipping methods or payment methods alongside, use them
            if (data.shipping_methods && Array.isArray(data.shipping_methods)) {
                const mapped: ShippingMethod[] = data.shipping_methods.map((m: any) => ({
                    code: m.code || `${m.carrier_code}_${m.method_code}`,
                    carrierCode: m.carrier_code || m.carrierCode || "",
                    methodCode: m.method_code || m.methodCode || "",
                    title: m.method_title || m.carrier_title || m.title || "Shipping",
                    description: m.carrier_title || m.description || "",
                    price: m.amount || m.price || 0,
                    currency: m.base_currency_code || m.currency || "SAR",
                }));
                if (mapped.length > 0) setShippingMethods(mapped);
            }

            if (data.payment_methods && Array.isArray(data.payment_methods)) {
                const mapped = data.payment_methods.map((m: any) => ({
                    code: m.code || m.method_code || "",
                    title: m.title || m.method_title || "",
                }));
                if (mapped.length > 0) setPaymentMethods(mapped);
            }

            // Refresh totals after address change
            await fetchTotals();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to set shipping address");
            throw err;
        } finally {
            setIsTotalsLoading(false);
        }
    };

    // ─── Add New Address ───
    const addAddress = async (addressData: Partial<Address>) => {
        try {
            setIsLoading(true);
            const token = await getAuthToken();
            if (!token) throw new Error("Not authenticated");

            const res = await fetch("/api/kleverapi/my-account", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ address: addressData }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add address");
            await fetchAddresses();
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add address");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Save PO Number ───
    const savePoNumber = async (poNumber: string) => {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error("Not authenticated");

            const res = await fetch("/api/kleverapi/checkout/po-number", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ poNumber }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save PO number");
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save PO number");
            throw err;
        }
    };

    // ─── Upload PO File ───
    const uploadPoFile = async (fileData: { fileName: string; fileContent: string; type: string }) => {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error("Not authenticated");

            const res = await fetch("/api/kleverapi/checkout/po-upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(fileData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to upload PO file");
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload PO file");
            throw err;
        }
    };

    // ─── Get PO Upload ───
    const getPoUpload = async () => {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error("Not authenticated");

            const res = await fetch("/api/kleverapi/checkout/po-upload", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to get PO upload");
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get PO upload");
            throw err;
        }
    };

    // ─── Delete PO File ───
    const deletePoFile = async (filename: string) => {
        try {
            const token = await getAuthToken();
            if (!token) throw new Error("Not authenticated");

            const res = await fetch(`/api/kleverapi/checkout/po-upload/${filename}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete PO file");
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete PO file");
            throw err;
        }
    };

    // ─── Set Shipping Method ───
    const setShippingMethod = async (carrierCode: string, methodCode: string) => {
        try {
            setIsTotalsLoading(true);
            const token = await getAuthToken();
            if (!token) throw new Error("Not authenticated");

            const res = await fetch("/api/kleverapi/checkout/shipping-method", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ carrierCode, methodCode }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to set shipping method");

            // Refresh totals after selection
            await fetchTotals();
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to set shipping method");
            throw err;
        } finally {
            setIsTotalsLoading(false);
        }
    };

    // ─── Place Order ───
    const placeOrder = async (orderData: {
        address_id: number;
        shipping_method: string;
        payment_method: string;
    }) => {
        try {
            setIsLoading(true);
            const token = await getAuthToken();
            if (!token) throw new Error("Not authenticated");

            const res = await fetch("/api/kleverapi/checkout/place-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to place order");
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to place order");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Initial Load ───
    useEffect(() => {
        fetchAddresses();
        fetchTotals();
        fetchShippingMethods();
        fetchPaymentMethods();
    }, [fetchAddresses, fetchTotals, fetchShippingMethods, fetchPaymentMethods]);

    return {
        addresses,
        shippingMethods,
        paymentMethods,
        stores,
        totals,
        isLoading,
        isTotalsLoading,
        error,
        refetchAddresses: fetchAddresses,
        refetchTotals: fetchTotals,
        refetchShippingMethods: fetchShippingMethods,
        refetchPickupStores: fetchPickupStores,
        fetchPickupTimeSlots,
        setShippingAddress,
        addAddress,
        placeOrder,
        savePoNumber,
        uploadPoFile,
        getPoUpload,
        deletePoFile,
        setShippingMethod,
    };
}
