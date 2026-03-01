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
                    source: "/api/:path((?!auth|login|cart).*)",
                    destination: "https://altalayi-demo.btire.com/rest/V1/kleverapi/:path*",
                },
            ],
        };
    },
};

export default nextConfig;