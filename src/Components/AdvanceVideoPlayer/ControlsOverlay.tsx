import { TypedFunction } from "@type/general";
import { PropsWithChildren, useEffect, useRef } from "react";
import InteractiveProgressBar from "./InteractiveProgressBar";
import { useGlobalOptions } from "./helpers";
import { ExpandIcon, MuteIcon, PauseIcon, PlayIcon, SettingsIcon, ShrinkIcon, UnlockIcon, VolumeIcon } from "./PlayerIcons";

type Func = () => void

const OptionsButton = ({ children, onClick }: PropsWithChildren<{ onClick?: TypedFunction }>) => (
    <button className="p-1" onClick={onClick}>
        {children}
    </button>
)

const ControlSection = ({ openSheet }: { openSheet: TypedFunction }) => {

    const { setScreenLock, fullScreen, setMessage, controlsSeen, screenLock, setControlsSeen, togglePlayState, playing, videoRef, toggleFullScreen } = useGlobalOptions();

    const overlayContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = overlayContainerRef.current
        if (!container) return;

        if (controlsSeen) {
            container.classList.remove("hidden");
        } else {
            setTimeout(() => {
                container.classList.add("hidden");
            }, 600);
        }
    }, [controlsSeen]);

    const toggleScreenLock = () => {
        console.log(screenLock);
        if (screenLock)
            setScreenLock(false);
        else {
            setControlsSeen(false);
            setScreenLock(true);
        }
    }

    const handleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.muted)
            setMessage({ label: "Unmuted", icon: "VolumeIcon" })
        else setMessage({ label: "Muted", icon: "MuteIcon" })
        video.muted = !video.muted;
    }

    if (screenLock) return (
        <div className="absolute bottom-0 right-0 mb-4 mr-4 z-[2]">
            <button onClick={toggleScreenLock}>
                <UnlockIcon />
            </button>
        </div>
    )

    return (
        <section ref={overlayContainerRef} className={`absolute bottom-0 w-full z-[2] mt-auto px-3 ${controlsSeen ? "fade-in" : "fade-out"}`}>

            <InteractiveProgressBar />

            <div className="flex flex-cntr-between py-2">
                <span>
                    <OptionsButton onClick={togglePlayState}>
                        {playing ? <PauseIcon /> : <PlayIcon />}
                    </OptionsButton>
                </span>
                <span className="flex gap-2">
                    <OptionsButton onClick={handleMute}>
                        {videoRef.current?.muted ? <MuteIcon /> : <VolumeIcon />}
                    </OptionsButton>
                    {fullScreen && (<OptionsButton onClick={openSheet}>
                        <SettingsIcon />
                    </OptionsButton>
                    )}
                    <OptionsButton onClick={toggleFullScreen}>
                        {fullScreen ? <ShrinkIcon /> : <ExpandIcon />}
                    </OptionsButton>
                </span>
            </div>
        </section>
    )
}

export default ControlSection;

/*
Bottom
1. Play pause
2. Mute
7. Layout change
8. Expand/Shrink
9. PiP

Top Drawer
3. Speed rate
4. Screenshot
5. Rotate
6. Lock

*/