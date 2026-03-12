// import "intl-tel-input/build/css/intlTelInput.css";
// import type { Metadata } from "next";
// import { AuthProvider } from "@/app/context/AuthContext";
// import ProtectedLayout from "@/app/components/ProtectedLayout";
// import "./globals.css";

// const geistSans = "geist-sans";
// const geistMono = "geist-mono";

// export const metadata: Metadata = {
//   title: "Altalayi",
//   description: "Shopping Platform",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <AuthProvider>
//           <ProtectedLayout>{children}</ProtectedLayout>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

import "intl-tel-input/build/css/intlTelInput.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { CartProvider } from "../modules/cart/context/CartContext";
import { ReduxProvider } from "@/store/provider";
import ProtectedLayout from "@/app/components/ProtectedLayout";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Altalayi",
  description: "Shopping Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans`}>
        <ReduxProvider>
          <NextAuthProvider>
            <CartProvider>
              <Toaster position="top-right" reverseOrder={false} />
              <ProtectedLayout>
                {children}
              </ProtectedLayout>
            </CartProvider>
          </NextAuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}