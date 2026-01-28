import React, { forwardRef, Ref } from "react";

type Props = {
    src: string;
    onPlay: React.ReactEventHandler<HTMLVideoElement>,
    onPause: React.ReactEventHandler<HTMLVideoElement>,
    onLoadedMetadata: () => void;
}

const VideoElement = forwardRef(({ src, onPlay, onPause, onLoadedMetadata }: Props, ref: Ref<HTMLVideoElement>) => (
    <video
        onLoadedMetadata={onLoadedMetadata}
        onStalled={() => console.log("Stalled Data")}
        onError={() => console.log('Error')}
        ref={ref}
        src={"/input.mp4"}
        // src={src}
        className="size-full z-[0] object-contain"
        preload="metadata"
        onPlay={onPlay}
        onPause={onPause}
    />
));

VideoElement.displayName = "VideoElement";

export default VideoElement;