import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getToken() {
  const session = await getServerSession(authOptions);
  return (session as any)?.accessToken as string | undefined;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken();
  console.log("API ROUTE PATCH: token is present?", !!token, "Token length:", token?.length);
  
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
      console.log("TOKEN EXPIRY:", new Date(payload.exp * 1000).toLocaleString());
    } catch (e) {
      console.log("Failed to parse token payload");
    }
  }

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: Missing token in proxy" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const upstream = `${API_BASE}/media/${id}`;

  const res = await fetch(upstream, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  console.log("API ROUTE PATCH UPSTREAM RESPONSE:", res.status, text);
  
  let data;
  try { data = JSON.parse(text); } catch { data = { text }; }
  
  return NextResponse.json(data || {}, { status: res.status });
}
