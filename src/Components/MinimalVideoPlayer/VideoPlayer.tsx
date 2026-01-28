import { useCallback, useEffect, useRef, useState } from "react";
import OverlaySection from "./OverlaySection";
import PassiveProgressBar from "./PassiveProgressBar";
import VideoElement from "./VideoElement";
import ControlSection from "./ControlSection";

const FancyVideoPlayer = ({ src }: { src: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    const [playing, setPlaying] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [overlayAndControlsHidden, setOverlayAndControlsHidden] = useState(false);
    const [isRotated, setIsRotated] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // --- Track progress ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const update = () => {
            setProgress(video.currentTime);
            setDuration(video.duration || 0);
        }

        const handleWaiting = () => setBuffering(true);

        // When video can play or resumes
        const handlePlaying = () => setBuffering(false);
        const handleCanPlay = () => setBuffering(false);

        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("playing", handlePlaying);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("timeupdate", update);

        return () => {
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("playing", handlePlaying);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("timeupdate", update);
        };

    }, []);

    // --- Core player actions ---
    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (playing) video.pause();
        else video.play();
    }, [playing]);

    const handleHoldStart = () => {
        if (!playing) return;
        const v = videoRef.current;
        if (v) v.playbackRate = 2;
    };

    const handleHoldEnd = () => {
        const v = videoRef.current;
        if (v) v.playbackRate = 1;
    };

    const handleRotate = () => {
        const container = videoContainerRef.current
        if (!container) return;
        else if (isRotated) {
            container.style = "";
        } else {
            Object.assign(container.style, {
                height: container.parentElement?.clientWidth + "px",
                width: container.parentElement?.clientHeight + "px",
                transform: "rotate(90deg) translateY(-100%)",
                transformOrigin: "top left",
            });
        }
        setIsRotated(!isRotated);
    }

    const handleLoadedMetadata = () => {
        const vid = videoRef.current;
        if (!vid) return;
        setDuration(vid.duration);
    }

    const handleFullScreenToggle = () => {
        if (!document.fullscreenEnabled || !videoContainerRef.current) return;
        else if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            videoContainerRef.current.requestFullscreen();
        }
    }

    // const handleSeek = (percent: number) => {
    //     const v = videoRef.current;
    //     if (!v) return;
    //     v.currentTime = percent * v.duration;
    // };

    const handleBackward = (interval: number) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime -= interval;
    }

    const handleForward = (interval: number) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime += interval;
    }

    return (
        <div
            id="videoPlayer"
            ref={videoContainerRef}
            className="relative size-full"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
        >

            <VideoElement
                onLoadedMetadata={handleLoadedMetadata}
                ref={videoRef}
                src={src}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
            />

            <OverlaySection
                playing={playing}
                overlayAndControlsHidden={overlayAndControlsHidden}
                buffering={buffering}
                onPlayPause={togglePlay}
                onBackward={handleBackward}
                onForward={handleForward}
            />

            <ControlSection
                overlayAndControlsHidden={overlayAndControlsHidden}
                handleFullScreenToggle={handleFullScreenToggle}
                currentTime={progress}
                duration={duration}
                onHideOverlayAndControls={() => setOverlayAndControlsHidden(!overlayAndControlsHidden)}
                onRotate={handleRotate}
            />

            <PassiveProgressBar progress={progress} duration={duration} />
        </div>
    );
};

export default FancyVideoPlayer;