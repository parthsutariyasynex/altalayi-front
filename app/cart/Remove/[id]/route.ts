// import { NextRequest, NextResponse } from "next/server";

// export async function DELETE(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     // ✅ Await params (IMPORTANT in Next 16)
//     const { id } = await context.params;

//     const token = req.headers.get("authorization");

//     if (!token) {
//       return NextResponse.json(
//         { error: "Token missing" },
//         { status: 401 }
//       );
//     }

//     // const res = await fetch(
//     //   `https://altalayi-demo.btire.com/rest/V1/kleverapi/cart/remove/${id}`,
//     //   {
//     //     method: "DELETE",
//     //     headers: {
//     //       Authorization: token,
//     //       "Content-Type": "application/json",
//     //     },
//     //     cache: "no-store",
//     //   }
//     // );
//     const res = await fetch(`/api/kleverapi/cart/remove/${itemId}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!res.ok) {
//       return NextResponse.json(
//         { error: "Magento API failed" },
//         { status: res.status }
//       );
//     }

//     const data = await res.json();

//     return NextResponse.json(data);

//   } catch {
//     return NextResponse.json(
//       { error: "Failed to remove from cart" },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://altalayi-demo.btire.com/rest/V1";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // no need Promise in stable versions

    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { error: "Token missing" },
        { status: 401 }
      );
    }

    // ✅ Call Magento API directly
    const res = await fetch(
      `${BASE_URL}/kleverapi/cart/remove/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error("Remove API error:", error);

    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}