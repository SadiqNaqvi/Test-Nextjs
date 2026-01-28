import { PropsWithChildren, Suspense, useState } from "react"

type Func = () => void

type Props = {
    onRotate: Func,
    onHideOverlayAndControls: Func,
    handleFullScreenToggle: Func,
    overlayAndControlsHidden: boolean,
    duration: number,
    currentTime: number,
}

const twoDigit = (num: number) => num.toString().padStart(2, "0");

const formatTime = (seconds: number): string => {
    if (seconds < 0 || !Number.isFinite(seconds)) {
        throw new Error("Invalid duration");
    }

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);


    if (hrs > 0) {
        // Format as HH:MM:SS if there is at least one hour
        return `${twoDigit(hrs)}:${twoDigit(mins)}:${twoDigit(secs)}`;
    } else {
        // Otherwise, format as MM:SS
        return `${twoDigit(mins)}:${twoDigit(secs)}`;
    }
}

const DrawerButtons = ({ onClick, children }: PropsWithChildren<{ onClick?: Func }>) => (
    <button
        type="button"
        onClick={onClick}
        className="select-none flex flex-cntr-all h-8"
    >
        {children}
    </button>
)

const ControlSection = ({ onHideOverlayAndControls, onRotate, handleFullScreenToggle, overlayAndControlsHidden, currentTime, duration, }: Props) => {

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [currentTimeState, toggleCurrentTimeState] = useState(true);

    if (overlayAndControlsHidden) return (
        <section className="absolute bottom-0 right-0 mr-4 mb-4 z-[2]">
            <button onClick={onHideOverlayAndControls}>☰</button>
        </section>
    )

    return (
        <section className="absolute bottom-0 right-0 mr-4 mb-4 z-[2]">
            <div className={`${drawerOpen ? "h-fit overflow-y-auto" : "h-8 overflow-hidden"} transition-[height] max-h-full flex flex-col justify-end gap-2`}>
                <DrawerButtons onClick={onHideOverlayAndControls}>🚫</DrawerButtons>
                <DrawerButtons onClick={onRotate}>🔄</DrawerButtons>

                <DrawerButtons onClick={() => setDrawerOpen(!drawerOpen)}>{drawerOpen ? "🔽" : "🔼"}</DrawerButtons>
            </div>

            <button className="py-2 my-2 text-sm select-none" onClick={() => toggleCurrentTimeState(!currentTimeState)}>
                {
                    currentTime === 0 ? formatTime(duration) :
                        currentTimeState ? formatTime(currentTime) :
                            formatTime(duration - currentTime)
                }
            </button>
        </section>
    )
}

export default ControlSection;