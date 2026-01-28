import { createReadStream, statSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { File as MegaFile } from "megajs";
import { Readable } from "stream";
import { spawn } from "child_process";

const oneMb = 1024 * 1024;

const nodeToWebReadable = (nodeStream: Readable): ReadableStream => {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", chunk => controller.enqueue(chunk));
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", err => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    }
  });
}

export const GET = async (
  r: NextRequest,
  { params: { id } }: { params: { id: string } }
) => {
  const [i, ...keyArr] = id.split("-");

  const [key] = keyArr.join('-').split('.');
  try {
    const videoPath = path.join(process.cwd(), 'public', 'input.mp4');

    // const file = await MegaFile.fromURL(`https://mega.nz/file/${i}#${key}`).loadAttributes();
    // const fileSize = file.size || 0;

    const fileSize = statSync(videoPath).size
    const range = r.headers.get("range");
    if (!range) {
      // full file
      const stream = createReadStream(videoPath);
      return new Response(stream as any, {
        headers: {
          "Content-Length": String(fileSize),
          "Content-Type": "video/mp4",
          "Accept-Ranges": "bytes",
        },
      });
    }

    const [startParam, endParam] = (range.match(/bytes=(\d*)-(\d*)/) || []).slice(1).map(v => v ? parseInt(v, 10) : undefined);

    let baseChunk = 5 * oneMb; // 5MB default
    if (fileSize > 500 * oneMb) baseChunk = 10 * oneMb; // 10MB for >500MB videos
    if (fileSize < 100 * oneMb) baseChunk = 2 * oneMb;  // 2MB for small videos

    // Make the *first chunk* smaller to start playback faster
    const start = startParam ?? 0;
    const isFirstChunk = start === 0;
    const chunkSize = isFirstChunk ? Math.min(baseChunk / 2, 5 * oneMb) : baseChunk;

    const end = endParam ?? Math.min(start + chunkSize, (fileSize || 1) - 1);
    const contentLength = end - start + 1;

    // const webStream = createReadStream(videoPath, { start, end });
    // const nodeStream = file.download({ start, end });
    // const webStream = nodeToWebReadable(nodeStream);

    const webStream = spawn("ffmpeg", [
      "-i", videoPath,
      "-c", "copy",
      "-movflags", "+frag_keyframe+empty_moov",
      "-f", "mp4",
      "pipe:1"
    ]).stdout;

    const response = new NextResponse(webStream as any, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(contentLength),
        "Content-Size": String(fileSize),
        "Content-type": "video/mp4",
        // "Cache-Control": "public max-age=3600"
        "Cache-Control": "no-store"
      },
    });

    return response;
  } catch (err: any) {
    console.log(err.message);
    return new Response("Internal Server Error", { status: 500 });
  }
};
