"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchCustomerInfo } from "@/store/actions/customerActions";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BusinessOverviewEditModal from "@/components/BusinessOverviewEditModal";
import { redirectToLogin } from "@/utils/helpers";

type CustomAttribute = {
    attribute_code: string;
    value: string;
};

type Address = {
    default_billing?: boolean;
    default_shipping?: boolean;
    street?: string[];
    city?: string;
    postcode?: string;
    country_id?: string;
    telephone?: string;
    company?: string;
};

export default function MyAccountPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { data: session, status } = useSession();
    const { data: customer, loading } = useSelector((state: RootState) => state.customer);
    const token = useSelector((state: RootState) => state.auth.token);

    const [businessOverview, setBusinessOverview] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchOverview = async () => {
        try {
            const response = await fetch("/api/kleverapi/business-overview");
            const data = await response.json();
            setBusinessOverview(Array.isArray(data) ? data[0] : data);
        } catch (err) {
            console.error("Overview Fetch Error:", err);
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            redirectToLogin(router);
            return;
        }

        if (status === "authenticated" && token) {
            dispatch(fetchCustomerInfo());
            fetchOverview();
        }
    }, [status, token, dispatch, router]);

    const getOverviewAttr = (key: string, fallback: string = "N/A") => {
        return businessOverview?.[key] || fallback;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">

                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5B21B]"></div>
                </div>
            </div>
        );
    }

    if (!customer) return null;

    const getAttr = (code: string) => {
        return (customer as any).custom_attributes?.find(
            (a: CustomAttribute) => a.attribute_code === code
        )?.value || "N/A";
    }

    const cardBase = "bg-white border border-gray-100 rounded-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)]";
    const sectionHeader = "bg-[#fcfcfc] px-6 py-4 border-b border-gray-50 text-black font-black tracking-wider uppercase text-[14px]";

    const addresses = (customer as any).addresses as Address[] | undefined;
    const defaultBilling = addresses?.find((a: Address) => a.default_billing);
    const defaultShipping = addresses?.find((a: Address) => a.default_shipping);

    return (
        <>


            <div className="flex flex-col md:flex-row min-h-screen">
                <Sidebar />

                {/* Right Content */}
                <main className="flex-1 p-8 bg-[#fcfcfc] min-h-screen">
                    <div className="max-w-[1200px]">

                        <h1 className="text-2xl font-light text-gray-800 mb-6 uppercase tracking-[0.6px]">
                            My Account
                        </h1>

                        <div className="space-y-8">
                            {/* TOP ROW: CONTACT & COMPANY INFORMATION */}
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Contact Information */}
                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            Contact Information
                                        </div>
                                        <div className="p-6 text-[13px] text-gray-700 space-y-2.5 font-medium leading-relaxed">
                                            <p>Name: {(customer as any).firstname} {(customer as any).lastname}</p>
                                            <p>Email: {(customer as any).email}</p>
                                            <p>Mobile: {getAttr("mobile") !== "N/A" ? getAttr("mobile") : getAttr("mobile_number")}</p>

                                            <div className="flex gap-3 pt-6">
                                                <Link href="/customer/account/edit" className="bg-[#F5B21B] hover:bg-black hover:text-white text-black text-[12px] font-bold px-8 py-2.5 uppercase transition-all rounded-sm shadow-sm tracking-wider">
                                                    Edit
                                                </Link>
                                                <Link href="/customer/account/edit?change=password" className="bg-[#F5B21B] hover:bg-black hover:text-white text-black text-[12px] font-bold px-8 py-2.5 uppercase transition-all rounded-sm shadow-sm tracking-wider whitespace-nowrap">
                                                    Change Password
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Information */}
                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            Company Information
                                        </div>
                                        <div className="p-6 text-[13px] text-gray-700 space-y-2.5 font-medium leading-relaxed">
                                            <p>Company Name: {getAttr("company_name") || addresses?.[0]?.company || "N/A"}</p>
                                            <p>Company Contact: {getAttr("company_contact_name")}</p>
                                            <p>Company Email: {getAttr("company_email")}</p>
                                            <p>Customer Code: {getAttr("customer_code")}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* BUSINESS OVERVIEW & SALES DATA */}
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={cardBase}>
                                        <div className={sectionHeader + " flex justify-between items-center"}>
                                            <span>Business Overview</span>
                                            <button
                                                onClick={() => setIsEditModalOpen(true)}
                                                className="bg-[#F5B21B] hover:bg-black hover:text-white text-black text-[10px] font-bold px-4 py-1.5 uppercase transition-all rounded-sm shadow-sm tracking-widest"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="p-6 text-[14px] text-gray-700 space-y-2 font-medium leading-relaxed">
                                            <p>Company Size: {getOverviewAttr("total_employees")} employees, {getOverviewAttr("trucks")} Trucks, {getOverviewAttr("annual_revenue")} annual revenue</p>
                                            <p>Business Model: {getOverviewAttr("business_model")}</p>
                                            <p>Products/Services Offered: {getOverviewAttr("products_offered")}</p>
                                        </div>
                                    </div>

                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            Sales Data (Qty)
                                        </div>
                                        <div className="p-6 text-[13px] text-gray-700 space-y-2.5 font-medium leading-relaxed">
                                            <p>Total Sales Qty: {getAttr("total_sales_qty") !== "N/A" ? getAttr("total_sales_qty") : "0"}</p>
                                            <p>Order Frequency: {getAttr("order_frequency") !== "N/A" ? getAttr("order_frequency") : "0"} orders/month</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* TARGETS & BEHAVIOR */}
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={cardBase}>
                                        <div className={sectionHeader + " flex justify-between items-center"}>
                                            <span>Targets and Achievements</span>
                                        </div>
                                        <div className="p-6 text-[13px] text-gray-700 space-y-2.5 font-medium leading-relaxed">
                                            <p>Sales Targets: {getAttr("sales_targets")}</p>
                                            <p>Achievements: {getAttr("achievements")}</p>
                                            <p>Incentive: SAR {getAttr("incentive") !== "N/A" ? getAttr("incentive") : "0.00"}</p>
                                        </div>
                                    </div>

                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            Customer Behavior
                                        </div>
                                        <div className="p-6 text-[13px] text-gray-700 space-y-2.5 font-medium leading-relaxed">
                                            <p>Payment History (DSO): {getAttr("payment_history")}</p>
                                            <p>Credit Limit: SAR {getAttr("total_credit_limit")}</p>
                                            <p>Credit Period: {getAttr("credit_period")} days</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ADDRESS BOOK */}
                            <section>
                                <div className={cardBase}>
                                    <div className={sectionHeader + " flex justify-between items-center"}>
                                        <span>Address Book</span>
                                        <Link href="/customer/address-book" className="text-[11px] font-bold text-[#F5B21B] hover:text-black transition-colors uppercase tracking-widest">
                                            Manage Addresses
                                        </Link>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div>
                                                <h4 className="text-[13px] font-black text-black mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Default Billing Address</h4>
                                                {defaultBilling ? (
                                                    <div className="text-[13px] text-gray-600 leading-relaxed space-y-1">
                                                        <p className="font-bold text-gray-900">{(customer as any).firstname} {(customer as any).lastname}</p>
                                                        {defaultBilling.street?.map((s: string, i: number) => <p key={i}>{s}</p>)}
                                                        <p>{defaultBilling.city}, {defaultBilling.postcode}</p>
                                                        <p>{defaultBilling.country_id}</p>
                                                        <p className="pt-2">T: {defaultBilling.telephone}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-[13px] text-gray-500 italic">No default billing address set.</p>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-black mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Default Shipping Address</h4>
                                                {defaultShipping ? (
                                                    <div className="text-[13px] text-gray-600 leading-relaxed space-y-1">
                                                        <p className="font-bold text-gray-900">{(customer as any).firstname} {(customer as any).lastname}</p>
                                                        {defaultShipping.street?.map((s: string, i: number) => <p key={i}>{s}</p>)}
                                                        <p>{defaultShipping.city}, {defaultShipping.postcode}</p>
                                                        <p>{defaultShipping.country_id}</p>
                                                        <p className="pt-2">T: {defaultShipping.telephone}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-[13px] text-gray-500 italic">No default shipping address set.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>

            <BusinessOverviewEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={businessOverview}
                onSuccess={fetchOverview}
            />
        </>
    );
}
