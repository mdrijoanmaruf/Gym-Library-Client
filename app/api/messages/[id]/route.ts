import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const upstream = `${API_BASE}/messages/${id}/read`;

  const res = await fetch(upstream, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { text }; }
  
  if (!res.ok) {
    return NextResponse.json(data || { error: "Failed to update message" }, { status: res.status });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const upstream = `${API_BASE}/messages/${id}`;

  const res = await fetch(upstream, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { text }; }
  
  if (!res.ok) {
    return NextResponse.json(data || { error: "Failed to delete message" }, { status: res.status });
  }

  return NextResponse.json(data);
}
