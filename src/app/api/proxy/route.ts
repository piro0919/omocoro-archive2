// app/api/proxy/route.ts
import { type NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTNAMES = ["omocoro.jp", "cdn.omocoro.jp", "img.omocoro.jp"]; // ホワイトリスト

// eslint-disable-next-line import/prefer-default-export
export async function GET(req: NextRequest): Promise<NextResponse> {
  const targetUrl = req.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing 'url' parameter", { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  // ホストの許可チェック
  if (!ALLOWED_HOSTNAMES.includes(parsedUrl.hostname)) {
    return new NextResponse("Hostname not allowed", { status: 403 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Referer: "", // refererを空にしてhotlink防止回避
        "User-Agent": req.headers.get("user-agent") || "",
      },
    });

    if (!response.ok) {
      console.error("Fetch failed:", response.status, targetUrl);

      return new NextResponse("Failed to fetch image", { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.startsWith("image/")) {
      return new NextResponse("Not an image", { status: 415 });
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Content-Type": contentType,
        "X-Proxy-By": "omocoro-archive-proxy",
      },
      status: 200,
    });
  } catch (err) {
    console.error("Proxy error:", err);

    return new NextResponse("Proxy error", { status: 500 });
  }
}
