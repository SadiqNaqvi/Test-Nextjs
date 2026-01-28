"use client";
import { useEffect, useRef, useState } from "react";

const CHUNK_SIZE = 5 * 1024 * 1024; // must match backend logic

const SmartVideoPlayer = ({ href }: { href: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentRange, setCurrentRange] = useState(0);

    const fetchChunk = async (start: number) => {

        const end = start + CHUNK_SIZE - 1;

        const res = await fetch(href, {
            headers: { Range: `bytes=${start}-${end}` },
        });
        if (!res.ok) throw new Error("Chunk fetch failed");
        return await res.arrayBuffer();
    }

    useEffect(() => {

        if (!videoRef.current) return;

        // let sourceBuffer: SourceBuffer | null = null;
        const mediaSource: MediaSource = new MediaSource();
        let nextChunkStart = 0;

        videoRef.current.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener("sourceopen", async () => {

            const mimeCodec = 'video/mp4; codecs="avc1.64001F, mp4a.40.2"';
            const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
            // sourceBuffer = sb;

            // Fetch the first chunk
            const firstChunk = await fetchChunk(0);
            sourceBuffer.appendBuffer(firstChunk);
            nextChunkStart += CHUNK_SIZE;


            // When the first chunk finishes loading, prefetch the next one immediately
            sourceBuffer.addEventListener("updateend", async () => {
                if (nextChunkStart < mediaSource!.duration && !sourceBuffer.updating) {
                    const nextChunk = await fetchChunk(nextChunkStart);
                    sourceBuffer.appendBuffer(nextChunk);
                    nextChunkStart += CHUNK_SIZE;
                }
            });
        });

        return () => {
            if (mediaSource && mediaSource.readyState === "open")
                mediaSource.endOfStream();
        };
    }, []);

    return <video
        ref={videoRef}
        controls
        width="480"
        autoPlay
    />;
}

export default SmartVideoPlayer;