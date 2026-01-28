import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const workerUrl = "https://nsfw-detector.chrisruzax-cloudflare.workers.dev";

    const formData = await req.formData();

    const response = await fetch(workerUrl, {
        method: "POST",
        headers: {
            ...req.headers,
            "authorization": "Bearer e94fc1c8363f4c83836161029ca87a4d58b00eafd5464fcfb6fdd9bf529f0472"
        },
        body: formData,
    });

    const json = await response.json();

    console.log(json);

    return NextResponse.json(json);
}