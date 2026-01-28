import { formDataToObject } from "@lib/utils";
import { fileTypeFromBlob } from "file-type";
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { createRequire } from "module";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static");

const oneKb = 1024
const oneMb = oneKb * oneKb;

export const POST = async (r: NextRequest) => {
    const data = formDataToObject(await r.formData()) as { files: File };

    const file: File = Array.isArray(data.files) ? data.files[0] : data.files

    if (!file)
        return Response.json({ success: false, error: "File Not found" }, { status: 400 });

    const fileType = await fileTypeFromBlob(file);

    if (!fileType || !fileType.mime.startsWith("video"))
        return Response.json({ success: false, error: "Invalid File. Please send a valid video file." }, { status: 400 });

    else if (file.size > oneMb * 100)
        return Response.json({ success: false, error: "File is too large to compress. Please select a file less than 100 mb and try again" }, { status: 400 });

    console.log("Using FFmpeg binary:", ffmpegPath);

    // Save uploaded file temporarily 
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-"));
    const inputPath = path.join(tempDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputPath, buffer);
    const outputPath = path.join(tempDir, "compressed.mp4");

    // FFmpeg commands 
    const ffmpegArgs = [
        "-i", inputPath,
        "-vcodec", "libx264",
        "-crf", "23", // lower = better quality, higher = more compression 
        "-preset", "veryfast",
        "-acodec", "aac",
        outputPath
    ];

    console.log("COMPRESSION STARTED at", new Date().toTimeString().split(' ')[0]);

    let timeout: NodeJS.Timeout | null = setTimeout(() => {
        timeout = null;
    }, 5000);;
    const showMessage = (message: string) => {
        if (timeout) return;
        timeout = setTimeout(() => {
            console.log("FFmpeg:", message);
            timeout = null;
        }, 100_000)
    }

    await new Promise<void>(
        (resolve, reject) => {
            const ffmpeg = spawn(ffmpegPath!, ffmpegArgs);
            ffmpeg.stderr.on("data", (data) => {
                showMessage(String(data))
            });
            ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(`FFmpeg exited with ${code}`)));
        });

    const compressedBuffer = await fs.readFile(outputPath);

    // cleanup 
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);
    await fs.rmdir(tempDir);
    return new NextResponse(compressedBuffer, {
        headers: {
            "Content-Type": "video/mp4",
            "Content-Disposition": `attachment; filename=compressed.mp4`
        }
    });

}