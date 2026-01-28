"use client";

import { useEffect, useRef } from "react";
import ControlsOverlay from "./ControlsOverlay";
import { useGlobalOptions, VideoOptionsProvider } from "./helpers";
import SeekOverlay from "./SeekOverlay";
import SettingSheet, { SheetRefType } from "./SettingSheet";
import VideoElement from "./VideoElement";

type Props = { src: string, sensitivity?: number, autoplay?: boolean }

const VideoPlayer = ({ sensitivity, src, autoplay }: Props) => {

    const { setProgress, setDuration, setBuffering, setPlaying, setFullScreen, playbackRate, videoContainerRef, videoRef } = useGlobalOptions();
    const sheetRef = useRef<SheetRefType>(null);

    // To avoid stale data in calculations.
    const playbackRateRef = useRef(playbackRate);

    const reapplyPlaybackRate = () => {
        const freshPlaybackRate = playbackRateRef.current;
        const video = videoRef.current;
        if (!video || video.playbackRate === freshPlaybackRate) return;
        video.playbackRate = freshPlaybackRate;
    }

    useEffect(() => {
        playbackRateRef.current = playbackRate;
    }, [playbackRate]);

    const handleEvent = (e: any) => {
        console.log(videoRef.current?.readyState)
        console.log("Event:", e.type);
    }

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // video.currentTime = 0;

        // Update current time 
        const progressUpdate = () => {
            setProgress(video.currentTime);
            setDuration(video.duration || 0);
        }

        const handleMetadata = () => {
            console.log("Metadata me aaya")
            setDuration(video.duration);
            reapplyPlaybackRate();
        }

        const handleWaiting = (e: any) => {
            setBuffering(true);
            console.log(e.type + " in useEffect");
        }

        // When video can play or resumes
        const handlePlaying = () => setBuffering(false);
        const handleCanPlay = () => {
            reapplyPlaybackRate();
            setBuffering(false);
        }

        const handleFullScreenChange = () => {
            if (document.fullscreenElement === videoContainerRef.current) {
                setFullScreen(true);
                if (videoRef.current?.currentTime === 0 && autoplay)
                    setPlaying(true);
            }
            else setFullScreen(false);
        }

        video.addEventListener("ratechange", reapplyPlaybackRate);
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("playing", handlePlaying);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("timeupdate", progressUpdate);
        video.addEventListener("loadstart", handleWaiting);
        video.addEventListener("loadedmetadata", handleMetadata);
        video.addEventListener("loadeddata", handleCanPlay);
        document.addEventListener("fullscreenchange", handleFullScreenChange);

        return () => {
            video.removeEventListener("ratechange", reapplyPlaybackRate);
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("playing", handlePlaying);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("timeupdate", progressUpdate);
            video.removeEventListener("loadedmetadata", handleMetadata);
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };

    }, []);

    const openSheet = () => {
        sheetRef.current?.open();
    }

    return (
        <div
            ref={videoContainerRef}
            className="relative size-full bg-black overflow-hidden select-none rounded-md touch-none"
        >
            <VideoElement
                ref={videoRef}
                src={src}
                setPlaying={setPlaying}
            />

            <SeekOverlay sensitivity={sensitivity} />

            <ControlsOverlay openSheet={openSheet} />

            <SettingSheet sheetRef={sheetRef} />

        </div>
    );
}

const AdvanceVideoPlayer = (props: Props) => (
    <VideoOptionsProvider>
        <VideoPlayer {...props} />
    </VideoOptionsProvider>
)

export default AdvanceVideoPlayer;