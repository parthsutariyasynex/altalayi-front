"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "@/store/actions/authActions";
import { RootState } from "@/store/store";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { loading: reduxLoading } = useSelector((state: RootState) => state.auth);

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // @ts-ignore
    dispatch(forgotPassword(email, (err) => {
      if (!err) {
        toast.success("Reset link sent successfully");
        router.push("/login");
      } else {
        toast.error(err || "Failed to send reset link");
      }
      setLoading(false);
    }));
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-['Rubik']">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-[450px] bg-white rounded-[3px] shadow-lg border border-gray-100 flex flex-col overflow-hidden">

          {/* Header Section */}
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div className="pb-4 border-b-[0.80px] border-gray-200">
              <div className="text-black text-lg font-bold uppercase tracking-wide">
                Forgot Password
              </div>
            </div>
          </div>

          {/* Form Content Section */}
          <div className="px-6 md:px-8 pb-8 flex flex-col gap-6">
            <div className="text-gray-600 text-xs font-normal leading-4">
              If you have an account, enter your email address to receive a reset link.
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-black text-xs font-semibold uppercase tracking-tight">Email</span>
                  <span className="text-red-600 text-xl font-semibold leading-none mt-1">*</span>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                  className={`w-full h-11 bg-white px-3 text-sm rounded-[1px] outline outline-1 transition-all ${error ? 'outline-red-500' : 'outline-neutral-200 focus:outline-black focus:outline-2'}`}
                />
                {error && <span className="text-red-500 text-[11px] font-medium leading-none">{error}</span>}
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <button
                  type="submit"
                  disabled={loading || reduxLoading}
                  className="w-full h-12 bg-amber-400 hover:bg-amber-500 rounded-[3px] flex justify-center items-center transition-all disabled:opacity-50 shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <div className="text-center text-black text-[13px] font-bold uppercase tracking-wider cursor-pointer">
                    {loading || reduxLoading ? 'Sending...' : 'Send Reset Link'}
                  </div>
                </button>

                <div className="flex justify-between items-center">
                  <Link href="/login">
                    <div className="text-black text-sm font-normal cursor-pointer hover:underline hover:text-amber-600 transition-colors">
                      Back to Login
                    </div>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}