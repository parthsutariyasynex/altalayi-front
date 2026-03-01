// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const res = await fetch(
//     `https://altalayi-demo.btire.com/rest/V1/kleverapi/category-filter-options/${params.id}`,
//     {
//       headers: {
//         Authorization: `Bearer YOUR_MAGENTO_TOKEN`,
//       },
//     }
//   );

//   const data = await res.json();
//   return Response.json(data);
// // }

// "use client";

// import { useEffect, useState } from "react";

// interface Product {
//   id?: number;
//   name?: string;
//   price?: number;
//   [key: string]: unknown; // flexible structure for Magento response
// }

// interface ProductPageProps {
//   params: { id: string };
// }

// export default function ProductPage({ params }: ProductPageProps) {
//   const [data, setData] = useState<Product | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchProduct() {
//       try {
//         const token = localStorage.getItem("token");

//         if (!token) {
//           throw new Error("No token found in localStorage");
//         }

//         const res = await fetch(`/api/products/${params.id}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!res.ok) {
//           throw new Error("Failed to fetch product");
//         }

//         const result: Product = await res.json();
//         setData(result);
//       } catch (err) {
//         if (err instanceof Error) {
//           setError(err.message);
//         } else {
//           setError("Something went wrong");
//         }
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchProduct();
//   }, [params.id]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div>
//       <h1>Product ID: {params.id}</h1>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  product_id: number;
  sku: string;
  name: string;
  final_price: number;
  show_old_price: boolean;
            "product_url": "https://altalayi-demo.btire.com/en/bridgestone-255-35-r21-t05-098y-tl-2025.html",
            "image_url": "https://altalayi-demo.btire.com/media/catalog/product/atcl-tyres/sample-bridgestone_56.jpg",
            "is_in_stock": false,
            "stock_qty": 0,
            "year": "2025",
            "origin": "Europe",
            "pattern": "Turanza T005",
            "warranty_period": "5 Years Warranty",
            "tyre_size": "255/35 R21",
            "product_group": "Passenger Car"
        }


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`/api/products?categoryId=${localStorage.getItem("categoryId")}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data); 
        setProducts(data.items || data.products || []);
      console.log("Products:", data.items || data.products || []);
      });
  }, []);

  return (
    <div>
  <h1>Category Products</h1>

  {products.length === 0}

  {Array.isArray(products) &&
    products.map((product) => (
      <div key={product.product_id}>
        <Link href={`/products/${product.product_id}`}>
          <h3>{product.name}</h3>
          <p>₹{product.final_price}</p>
        </Link>
      </div>
    ))}
</div>
  );
}