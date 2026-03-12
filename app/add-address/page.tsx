"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { addAddress, updateAddress, fetchAddresses } from "@/store/actions/addressActions";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function AddAddressPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const addressId = searchParams.get("id");
    const dispatch = useDispatch();
    const { addresses, loading: reduxLoading } = useSelector((state: RootState) => state.address);
    const { token } = useSelector((state: RootState) => state.auth);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        telephone: "",
        street: [""],
        city: "",
        country_id: "SA",
        postcode: "",
        default_billing: false,
        default_shipping: false,
    });

    useEffect(() => {
        if (!token) {
            router.replace("/login");
            return;
        }

        if (addressId && addresses.length === 0) {
            // @ts-ignore
            dispatch(fetchAddresses());
        }
    }, [token, addressId, addresses.length, dispatch, router]);

    useEffect(() => {
        if (addressId && addresses.length > 0) {
            const address = addresses.find((a: any) => String(a.id) === String(addressId));
            if (address) {
                setFormData({
                    firstname: address.firstname || "",
                    lastname: address.lastname || "",
                    telephone: address.telephone || "",
                    street: address.street || [""],
                    city: address.city || "",
                    country_id: address.country_id || "SA",
                    postcode: address.postcode || "",
                    default_billing: !!address.default_billing,
                    default_shipping: !!address.default_shipping,
                });
            }
        }
    }, [addressId, addresses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (name === "street") {
            setFormData((prev) => ({ ...prev, street: [value] }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const callback = (err: any) => {
            if (!err) {
                toast.success(addressId ? "Address updated" : "Address added");
                router.push("/my-account");
            } else {
                toast.error(err || "Failed to save address");
            }
            setLoading(false);
        };

        if (addressId) {
            // @ts-ignore
            dispatch(updateAddress(addressId, { address: formData }, callback));
        } else {
            // @ts-ignore
            dispatch(addAddress({ address: formData }, callback));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-['Rubik']">
            <Navbar />
            <div className="max-w-2xl mx-auto p-6 mt-8">
                <div className="bg-white p-8 rounded shadow-sm border border-gray-200">
                    <h1 className="text-xl font-bold mb-8 uppercase tracking-wider">
                        {addressId ? "Edit Address" : "Add New Address"}
                    </h1>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1.5 tracking-tight">First Name *</label>
                            <input
                                type="text"
                                name="firstname"
                                required
                                value={formData.firstname}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2.5 rounded-[1px] text-sm focus:outline-none focus:ring-1 focus:ring-black cursor-text"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1.5 tracking-tight">Last Name *</label>
                            <input
                                type="text"
                                name="lastname"
                                required
                                value={formData.lastname}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2.5 rounded-[1px] text-sm focus:outline-none focus:ring-1 focus:ring-black cursor-text"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1.5 tracking-tight">Street Address *</label>
                            <input
                                type="text"
                                name="street"
                                required
                                value={formData.street[0]}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2.5 rounded-[1px] text-sm focus:outline-none focus:ring-1 focus:ring-black cursor-text"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1.5 tracking-tight">City *</label>
                            <input
                                type="text"
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2.5 rounded-[1px] text-sm focus:outline-none focus:ring-1 focus:ring-black cursor-text"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1.5 tracking-tight">Zip/Postal Code *</label>
                            <input
                                type="text"
                                name="postcode"
                                required
                                value={formData.postcode}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2.5 rounded-[1px] text-sm focus:outline-none focus:ring-1 focus:ring-black cursor-text"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1.5 tracking-tight">Phone Number *</label>
                            <input
                                type="tel"
                                name="telephone"
                                required
                                value={formData.telephone}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2.5 rounded-[1px] text-sm focus:outline-none focus:ring-1 focus:ring-black cursor-text"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="default_billing"
                                    checked={formData.default_billing}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                                />
                                <span className="text-xs font-bold uppercase text-gray-600 group-hover:text-black transition-colors tracking-tight">Set as default billing address</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="default_shipping"
                                    checked={formData.default_shipping}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                                />
                                <span className="text-xs font-bold uppercase text-gray-600 group-hover:text-black transition-colors tracking-tight">Set as default shipping address</span>
                            </label>
                        </div>
                        <div className="md:col-span-2 pt-6">
                            <button
                                type="submit"
                                disabled={loading || reduxLoading}
                                className="w-full bg-amber-400 text-black font-bold py-4 rounded-[3px] shadow-sm hover:bg-amber-500 transition-all uppercase text-xs tracking-widest cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : (addressId ? "Update Address" : "Save Address")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}