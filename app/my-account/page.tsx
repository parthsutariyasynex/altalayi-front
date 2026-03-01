"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerInfo } from "@/store/actions/customerActions";
import { RootState } from "@/store/store";

type CustomAttribute = {
	attribute_code: string;
	value: string;
};

type Customer = {
	id?: number | string;
	firstname?: string;
	lastname?: string;
	email?: string;
	custom_attributes?: CustomAttribute[];
};

export default function MyAccountPage() {
	const router = useRouter();
	const dispatch = useDispatch();
	const { data: session, status } = useSession();
	const { data: customer, loading } = useSelector((state: RootState) => state.customer);
	const token = useSelector((state: RootState) => state.auth.token);

	useEffect(() => {
		// Use NextAuth session for auth check (survives page refresh, unlike Redux token)
		if (status === "unauthenticated") {
			router.replace("/login");
			return;
		}

		// Wait for both session to be authenticated AND Redux token to be synced from ProtectedLayout
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
		)?.value || "";

	return (
		<div className="min-h-screen bg-gray-100 font-['Rubik']">
			<Navbar />

			<div className="max-w-4xl mx-auto p-6">
				<div className="bg-white p-6 rounded shadow-sm border border-gray-200">
					{/* MY ACCOUNT */}
					<h1 className="text-2xl font-bold mb-6 uppercase tracking-wide">
						My Account
					</h1>

					{/* Account Information */}
					<h2 className="text-lg font-semibold border-b border-gray-100 pb-2">
						Account Information
					</h2>

					{/* Contact Info Box */}
					<div className="mt-8 w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
						{/* Contact Info Heading */}
						<div className="bg-neutral-100 text-black font-semibold px-4 py-3 border-b border-gray-200 uppercase text-sm">
							Contact Information
						</div>

						{/* Contact Info Content */}
						<div className="p-6 space-y-3 bg-white text-sm">
							<p><b className="text-gray-700">Contact Name:</b> {customer.firstname} {customer.lastname}</p>
							<p><b className="text-gray-700">Email:</b> {customer.email}</p>
							<p><b className="text-gray-700">Customer Mobile:</b> {getAttr("mobile_number")}</p>
							<p><b className="text-gray-700">Company Name:</b> {getAttr("company_name")}</p>
							<p><b className="text-gray-700">Customer Code:</b> {getAttr("customer_code")}</p>
							<p><b className="text-gray-700">Industry:</b> {getAttr("industry")}</p>
							<p><b className="text-gray-700">Location:</b> {getAttr("location") || "N/A"}</p>
						</div>

						{/* Buttons */}
						<div className="p-6 pt-0 flex gap-4">
							<button className="bg-amber-400 text-black text-xs font-bold px-6 py-2.5 rounded shadow-sm hover:bg-amber-500 transition-colors uppercase cursor-pointer">
								Edit
							</button>
							<button
								onClick={() => router.push("/change-password")}
								className="bg-amber-400 text-black text-xs font-bold px-6 py-2.5 rounded shadow-sm hover:bg-amber-500 transition-colors uppercase cursor-pointer"
							>
								Change Password
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
