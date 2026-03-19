"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerInfo } from "@/store/actions/customerActions";
import { RootState } from "@/store/store";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/modules/notifications/hooks/useNotifications";

type CustomAttribute = {
    attribute_code: string;
    value: string;
};

export default function MyAccountPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { data: session, status } = useSession();
    const { data: customer, loading } = useSelector((state: RootState) => state.customer);
    const token = useSelector((state: RootState) => state.auth.token);
    const { unreadCount } = useNotifications();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (status === "authenticated" && token) {
            // @ts-ignore
            dispatch(fetchCustomerInfo());
        }
    }, [dispatch, status, router, token]);

    if (status === "loading" || loading) {
        return (
            <>
                <Navbar />
                <div className="p-10 font-['Rubik'] text-center">Loading...</div>
            </>
        );
    }

    if (!customer) return null;

    const getAttr = (code: string) =>
        customer.custom_attributes?.find(
            (a: CustomAttribute) => a.attribute_code === code
        )?.value || "N/A";

    const billingAddress = customer.addresses?.find((addr: any) => addr.default_billing);
    const shippingAddress = customer.addresses?.find((addr: any) => addr.default_shipping);

    // Common classes based on requirements
    const cardBase = "bg-white border border-[#e5e7eb] rounded-sm shadow-sm overflow-hidden";
    const sectionHeader = "bg-[#f5f5f5] px-4 py-3 border-b border-[#e5e7eb] uppercase text-xs font-medium text-gray-700 tracking-[0.6px]";
    const buttonYellow = "bg-yellow-400 hover:bg-yellow-500 text-black text-[11px] font-bold px-4 py-2 uppercase transition-colors rounded-sm shadow-sm tracking-[0.6px]";

    return (
        <div className="min-h-screen bg-white font-['Rubik']">
            <Navbar />

            <div className="flex max-w-[1440px] mx-auto mt-[100px]">
                {/* Left Sidebar */}
                <Sidebar />

                {/* Right Content */}
                <main className="flex-1 p-8 bg-[#fcfcfc] min-h-screen">
                    <div className="max-w-[1200px]">
                        <h1 className="text-2xl font-light text-gray-800 mb-6 uppercase tracking-[0.6px]">
                            My Account
                        </h1>

                        <div className="space-y-8">
                            {/* ACCOUNT INFORMATION SECTION */}
                            <section>
                                <div className="flex items-center justify-between mb-4 border-b border-[#e5e7eb] pb-2">
                                    <h2 className="text-lg font-medium text-gray-900 uppercase text-sm tracking-[0.6px]">
                                        Account Information
                                    </h2>
                                </div>

                                <div className="bg-white border border-gray-300">
                                    {/* CONTACT HEADER */}
                                    <div className="bg-gray-200 px-4 py-3 font-semibold text-sm uppercase tracking-[0.6px]">
                                        Contact Information
                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-6 text-sm space-y-2">
                                        <p><span className="font-semibold">Contact Name:</span> {customer.firstname} {customer.lastname}</p>
                                        <p><span className="font-semibold">Email:</span> {customer.email}</p>
                                        <p><span className="font-semibold">Customer Mobile:</span> {getAttr("mobile_number")}</p>
                                        <p><span className="font-semibold">Company Name:</span> {getAttr("company_name")}</p>
                                        <p><span className="font-semibold">Customer Code:</span> {getAttr("customer_code")}</p>
                                        <p><span className="font-semibold">Industry:</span> {getAttr("industry")}</p>
                                        <p><span className="font-semibold">Location:</span> {getAttr("location")}</p>

                                        <div className="flex gap-3 pt-4">
                                            <button className={buttonYellow}>
                                                Edit
                                            </button>
                                            <button className={buttonYellow}>
                                                Change Password
                                            </button>
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
                                            <button className={buttonYellow}>Edit</button>
                                        </div>
                                        <div className="p-5 text-sm space-y-2 text-gray-600">
                                            <p><span className="font-semibold text-gray-800">Total Employees:</span> {getAttr("total_employees")}</p>
                                            <p><span className="font-semibold text-gray-800">Trucks:</span> {getAttr("trucks")}</p>
                                            <p><span className="font-semibold text-gray-800">Annual Revenue:</span> {getAttr("annual_revenue")}</p>
                                            <p><span className="font-semibold text-gray-800">Business Model:</span> {getAttr("business_model")}</p>
                                            <p><span className="font-semibold text-gray-800">Products Offered:</span> {getAttr("products_offered")}</p>
                                        </div>
                                    </div>

                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            Sales Data (Qty)
                                        </div>
                                        <div className="p-5 text-sm space-y-2 text-gray-600">
                                            <p><span className="font-semibold text-gray-800">Total Sales Qty:</span> 1</p>
                                            <p><span className="font-semibold text-gray-800">Order Frequency:</span> 0 orders/month</p>
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
                                            <select className="bg-transparent border border-gray-300 text-[10px] px-1 py-0.5 rounded-sm">
                                                <option>2023</option>
                                                <option>2024</option>
                                            </select>
                                        </div>
                                        <div className="p-5 text-sm space-y-2 text-gray-600">
                                            <p><span className="font-semibold text-gray-800">Sales Targets:</span> N/A</p>
                                            <p><span className="font-semibold text-gray-800">Achievements:</span> N/A</p>
                                            <p><span className="font-semibold text-gray-800">Incentive:</span> ﷼ 0.00</p>
                                        </div>
                                    </div>

                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            Customer Behavior
                                        </div>
                                        <div className="p-5 text-sm space-y-2 text-gray-600">
                                            <p><span className="font-semibold text-gray-800">Payment History:</span> {getAttr("payment_history")}</p>
                                            <p><span className="font-semibold text-gray-800">Credit Period:</span> {getAttr("credit_period")}</p>
                                            <p><span className="font-semibold text-gray-800">Total Credit Limit:</span> {getAttr("total_credit_limit")}</p>
                                            <p><span className="font-semibold text-gray-800">Used Credit Limit:</span> {getAttr("used_credit_limit")}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ADDRESS BOOK */}
                            <section>
                                <div className="flex items-center justify-between mb-4 border-b border-[#e5e7eb] pb-2">
                                    <h2 className="text-lg font-medium text-gray-900 uppercase text-sm tracking-[0.6px]">
                                        Address Book
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* BILLING ADDRESS */}
                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            Default Billing Address
                                        </div>
                                        <div className="p-5 text-sm space-y-1 text-gray-600">
                                            {billingAddress ? (
                                                <>
                                                    <p className="font-bold text-gray-900">{billingAddress.firstname} {billingAddress.lastname}</p>
                                                    {billingAddress.company && <p>{billingAddress.company}</p>}
                                                    <p>{billingAddress.street?.join(", ")}</p>
                                                    <p>{billingAddress.city}, {billingAddress.postcode}</p>
                                                    <p>{billingAddress.country_id}</p>
                                                    <p>T: {billingAddress.telephone}</p>
                                                </>
                                            ) : (
                                                <p>You have not set a default billing address.</p>
                                            )}

                                        </div>
                                    </div>

                                    {/* SHIPPING ADDRESS */}
                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            Default Shipping Address
                                        </div>
                                        <div className="p-5 text-sm space-y-1 text-gray-600">
                                            {shippingAddress ? (
                                                <>
                                                    <p className="font-bold text-gray-900">{shippingAddress.firstname} {shippingAddress.lastname}</p>
                                                    {shippingAddress.company && <p>{shippingAddress.company}</p>}
                                                    <p>{shippingAddress.street?.join(", ")}</p>
                                                    <p>{shippingAddress.city}, {shippingAddress.postcode}</p>
                                                    <p>{shippingAddress.country_id}</p>
                                                    <p>T: {shippingAddress.telephone}</p>
                                                </>
                                            ) : (
                                                <p>You have not set a default shipping address.</p>
                                            )}
                                            <div className="pt-3">
                                                <Link href="/edit-address" className={buttonYellow}>Edit Address</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
