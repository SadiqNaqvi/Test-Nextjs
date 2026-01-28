import { useEffect, useRef, useState } from "react";
// import ControlButton from "./ControlButton";

type Funcs = () => void;

type Props = {
    playing: boolean;
    overlayAndControlsHidden: boolean;
    buffering: boolean,
    onPlayPause: Funcs;
    onBackward: (interval: number) => void,
    onForward: (interval: number) => void,
}

const OverlaySection = ({ playing, buffering, onPlayPause, overlayAndControlsHidden, onBackward, onForward, }: Props) => {

    const backwardIntervalTimeout = useRef<NodeJS.Timeout>(undefined);
    const forwardIntervalTimeout = useRef<NodeJS.Timeout>(undefined);
    const [forwardInterval, setForwardInterval] = useState(0);
    const [backwardInterval, setBackwardInterval] = useState(0);

    const handleBackward = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setBackwardInterval(prev => {
            const newValue = prev + 5;
            clearTimeout(backwardIntervalTimeout.current);

            forwardIntervalTimeout.current = setTimeout(() => {
                onBackward(newValue);
                setBackwardInterval(0);
            }, 1000);
            return newValue;
        });
    }

    const handleForward = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setForwardInterval(prev => {
            const newValue = prev + 5;
            clearTimeout(forwardIntervalTimeout.current);

            forwardIntervalTimeout.current = setTimeout(() => {
                onForward(newValue);
                setForwardInterval(0);
            }, 1000);
            return newValue;
        });
    }

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const { code } = e;
            console.log(code);
            if (!(code === "Space" || code === "ArrowRight" || code === "ArrowLeft") || document.fullscreenElement?.id !== "videoPlayer") return;

            if (code === "Space") onPlayPause();
            else if (code === "ArrowLeft") handleBackward(e);
            else if (code === "ArrowRight") handleForward(e);
        }

        document.addEventListener("keyup", handleKeyPress);
        return () => {
            clearTimeout(backwardIntervalTimeout.current);
            clearTimeout(forwardIntervalTimeout.current);

            document.removeEventListener("keyup", handleKeyPress);
        }
    }, []);

    return (
        <section
            className={`absolute flex z-[1] inset-0 ${!(playing || overlayAndControlsHidden) || buffering ? "bg-[rgba(0,0,0,0.6)]" : ''}`}
        >

            <div className="flex-1 h-full flex flex-cntr-all select-none" onDoubleClick={handleBackward}>
                <span className={backwardInterval > 0 ? "fade-in" : "opacity-0"}>{"<< " + backwardInterval}</span>
            </div>

            <div onClick={onPlayPause} className="flex-1 h-full flex flex-cntr-all select-none">
                <div className="size-12 relative">

                    {/* Buffering spinner */}
                    <div className={`absolute rounded-full inset-0 border-2 border-b-transparent z-[2] transition-colors ${buffering ? "border-white animate-spin" : "border-transparent"}`}></div>

                    <div
                        className={`${(playing || overlayAndControlsHidden) ? "fade-out" : "fade-in"} size-full flex flex-cntr-all bg-black rounded-full text-xl`}
                    >⏸</div>
                </div>
            </div>

            <div className="flex-1 h-full flex flex-cntr-all select-none" onDoubleClick={handleForward}>
                <span className={forwardInterval > 0 ? "fade-in" : "opacity-0"}>{">> " + forwardInterval}</span>
            </div>

        </section>
    )
}


export default OverlaySection;