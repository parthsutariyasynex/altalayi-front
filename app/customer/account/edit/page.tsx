"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "@/components/Sidebar";
import { RootState, AppDispatch } from "@/store/store";
import { fetchCustomerInfo } from "@/store/actions/customerActions";
import { api } from "@/lib/api/api-client";
import toast from "react-hot-toast";

export default function EditAccountPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const { data: session, status } = useSession();
    const { data: customer, loading } = useSelector((state: RootState) => state.customer);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Basic Account Info
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    // Business Overview Fields
    const [totalEmployees, setTotalEmployees] = useState("");
    const [totalTrucks, setTotalTrucks] = useState("");
    const [annualRevenue, setAnnualRevenue] = useState("");
    const [businessModel, setBusinessModel] = useState("");
    const [productsOffered, setProductsOffered] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (status === "authenticated" && token && !customer) {
            dispatch(fetchCustomerInfo());
        }
    }, [dispatch, status, router, token, customer]);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const response = await api.get("/kleverapi/business-overview");
                const data = Array.isArray(response.data) ? response.data[0] : response.data || {};

                setTotalEmployees(data.total_employees || "");
                setTotalTrucks(data.trucks || "");
                setAnnualRevenue(data.annual_revenue || "");
                setBusinessModel(data.business_model || "");
                setProductsOffered(data.products_offered || "");
            } catch (err) {
                console.error("Overview Fetch Error:", err);
            }
        };

        if (status === "authenticated" && token) {
            fetchOverview();
        }

        if (customer) {
            setFirstName(customer.firstname || "");
            setLastName(customer.lastname || "");
            setEmail(customer.email || "");
        }
    }, [status, token, customer]);

    const handleSave = async () => {
        if (!firstName || !lastName || !email) {
            toast.error("Required fields are missing");
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading("Saving changes...");

        try {
            // Updated save logic for business data using PUT as per requirements
            await api.put("/kleverapi/business-overview", {
                total_employees: totalEmployees,
                trucks: totalTrucks,
                annual_revenue: annualRevenue,
                business_model: businessModel,
                products_offered: productsOffered
            });

            // Standard profile update
            const profilePayload = {
                customer: {
                    ...customer,
                    firstname: firstName,
                    lastname: lastName,
                    email: email,
                }
            };
            await api.post("/kleverapi/my-account", profilePayload);

            toast.success("Account information updated successfully", { id: toastId });
            dispatch(fetchCustomerInfo());
            router.push("/customer/account");
        } catch (error: any) {
            console.error("Save Error:", error);
            toast.error(error.message || "Failed to update account", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading" || loading || !customer) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5B21B]"></div>
            </div>
        );
    }

    const inputClass = "w-full border border-gray-200 px-4 py-2.5 text-[13px] focus:border-[#F5B21B] outline-none transition-all rounded-sm bg-white font-medium text-gray-800 placeholder:text-gray-300";
    const labelClass = "block text-[12px] font-black text-black mb-1.5 uppercase tracking-wider";
    const sectionHeader = "bg-white px-6 py-4 border-b border-gray-100 text-black font-[900] tracking-tighter uppercase text-[15px] flex justify-between items-center";

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50">
            <Sidebar />

            <main className="flex-1 p-8 bg-[#fcfcfc]">
                <div className="max-w-[800px] mx-auto">
                    <h1 className="text-[22px] font-black text-black mb-8 uppercase tracking-widest border-b-2 border-black inline-block pb-1">
                        Edit Account Information
                    </h1>

                    <div className="space-y-8">
                        {/* BUSINESS OVERVIEW SECTION */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
                            <div className={sectionHeader}>
                                <span>BUSINESS OVERVIEW</span>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className={labelClass}>Total Employee</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={totalEmployees}
                                        onChange={(e) => setTotalEmployees(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className={labelClass}>Total Trucks</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={totalTrucks}
                                        onChange={(e) => setTotalTrucks(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className={labelClass}>Annual Revenue</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={annualRevenue}
                                        onChange={(e) => setAnnualRevenue(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className={labelClass}>Business Model</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={businessModel}
                                        onChange={(e) => setBusinessModel(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className={labelClass}>Product/Service Offered</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={productsOffered}
                                        onChange={(e) => setProductsOffered(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-[#F5B21B] hover:bg-black hover:text-white text-black text-[14px] font-black px-12 py-3 uppercase transition-all rounded-sm shadow-md tracking-widest"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
