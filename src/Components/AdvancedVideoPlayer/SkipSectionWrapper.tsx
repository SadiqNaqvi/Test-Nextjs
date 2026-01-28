"use client";

import { useEffect } from "react";
import { useGlobalOptions } from "./helpers";

type SkipSectionsWrapperProps = {
    skipInterval?: number;
}

const SkipSectionsWrapper = ({ skipInterval = 5 }: SkipSectionsWrapperProps) => {

    const { jumpBackward, jumpForward, togglePlayState, fullScreen, buffering } = useGlobalOptions();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const { code } = e;

            if (!(code === "Space" || code === "ArrowRight" || code === "ArrowLeft") || !fullScreen) return;
            e.preventDefault();

            if (code === "Space") togglePlayState();
            else if (code === "ArrowLeft") jumpBackward(skipInterval);
            else if (code === "ArrowRight") jumpForward(skipInterval);
        }

        if (fullScreen) {
            document.addEventListener("keyup", handleKeyPress);
        }
        else {
            document.removeEventListener("keyup", handleKeyPress);
        }

        return () => {
            document.removeEventListener("keyup", handleKeyPress);
        }
    }, [fullScreen, togglePlayState, jumpBackward, jumpForward]);

    return (
        <>
            <div className="flex-1 h-full flex flex-cntr-all select-none" onDoubleClick={() => jumpBackward(skipInterval)}>
            </div>

            <div className="flex-1 h-full flex flex-cntr-all select-none" onDoubleClick={togglePlayState}>
                <div className="size-12 relative">

                    {/* Buffering spinner */}
                    <div className={`absolute rounded-full inset-0 border-2 border-b-transparent z-[2] transition-colors ${buffering ? "border-white animate-spin" : "border-transparent"} `}></div>
                </div>
            </div>

            <div className="flex-1 h-full flex flex-cntr-all select-none" onDoubleClick={() => jumpForward(skipInterval)}>
            </div>
        </>
    )

}

export default SkipSectionsWrapper;