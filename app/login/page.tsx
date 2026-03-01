"use client";
import "intl-tel-input/build/css/intlTelInput.css";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { login, sendOtp, loginWithOtp } from "@/store/actions/authActions";
import { RootState } from "@/store/store";

const COUNTRY_CODES = [
  { code: "+966", country: "Saudi Arabia", iso: "sa", flagClass: "iti__flag iti__sa" },
  { code: "+91", country: "India", iso: "in", flagClass: "iti__flag iti__in" },
  { code: "+971", country: "United Arab Emirates", iso: "ae", flagClass: "iti__flag iti__ae" },
];

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "otp">("password");

  const dispatch = useDispatch();
  const { loading: reduxLoading } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+966");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const qp = searchParams.get("mode");
    if (qp === "otp" || qp === "password") {
      setMode(qp);
    }
  }, [searchParams]);

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (mode === "password") {
      if (!email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";
      if (!password) newErrors.password = "Password is required";
    } else {
      if (!mobileNumber) newErrors.mobile = "Mobile number is required";
      if (otpSent && !otp) newErrors.otp = "OTP is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    setErrors({});
    if (!mobileNumber) {
      setErrors({ mobile: "Mobile number is required" });
      return;
    }
    const fullMobile = (countryCode + mobileNumber).replace("+", "");

    // @ts-ignore
    dispatch(sendOtp(fullMobile, (err, data) => {
      if (!err) {
        toast.success("OTP Sent");
        setOtpSent(true);
      } else {
        toast.error(err || "Failed to send OTP");
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    if (mode === "password") {
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.ok) {
          toast.success("Login Successful");
          router.replace("/my-account");
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      } catch {
        toast.error("Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      const fullMobile = (countryCode + mobileNumber).replace("+", "");
      // @ts-ignore
      dispatch(loginWithOtp({ mobile: fullMobile, otp }, (err: any) => {
        if (!err) {
          toast.success("Login Successful");
          router.replace("/my-account");
        } else {
          toast.error(err || "Login Failed");
        }
        setLoading(false);
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-['Rubik']">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-[450px] bg-white rounded-[3px] shadow-lg border border-gray-100 flex flex-col overflow-hidden">

          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div className="pb-4 border-b-[0.80px] border-gray-200">
              <div className="text-black text-lg font-bold uppercase tracking-wide">
                Registered Customers
              </div>
            </div>

            <div className="flex rounded-[5px] overflow-hidden border border-gray-100">
              <button
                className={`flex-1 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${mode === 'otp' ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'}`}
                onClick={() => { setMode("otp"); setOtpSent(false); setErrors({}); router.push("/login?mode=otp"); }}
              >
                Login with OTP
              </button>
              <button
                className={`flex-1 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${mode === 'password' ? 'bg-black text-white' : 'bg-neutral-100 text-black hover:bg-neutral-200'}`}
                onClick={() => { setMode("password"); setOtpSent(false); setErrors({}); router.push("/login?mode=password"); }}
              >
                Login with Password
              </button>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8 flex flex-col gap-6">
            <div className="text-gray-600 text-xs font-normal leading-4">
              {mode === 'password'
                ? "If you have an account, sign in with your email address."
                : "If you have an account, sign in with your mobile number."}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {mode === 'password' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-black text-xs font-semibold uppercase tracking-tight">Email</span>
                      <span className="text-red-600 text-xl font-semibold leading-none mt-1">*</span>
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                      className={`w-full h-11 bg-white px-3 text-sm rounded-[1px] outline outline-1 transition-all ${errors.email ? 'outline-red-500' : 'outline-neutral-200 focus:outline-black focus:outline-2'}`}
                    />
                    {errors.email && <span className="text-red-500 text-[11px] font-medium leading-none">{errors.email}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-black text-xs font-semibold uppercase tracking-tight">Password</span>
                      <span className="text-red-600 text-xl font-semibold leading-none mt-1">*</span>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }}
                      className={`w-full h-11 bg-white px-3 text-sm rounded-[1px] outline outline-1 transition-all ${errors.password ? 'outline-red-500' : 'outline-neutral-200 focus:outline-black focus:outline-2'}`}
                    />
                    {errors.password && <span className="text-red-500 text-[11px] font-medium leading-none">{errors.password}</span>}
                  </div>
                </>
              )}

              {mode === 'otp' && (
                <>
                  <div className="flex flex-col gap-1.5 relative">
                    <div className="flex items-center gap-1">
                      <span className="text-black text-xs font-semibold uppercase tracking-tight">Mobile Number</span>
                      <span className="text-red-600 text-xl font-semibold leading-none mt-1">*</span>
                    </div>
                    <div className={`flex h-11 bg-white rounded-[1px] outline outline-1 transition-all overflow-visible ${errors.mobile ? 'outline-red-500' : 'outline-neutral-200 focus-within:outline-black focus-within:outline-2'}`}>
                      <div
                        className="bg-[#f5f5f5] px-3 flex items-center gap-2 border-r border-neutral-200 cursor-pointer min-w-[100px] hover:bg-neutral-200 transition-colors"
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        <span className={`${selectedCountry?.flagClass} scale-110`}></span>
                        <span className="text-[#e02b27] font-bold text-xs">{selectedCountry?.code}</span>
                        <span className="text-[8px] text-gray-500">▼</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={mobileNumber}
                        onChange={(e) => { setMobileNumber(e.target.value.replace(/\D/g, "")); if (errors.mobile) setErrors({ ...errors, mobile: '' }); }}
                        className="flex-1 px-3 text-sm outline-none"
                      />

                      {showDropdown && (
                        <div className="absolute top-[75px] left-0 w-full bg-white border border-neutral-300 shadow-2xl z-[9999] rounded-[2px] overflow-hidden">
                          {COUNTRY_CODES.map((item) => (
                            <div
                              key={item.code}
                              onClick={() => { setCountryCode(item.code); setShowDropdown(false); }}
                              className="p-3.5 hover:bg-neutral-100 cursor-pointer flex items-center gap-3 border-b last:border-0 border-neutral-100 transition-colors"
                            >
                              <span className={item.flagClass}></span>
                              <span className="text-xs font-bold text-black">{item.code}</span>
                              <span className="text-[10px] text-gray-400 italic">{item.country}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.mobile && <span className="text-red-500 text-[11px] font-medium leading-none">{errors.mobile}</span>}
                  </div>

                  {otpSent && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-black text-xs font-semibold uppercase tracking-tight">Verification Code</span>
                        <span className="text-red-600 text-xl font-semibold leading-none mt-1">*</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value); if (errors.otp) setErrors({ ...errors, otp: '' }); }}
                        className={`w-full h-11 bg-white px-3 text-sm text-center font-bold tracking-[8px] rounded-[1px] outline outline-1 transition-all placeholder:tracking-normal placeholder:font-normal ${errors.otp ? 'outline-red-500' : 'outline-neutral-200 focus:outline-black focus:outline-2'}`}
                      />
                      {errors.otp && <span className="text-red-500 text-[11px] font-medium leading-none">{errors.otp}</span>}
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-col gap-4 mt-2">
                <button
                  type={mode === 'otp' && !otpSent ? 'button' : 'submit'}
                  disabled={loading || reduxLoading}
                  onClick={mode === 'otp' && !otpSent ? handleSendOtp : undefined}
                  className="w-full h-12 bg-amber-400 hover:bg-amber-500 rounded-[3px] flex justify-center items-center transition-all disabled:opacity-50 shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <div className="text-center text-black text-[13px] font-bold uppercase tracking-wider cursor-pointer">
                    {mode === 'otp' && !otpSent ? 'Send OTP' : (loading || reduxLoading ? 'Please Wait...' : 'Sign In')}
                  </div>
                </button>

                <div className="flex justify-end">
                  <Link href="/forgot-password">
                    <div className="text-right text-black text-sm font-normal cursor-pointer hover:underline hover:text-amber-600 transition-colors">
                      Forgot Your Password?
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