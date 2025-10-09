import { NextRequest, NextResponse } from "next/server";

export const GET = async (rq: NextRequest) => {
  const url = rq.nextUrl.searchParams.get("url");

  if (!url)
    return NextResponse.json({ error: "Missing URL param" }, { status: 400 });

  try {
    return await fetch(url, {
      headers: rq.headers,
      referrer: rq.referrer,
      referrerPolicy: rq.referrerPolicy,
    });
    // console.log(fetchRes.status);
    // if (fetchRes.status > 300)
    //   return new Response(await fetchRes.text(), { status: fetchRes.status });
    // const contentType = fetchRes.headers.get("content-type") || "text/plain";
    // const buffer = await fetchRes.arrayBuffer();

    // return new Response(Buffer.from(buffer), {
    //   headers: {
    //     "Content-Type": contentType,
    //     // "Cache-Control": "public, max-age=3600",
    //   },
    // });
  } catch (err) {
    console.error("Proxy fetch failed:", err);
    return new Response("Failed to fetch remote asset", { status: 500 });
  }
};
