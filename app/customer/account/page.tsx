"use client";

import { useEffect, useState } from "react";
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

import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function MyAccountPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { data: session, status } = useSession();
    const { data: customer, loading } = useSelector((state: RootState) => state.customer);
    const token = useSelector((state: RootState) => state.auth.token);
    const { unreadCount } = useNotifications();
    const searchParams = useSearchParams();

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

    const getAttr = (code: string) => {
        return customer.custom_attributes?.find(
            (a: CustomAttribute) => a.attribute_code === code
        )?.value || "N/A";
    }

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
                                <div className="border-b border-[#e5e7eb] pb-2 mb-6">
                                    <h2 className="text-[15px] font-bold text-black uppercase tracking-tight">
                                        ACCOUNT INFORMATION
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* CONTACT INFORMATION BOX */}
                                    <div className="bg-white border border-[#e5e7eb] rounded-sm shadow-sm overflow-hidden">
                                        <div className="bg-[#f5f5f5] px-5 py-3 border-b border-[#e5e7eb]">
                                            <h3 className="text-[13px] font-bold text-black uppercase tracking-tight">
                                                CONTACT INFORMATION
                                            </h3>
                                        </div>
                                        <div className="p-6 text-[13px] text-gray-700 space-y-2.5 font-medium leading-relaxed">
                                            <p><span className="text-black">Contact Name:</span> {customer.firstname} {customer.lastname}</p>
                                            <p><span className="text-black">Email:</span> {customer.email}</p>
                                            <p><span className="text-black">Contact Information:</span> {customer.email} ,</p>

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

                                    {/* COMPANY INFORMATION BOX */}
                                    <div className="bg-white border border-[#e5e7eb] rounded-sm shadow-sm overflow-hidden">
                                        <div className="bg-[#f5f5f5] px-5 py-3 border-b border-[#e5e7eb]">
                                            <h3 className="text-[13px] font-bold text-black uppercase tracking-tight">
                                                COMPANY INFORMATION
                                            </h3>
                                        </div>
                                        <div className="p-6 text-[13px] text-gray-700 space-y-2.5 font-medium leading-relaxed">
                                            <p><span className="text-black">Company Name:</span> {getAttr("company_name") || customer.addresses?.[0]?.company || "N/A"}</p>
                                            <p><span className="text-black">Company Contact Name:</span> {getAttr("company_contact_name") !== "N/A" ? getAttr("company_contact_name") : "N/A"}</p>
                                            <p><span className="text-black">Company Email:</span> {getAttr("company_email") !== "N/A" ? getAttr("company_email") : "N/A"}</p>
                                            <p><span className="text-black">Customer Mobile:</span> {getAttr("mobile") !== "N/A" ? getAttr("mobile") : (getAttr("mobile_number") !== "N/A" ? getAttr("mobile_number") : (customer.addresses?.[0]?.telephone || "N/A"))}</p>
                                            <p><span className="text-black">Customer Code:</span> {getAttr("customer_code")}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* BUSINESS OVERVIEW & SALES DATA */}
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={cardBase}>
                                        <div className={sectionHeader + " flex justify-between items-center"}>
                                            <span className="uppercase text-[13px] font-bold">Business Overview</span>
                                            <button className="bg-[#F5B21B] hover:bg-black hover:text-white text-black text-[10px] font-bold px-4 py-1.5 uppercase transition-all rounded-sm shadow-sm tracking-widest">Edit</button>
                                        </div>
                                        <div className="p-5 text-[14px] space-y-3 font-medium">
                                            <p className="text-gray-800">Company Size: <span className="font-bold">{getAttr("total_employees") !== "N/A" ? getAttr("total_employees") : "0"} employees, {getAttr("trucks") !== "N/A" ? getAttr("trucks") : "0"} Trucks, {getAttr("annual_revenue") !== "N/A" ? getAttr("annual_revenue") : "0"} annual revenue</span></p>
                                            <p className="text-gray-800">Business Model: <span className="font-bold">{getAttr("business_model") !== "N/A" ? getAttr("business_model") : "N/A"}</span></p>
                                            <p className="text-gray-800">Products/Services Offered: <span className="font-bold">{getAttr("products_offered") !== "N/A" ? getAttr("products_offered") : "N/A"}</span></p>
                                        </div>
                                    </div>

                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            <span className="uppercase text-[13px] font-bold">Sales Data (Qty)</span>
                                        </div>
                                        <div className="p-5 text-[14px] space-y-3 font-medium">
                                            <p className="text-gray-800">Total Sales Qty: <span className="font-bold">{getAttr("total_sales_qty") !== "N/A" ? getAttr("total_sales_qty") : "0"}</span></p>
                                            <p className="text-gray-800">Order Frequency: <span className="font-bold">{getAttr("order_frequency") !== "N/A" ? getAttr("order_frequency") : "0"} orders/month</span></p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* TARGETS & BEHAVIOR */}
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={cardBase}>
                                        <div className={sectionHeader + " flex justify-between items-center"}>
                                            <span className="uppercase text-[13px] font-bold">Targets and Achievements</span>
                                            <div className="relative">
                                                <select className="bg-white border border-gray-300 text-[12px] px-3 py-1 mr-2 rounded-sm focus:ring-0 focus:outline-none min-w-[100px] h-[28px] cursor-pointer appearance-none pr-8">
                                                    <option>Select Year</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-2 text-gray-700">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5 text-[14px] space-y-3 font-medium">
                                            <p className="text-gray-800">Sales Targets: <span className="font-bold">{getAttr("sales_targets")}</span></p>
                                            <p className="text-gray-800">Achievements: <span className="font-bold">{getAttr("achievements")}</span></p>
                                            <p className="text-gray-800">Incentive: <span className="font-bold">SAR {getAttr("incentive") !== "N/A" ? getAttr("incentive") : "0.00"}</span></p>
                                        </div>
                                    </div>

                                    <div className={cardBase}>
                                        <div className={sectionHeader}>
                                            <span className="uppercase text-[13px] font-bold">Customer Behavior</span>
                                        </div>
                                        <div className="p-5 text-[14px] space-y-3 font-medium">
                                            <p className="text-gray-800">Payment History(DSO): <span className="font-bold">{getAttr("payment_history")}</span></p>
                                            <p className="text-gray-800">Credit Limit: <span className="font-bold">SAR {getAttr("total_credit_limit")}</span></p>
                                            <p className="text-gray-800">Credit Period: <span className="font-bold">{getAttr("credit_period") !== "N/A" ? getAttr("credit_period") : "0"} days</span></p>
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
