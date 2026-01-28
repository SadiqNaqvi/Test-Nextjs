import React, { useRef, useState } from "react";
import { useGlobalOptions } from "./helpers";

const twoDigit = (num: number) => num.toString().padStart(2, "0");

const formatTime = (seconds: number): string => {
    console.log(seconds);
    if (seconds < 0 || !Number.isFinite(seconds)) {
        return `00:00`;
        // throw new Error("Invalid duration");
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

const InteractiveProgressBar = () => {
    const { setProgress, progress, duration, videoRef } = useGlobalOptions();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [previewTime, setPreviewTime] = useState<number | null>(null);

    const updateVideoTime = () => {
        const vid = videoRef.current;
        if (!vid || !previewTime) return;

        vid.currentTime = previewTime;
        setProgress(previewTime)
    }

    const handleMouseDown = () => {
        setPreviewTime(progress);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPreviewTime(parseFloat(e.target.value));
    };

    const handleMouseUp = () => {
        updateVideoTime(); // only commit once user releases
        setPreviewTime(null)
    };

    const displayTime = ((previewTime || progress || 0) / (duration || 1)) * 100;

    return (
        <div className="flex flex-cntr-between gap-4">
            <span className="text-sm">{formatTime(previewTime || progress || 0)}</span>
            <div className="progress-bar-container">
                <input
                    ref={inputRef}
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.01}
                    value={previewTime || progress || 0}
                    onMouseDown={handleMouseDown}
                    onChange={handleChange}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={updateVideoTime}
                    className="progress-bar"
                    style={{
                        background: `linear-gradient(to right, #f8f8ff ${displayTime}%, #444 0%)`,
                    }}
                />
            </div>
            <span className="text-sm">{formatTime(duration || 0)}</span>
        </div>
    );
};

export default InteractiveProgressBar;
