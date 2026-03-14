// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//     try {

//         const body = await req.json();

//         const res = await fetch(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/forget-password-mobile/reset`,
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     platform: "web"
//                 },
//                 body: JSON.stringify(body)
//             }
//         );

//         const data = await res.json();

//         return NextResponse.json(data, { status: res.status });

//     } catch (error: any) {

//         return NextResponse.json(
//             { message: error.message || "Server Error" },
//             { status: 500 }
//         );

//     }
// }