import { TypedFunction } from "@type/general";
import { RefObject, useEffect, useImperativeHandle, useState } from "react";
import { handleScreenshot, requestPiP, useGlobalOptions } from "./helpers";
import { CameraIcon, CheckBoxIcon, CheckedBoxIcon, LeftChevronIcon, LockIcon, PiPIcon, SpeedRateIcon, XmarkIcon } from "./PlayerIcons";

export type SheetRefType = {
    open: () => void,
    close: () => void,
    toggle: () => void,
}

const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]

const SheetOptionList = ({ label, onClick, rightIcon }: { label: React.ReactNode, rightIcon?: React.ReactNode, onClick?: TypedFunction }) => {
    return (
        <li className="w-full" key={Math.random()}>
            <button onClick={onClick} className="w-full flex flex-cntr-between py-2 my-1">
                <span>{label}</span>
                <span>{rightIcon}</span>
            </button>
        </li>
    )
}

const SpeedRateSection = ({ onBack, currentPlaybackRate, changeSpeed }: { onBack: TypedFunction, currentPlaybackRate: number, changeSpeed: TypedFunction<number> }) => (
    <>
        <div className="mb-2 py-2 border-b border-zinc-900 flex gap-3">
            <button onClick={onBack}>
                <LeftChevronIcon />
            </button>
            <h4 className="text-lg">Playback Speed</h4>
        </div>
        <ul>
            {speedOptions.map(speed => (
                <SheetOptionList
                    key={speed}
                    label={speed}
                    rightIcon={currentPlaybackRate === speed ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                    onClick={() => changeSpeed(speed)}
                />
            ))}

        </ul>
    </>

)

const Sections = ({ close }: { close: TypedFunction }) => {
    const [section, setSection] = useState<"sheet" | "playback">("sheet");
    const { videoRef, setScreenLock, fullScreen, playbackRate, setPlaybackRate } = useGlobalOptions();

    useEffect(() => {
        if (!fullScreen) close();
    }, [fullScreen])
    
    if (!videoRef.current) return;

    const handleClick = (action: "screenshot" | "lock" | "speed" | "pip") => {

        if (action === "speed") {
            setSection("playback");
            return;
        }
        else if (action === "lock")
            setScreenLock(true);
        else if (action === "pip")
            requestPiP(videoRef);
        else if (action === "screenshot")
            handleScreenshot(videoRef);

        close();

    }

    const sheetOptions = [
        { label: "Screenshot", icon: <CameraIcon size="size-5" />, onClick: () => handleClick("screenshot"), hasNesting: false },
        { label: "Lock Screen", icon: <LockIcon size="size-5" />, onClick: () => handleClick("lock"), hasNesting: false },
        { label: "Adjust Speed", icon: <SpeedRateIcon size="size-5" />, onClick: () => handleClick("speed"), hasNesting: true },
        { label: "Picture in Picture", icon: <PiPIcon size="size-5" />, onClick: () => handleClick("pip"), hasNesting: false },
    ]

    const back = () => setSection("sheet");

    if (section === "playback") return (
        <section>
            <SpeedRateSection
                currentPlaybackRate={playbackRate}
                changeSpeed={setPlaybackRate}
                onBack={back}
            />
        </section>
    )

    else return (
        <section>
            <div className="mb-2 py-2 border-b border-zinc-900 flex flex-cntr-between">
                <h4 className="text-lg">Setting</h4>
                <button onClick={close}>
                    <XmarkIcon />
                </button>
            </div>
            <ul>
                {sheetOptions.map(({ label, onClick, icon, hasNesting }) => (
                    <SheetOptionList
                        key={label}
                        label={(
                            <div className="flex gap-2">
                                <span>{icon}</span>
                                <span>{label}</span>
                            </div>
                        )}
                        onClick={onClick}
                        rightIcon={hasNesting ? <LeftChevronIcon className="rotate-180" /> : ''}
                    />
                ))}
            </ul>
        </section>
    )

}

const SettingSheet = ({ sheetRef }: { sheetRef: RefObject<SheetRefType | null> }) => {

    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {

        const handleOrientationChange = () => {
            console.log(window.screen.orientation.type);
            if (window.screen.orientation.type.includes("landscape"))
                setIsLandscape(true);
            else setIsLandscape(false);
        }

        window.addEventListener("orientationchange", handleOrientationChange);

        handleOrientationChange();

        return () => {
            window.removeEventListener("orientationchange", handleOrientationChange);
        }
    }, [])

    const toggleSheet = () => setSheetOpen(!sheetOpen);

    useImperativeHandle(sheetRef, () => ({
        close: () => setSheetOpen(false),
        open: () => setSheetOpen(true),
        toggle: toggleSheet,
    }));

    if (sheetOpen)
        return (
            <aside className={`absolute inset-0 z-[4] p-2 flex ${isLandscape ? "flex-row" : "flex-col"} backdrop-brightness-75`}>
                <div className="flex-1" onClick={toggleSheet}></div>
                <div className={`bg-zinc-950 p-2 max-h-full overflow-y-auto transition-[height] duration-200 rounded-md ${isLandscape ? "h-full w-80 translate-from-left" : "h-fit w-full translate-from-bottom"}`}>
                    <Sections close={() => setSheetOpen(false)} />
                </div>
            </aside>
        )

}

export default SettingSheet;
