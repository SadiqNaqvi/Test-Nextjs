import { NextRequest, NextResponse } from "next/server";
import { isCorrectURL } from "@lib/utils";
import zlib from 'zlib';
import { Readable, PassThrough } from 'stream';
import { pipeline } from 'stream/promises';

export const runtime = 'nodejs';

const STREAMING_CONTENT_TYPES = ['text/event-stream', 'application/x-ndjson'];
const MAX_BUFFER_SIZE = 1024 * 1024; // 1MB
const THRESHOLD_SIZE = MAX_BUFFER_SIZE * 100 // 100MB

// Utility: Check if content type is likely streaming
function isStreamingContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  return STREAMING_CONTENT_TYPES.some((type) => contentType.includes(type));
}

// Utility: Convert Web ReadableStream → Node.js stream
function webReadableStreamToNodeReadable(webStream: ReadableStream<Uint8Array>): NodeJS.ReadableStream {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) this.push(null);
        else this.push(Buffer.from(value));
      } catch (err) {
        this.destroy(err as Error);
      }
    },
  });
}

// Decompress if needed
function tryDecompress(buffer: Buffer, encoding: string | null): Buffer {
  try {
    if (encoding === 'br') return zlib.brotliDecompressSync(buffer);
    else if (encoding === 'gzip') return zlib.gunzipSync(buffer);
    else if (encoding === 'deflate') return zlib.inflateSync(buffer);
    else return buffer;
  } catch (error) {
    console.warn(`⚠️ Decompression failed, sending raw buffer:`, (error as Error).message);
  }
  return buffer; // fallback to raw
}

export const GET = async (rq: NextRequest) => {
  const url = rq.nextUrl.searchParams.get("url");
  if (!url)
    return NextResponse.json({ error: "Missing URL param" }, { status: 400 });

  else if (!isCorrectURL(url, false))
    return NextResponse.json({ error: "Invalid URL! Please send a valid URL" }, { status: 400 })

  try {

    const incomingHeaders = new Headers(rq.headers);
    incomingHeaders.delete('host');
    incomingHeaders.delete('connection');
    incomingHeaders.delete('content-length');
    incomingHeaders.set('accept-encoding', 'br, gzip, deflate');

    // HEAD request to inspect headers
    const headResponse = await fetch(url, { method: 'HEAD', headers: incomingHeaders });

    const contentLengthHeader = headResponse.headers.get('content-length');
    const encoding = headResponse.headers.get('content-encoding');
    const contentType = headResponse.headers.get('content-type');
    const transferEncoding = headResponse.headers.get('transfer-encoding');

    if (contentLengthHeader && parseInt(contentLengthHeader) > THRESHOLD_SIZE) {
      return NextResponse.json({ error: "Response size is too large" }, { status: 400 })
    }

    const isLarge = contentLengthHeader && parseInt(contentLengthHeader) > MAX_BUFFER_SIZE;
    const isStreaming = transferEncoding === 'chunked' || isStreamingContentType(contentType);

    // If streaming or large, use stream-pipe mode
    if (isLarge || isStreaming) {
      const response = await fetch(url, {
        method: "GET",
        headers: incomingHeaders
      });

      const nodeStream = webReadableStreamToNodeReadable(response.body!);
      const passThrough = new PassThrough();

      nodeStream.pipe(passThrough);

      const headersToSend = new Headers();
      headersToSend.set('Content-Type', contentType || 'application/octet-stream');
      headersToSend.set('Cache-Control', response.headers.get('cache-control') || 'no-cache');
      if (contentLengthHeader) {
        headersToSend.set('Content-Length', contentLengthHeader);
      }

      // headersToSend.set('X-Proxied-By', 'Next.js Proxy (Stream)');

      return new NextResponse(passThrough as any, {
        status: response.status,
        headers: headersToSend,
      });
    }

    // Else: buffer + decompress
    const response = await fetch(url, {
      method: 'GET',
      headers: incomingHeaders,
    });

    if (!response.body) {
      return NextResponse.json({ error: 'No response body from target' }, { status: 502 });
    }
    // Buffer the entire response body
    const arrayBuffer = await response.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Try to decompress it
    const finalBuffer = tryDecompress(rawBuffer, encoding);

    const headersToSend = new Headers();
    headersToSend.set('Content-Type', contentType || 'application/octet-stream');
    headersToSend.set('Cache-Control', response.headers.get('cache-control') || 'no-cache');
    // headersToSend.set('X-Proxied-By', 'Next.js Proxy');

    // Return the stream as a NextResponse
    return new NextResponse(finalBuffer, {
      status: response.status,
      headers: headersToSend,
    });

  } catch (err: any) {
    console.error("Proxy failed:", err.message);
    return NextResponse.json({ error: "Uncaught Error! Please try again." }, { status: 500 });
  }
};
