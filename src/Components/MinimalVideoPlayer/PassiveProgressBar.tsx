import React from "react";

type Props = {
    progress: number,
    duration: number,
}

const PassiveProgressBar = ({ progress, duration }: Props) => {
    // console.log(progress);
    // console.log(duration);

    return (
        <div className="absolute bottom-0 bg-zinc-500 w-full h-[3px] z-[3]" >
            <div
                className="h-full bg-red-500 transition-[width]"
                style={{ width: `${(progress / duration) * 100}%` }}
            ></div>
        </div>
    )
}

export default PassiveProgressBar;