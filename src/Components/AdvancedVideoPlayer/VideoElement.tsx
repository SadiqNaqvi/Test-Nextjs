"use client";

import React, { forwardRef, PropsWithChildren, useEffect, useState } from "react";
import { useGlobalOptions } from "./helpers";
import { useVideoPrefetcher } from "@lib/videoFetchingMechanish";

type Props = {
    src: string;
    setPlaying: (state: boolean) => void
}

const VideoElementWrapper = ({ children }: PropsWithChildren) => {
    const { buffering, screenLock, controlsSeen } = useGlobalOptions();
    return (
        <div className={`size-full z-[0] ${(controlsSeen || buffering) && !screenLock ? "transition-all duration-500 brightness-50" : ''}`}>
            {children}
        </div>
    )

}

const VideoElement = forwardRef<HTMLVideoElement, Props>(({ src, setPlaying }, ref) => {

    const [source, setSource] = useState("");
    const { videoRef } = useGlobalOptions();

    // useEffect(() => {
    // }, [src]);

    useEffect(() => {
        if (!videoRef.current) return;

        setSource(src);
        const video = videoRef.current;
        const mediaSource = new MediaSource();

        video.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener("sourceopen", async () => {
            console.log("MediaSource open");

            // ✅ Use proper MIME type
            const mime = 'video/mp4; codecs="avc1.640028, mp4a.40.2"';
            if (!MediaSource.isTypeSupported(mime)) {
                console.error("MIME type not supported:", mime);
                return;
            }

            const sourceBuffer = mediaSource.addSourceBuffer(mime);

            try {
                console.log("Fetching full video file...");
                const response = await fetch(src); // 🔹 replace `videoUrl` with your file URL
                const data = await response.arrayBuffer();

                console.log("Appending full buffer...");
                sourceBuffer.addEventListener("updateend", () => {
                    console.log(
                        "updateend → buffered ranges:",
                        video.buffered.length
                            ? `${video.buffered.start(0)} → ${video.buffered.end(0)}`
                            : "no buffer"
                    );

                    // ✅ Set source only after first append completes
                    if (mediaSource.readyState === "open" && !video.srcObject) {
                        console.log("Ready to play");
                        video.play();
                    }
                });

                sourceBuffer.appendBuffer(data);
            } catch (err) {
                console.error("Error fetching/appending:", err);
            }
        });

        return () => {
            console.log("Cleaning up...");
            video.removeAttribute("src");
            video.load();
        };
    }, [src]);

    // const { startLoading } = useVideoPrefetcher(videoRef, source);

    const handleEvent = (e: any) => console.log("Event:", e.type);

    return (
        <VideoElementWrapper>
            <video
                ref={ref}
                // src={source}
                className="size-full z-[0] object-contain"
                preload="none"
                crossOrigin="anonymous"
                onLoadStart={() => console.log("loadstart on onloadstart")}
                onLoadedMetadata={() => console.log("loadedmetadata")}
                onCanPlay={() => {
                    // startLoading();
                    console.log("canplay")
                }}
                onPlaying={() => console.log("playing")}
                onStalled={() => console.log("stalled")}
                onWaiting={() => console.log("waiting")}
                onError={(e) => console.error(e)}
                onLoadedData={handleEvent}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
            />
        </VideoElementWrapper>
    )
});

VideoElement.displayName = "VideoElement";

export default React.memo(VideoElement);