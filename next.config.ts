// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: "/api/products",
                    destination:
                        "https://altalayi-demo.btire.com/rest/V1/kleverapi/favorite-products?pageSize=10&currentPage=1",
                },
                {
                    source: "/api/kleverapi/:path*",
                    destination: "https://altalayi-demo.btire.com/rest/V1/kleverapi/:path*",
                },
                {
                    source: "/api/:path((?!auth|login|cart|category-products|categories|tyre-size|filters|category-filters|category-filter-options|send-otp|login-otp|forgot-password).*)",
                    destination: "https://altalayi-demo.btire.com/rest/V1/kleverapi/:path*",
                },
            ],
        };
    },
};

export default nextConfig;