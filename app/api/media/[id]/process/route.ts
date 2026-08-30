import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const upstream = `${API_BASE}/media/${id}/process`;

  const res = await fetch(upstream, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  
  let data;
  try { data = JSON.parse(text); } catch { data = { text }; }
  
  if (!res.ok) {
    return NextResponse.json(data || { error: "Failed to process video" }, { status: res.status });
  }

  return NextResponse.json(data);
}
