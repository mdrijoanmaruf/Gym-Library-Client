import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken as string | undefined;
  if (!token) return new Response("Unauthorized", { status: 401 });

  const upstream = `${API_BASE}/media/stream/${resolvedParams.id}`;

  const rangeHeader = req.headers.get("range");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (rangeHeader) headers["Range"] = rangeHeader;

  const res = await fetch(upstream, { headers, cache: "no-store" });

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
      "Content-Length": res.headers.get("Content-Length") || "",
      "Content-Range": res.headers.get("Content-Range") || "",
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
