import React, { MouseEvent, useEffect, useRef } from "react";
import { displayMessageIconsMap, useGlobalOptions } from "./helpers";
import SkipSectionsWrapper from "./SkipSectionWrapper";

type Props = { sensitivity?: number }

const SCRUB_THRESHOLD = 10;

const SeekOverlay = ({ sensitivity = 10 }: Props) => {

    const touchedXPosition = useRef(0);
    const currentXPosition = useRef(0);

    const { playing, fullScreen, screenLock, videoRef, setMessage, toggleControlsSeen, message } = useGlobalOptions();

    // To be used in calculation/process to avoid stale data since states inside event handlers are not gettin updated.
    const fullScreenRef = useRef(fullScreen);
    const screenLockRef = useRef(screenLock);

    useEffect(() => {
        fullScreenRef.current = fullScreen;
        screenLockRef.current = screenLock;
    }, [screenLock, fullScreen]);

    // raf = Request Animation Frame
    const rafRef = useRef<number | null>(null);

    // Speed handling
    const speedBoostTimeout = useRef<NodeJS.Timeout>(undefined);
    const normalPlaybackRate = useRef(1);

    // to distinguish click vs double-click
    const clickTimeout = useRef<NodeJS.Timeout | null>(null);

    // ======= CORE UPDATE LOGIC =======
    const updatePreview = () => {
        const pos = currentXPosition.current / sensitivity;
        const seconds = Math.abs(Math.floor(pos))
        setMessage({
            label: `${seconds}s`,
            icon: pos > 0 ? "ForwardIcon" : "BackwardIcon",
            rightSide: pos > 0,
        }, Infinity);
        rafRef.current = null;
    }

    const boostVideoSpeed = (times?: number) => {
        const vid = videoRef.current;
        if (times === 0 || !vid) return;

        if (times) normalPlaybackRate.current = times;
        else normalPlaybackRate.current = vid.playbackRate;

        const newSpeed = times || 2;
        vid.playbackRate = newSpeed;
        setMessage({
            label: `${newSpeed}×`,
            icon: "SpeedBoostIcon",
        }, Infinity);
    }

    const normaliseVideoSpeed = () => {
        const video = videoRef.current;
        if (!video) return;

        const newSpeed = normalPlaybackRate.current;
        video.playbackRate = newSpeed;
        setMessage(null);
    }

    // ======= START DRAG =======
    const startDrag = (x: number) => {

        const fullScreenState = fullScreenRef.current;
        const screenLockState = screenLockRef.current;
        const video = videoRef.current;

        if (!video || screenLockState || !fullScreenState) return;

        clearTimeout(speedBoostTimeout.current);
        touchedXPosition.current = x;
        currentXPosition.current = x;

        // If Video is playing and user touch and hold for longer than one second without sliding, set speed to 2x
        if (playing) {
            speedBoostTimeout.current = setTimeout(() => {
                if (touchedXPosition.current !== currentXPosition.current) return;
                // console.log("Boost hua")
                boostVideoSpeed();
            }, 1000);
        }
    }

    // ======= MOVE (THROTTLED BY RAF) =======
    const moveDrag = (x: number) => {

        const video = videoRef.current;
        const fullScreenState = fullScreenRef.current;
        const screenLockState = screenLockRef.current;

        if (touchedXPosition.current === 0 || !video || screenLockState || !fullScreenState) return;

        const delta = x - touchedXPosition.current;

        // Ignore small touches
        if (Math.abs(delta) < SCRUB_THRESHOLD) return;

        currentXPosition.current = delta;

        if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(updatePreview);
        }
    }

    const endDrag = () => {
        const video = videoRef.current;
        const fullScreenState = fullScreenRef.current;
        const screenLockState = screenLockRef.current;

        if (touchedXPosition.current === 0 || !video || screenLockState || !fullScreenState) return;

        if (speedBoostTimeout.current) {
            clearTimeout(speedBoostTimeout.current);
            speedBoostTimeout.current = undefined;
        }

        cancelAnimationFrame(rafRef.current || 0);

        if (touchedXPosition.current !== currentXPosition.current) {
            const seekSecs = currentXPosition.current / sensitivity;
            const newTime = Math.max(
                0,
                Math.min(video.duration, video.currentTime + seekSecs)
            );
            video.currentTime = newTime;
        }

        touchedXPosition.current = 0;
        currentXPosition.current = 0;
        // console.log("normal Rate", normalPlaybackRate.current);
        // console.log("current Rate", speedBoost);
        // console.log("video rate", video.playbackRate);
        normaliseVideoSpeed();
        setMessage(null);
    }

    // ======= MOUSE EVENTS =======
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        startDrag(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => moveDrag(e.clientX);

    const handleMouseUp = () => endDrag();

    // ======= TOUCH EVENTS =======
    const handleTouchStart = (e: React.TouchEvent) => {
        startDrag(e.touches[0].clientX);
    };

    // const handleTouchStart = (e: React.TouchEvent) => {
    //     console.log("handle touch start")
    //     const currentTime = Date.now();
    //     const tapGap = currentTime - lastTapRef.current;
    //     const touchX = e.touches[0].clientX;
    //     const screenWidth = window.innerWidth;

    //     console.log(tapGap);
    //     // detect double tap within 300ms
    //     if (tapGap < 300 && tapGap > 0) {

    //         // suppressClick.current = true; // prevent click toggle
    //         // setTimeout(() => (suppressClick.current = false), 400);

    //         // left / right / center double tap
    //         console.log(touchX);
    //         if (touchX < screenWidth * 0.4) {
    //             onBackward(10);
    //         } else if (touchX > screenWidth * 0.6) {
    //             onForward(10);
    //         } else {
    //             togglePlayState();
    //         }
    //         // e.preventDefault();
    //         return;
    //     }

    //     lastTapRef.current = currentTime;
    //     startDrag(touchX);
    // };

    const handleTouchMove = (e: TouchEvent) => moveDrag(e.touches[0].clientX);
    const handleTouchEnd = () => endDrag();

    // ======= CLICK HANDLING (Single vs Double Click Distinguish) =======
    const handleClick = () => {
        // if (suppressClick.current) return;

        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = null;
            return;
        }

        clickTimeout.current = setTimeout(() => {
            toggleControlsSeen();
            clickTimeout.current = null;
        }, 250);
    };

    // ======= EVENT BINDING =======
    const handleGlobalMouseMove = (e: any) => handleMouseMove(e);
    const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);

    useEffect(() => {

        window.addEventListener("mousemove", handleGlobalMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("mousemove", handleGlobalMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleGlobalTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    const IconToDisplayWithMessage = () => {
        if (!message || !message.icon) return;
        const Icon = displayMessageIconsMap[message.icon];
        if (!Icon) return;
        return <Icon />
    }

    return (
        <section
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleClick}
            className={`absolute flex z-[1] inset-0`}
        >

            <SkipSectionsWrapper />

            {message && (
                <div className={`absolute inset-0 flex gap-2 ${message.rightSide ? "flex-row-reverse" : "flex-row"} items-start justify-center text-white text-lg mt-4 animate-fadeInOut`}>
                    <span><IconToDisplayWithMessage /></span>
                    <span>{message.label}</span>
                </div>
            )}

        </section >
    )
}

export default SeekOverlay;