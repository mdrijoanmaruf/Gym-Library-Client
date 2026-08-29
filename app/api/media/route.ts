import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getToken() {
  const session = await getServerSession(authOptions);
  return (session as any)?.accessToken as string | undefined;
}

export async function GET(req: NextRequest) {
  const token = await getToken();
  // We no longer require a token here since media is now public
  
  const { searchParams } = new URL(req.url);
  const upstream = `${API_BASE}/media?${searchParams.toString()}`;

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(upstream, {
    headers,
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
