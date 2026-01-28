
import { TypedFunction } from "@type/general";
import { createContext, PropsWithChildren, RefObject, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import {
    PlayIcon,
    PauseIcon,
    MuteIcon,
    VolumeIcon,
    SettingsIcon,
    BackwardIcon,
    ForwardIcon,
    ExpandIcon,
    ShrinkIcon,
    LockIcon,
    UnlockIcon,
    CameraIcon,
    PiPIcon,
    SpeedRateIcon,
    SpeedBoostIcon,
    XmarkIcon,
    LeftChevronIcon,
    CheckBoxIcon,
    CheckedBoxIcon,
} from "./PlayerIcons";

export const displayMessageIconsMap = {
    PlayIcon: PlayIcon,
    PauseIcon: PauseIcon,
    MuteIcon: MuteIcon,
    VolumeIcon: VolumeIcon,
    SettingsIcon: SettingsIcon,
    BackwardIcon: BackwardIcon,
    ForwardIcon: ForwardIcon,
    ExpandIcon: ExpandIcon,
    ShrinkIcon: ShrinkIcon,
    LockIcon: LockIcon,
    UnlockIcon: UnlockIcon,
    CameraIcon: CameraIcon,
    PiPIcon: PiPIcon,
    SpeedRateIcon: SpeedRateIcon,
    SpeedBoostIcon: SpeedBoostIcon,
    XmarkIcon: XmarkIcon,
    LeftChevronIcon: LeftChevronIcon,
    CheckBoxIcon: CheckBoxIcon,
    CheckedBoxIcon: CheckedBoxIcon,
}

type DisplayMessageIcons = keyof typeof displayMessageIconsMap;

type DisplayMessage = { label: string, icon?: DisplayMessageIcons, rightSide?: boolean } | null

interface VideoState {
    playing: boolean;
    buffering: boolean;
    fullScreen: boolean;
    controlsSeen: boolean;
    screenLock: boolean;
    progress: number;
    duration: number;
    message: DisplayMessage;
    playbackRate: number;
}

function reducer<T>(state: T, action: Partial<T>): T {
    // console.log(action);
    // if (!action) return state;
    return { ...state, ...action };
}

export function useVideoReducer<T>(initialValue: T) {
    const [state, dispatch] = useReducer(reducer<T>, initialValue);

    const setter = (value: Partial<T>) => dispatch(value);

    return { ...state, setter };
}

//
// 4️⃣ Initial State
//
const initialState: VideoState = {
    playing: false,
    buffering: false,
    fullScreen: false,
    controlsSeen: false,
    screenLock: false,
    progress: 0,
    duration: 0,
    playbackRate: 1,
    message: null,
};

//
// 5️⃣ Context Type
//
interface VideoOptionsContextType extends VideoState {
    togglePlayState: TypedFunction;
    setPlaying: TypedFunction<boolean>;
    setBuffering: TypedFunction<boolean>;
    toggleControlsSeen: TypedFunction;
    setControlsSeen: TypedFunction<boolean>;
    setScreenLock: TypedFunction<boolean>;
    setProgress: TypedFunction<number>;
    setDuration: TypedFunction<number>;
    setFullScreen: TypedFunction<boolean>;
    toggleFullScreen: TypedFunction;
    jumpForward: TypedFunction<number>;
    jumpBackward: TypedFunction<number>;
    setPlaybackRate: TypedFunction<number>;
    setMessage: TypedFunction<[message: DisplayMessage, hideInSeconds?: number]>;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    videoContainerRef: React.RefObject<HTMLDivElement | null>;
}

//
// 6️⃣ Create Context
//
const VideoOptionsContext = createContext<VideoOptionsContextType | null>(null);

//
// 7️⃣ Provider
//
export const VideoOptionsProvider = ({ children }: PropsWithChildren) => {

    const { setter, ...state } = useVideoReducer(initialState);

    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const messageHideTimeout = useRef<NodeJS.Timeout>(null);
    const controlsHideTimeout = useRef<NodeJS.Timeout>(null);
    const jumpInterval = useRef<number>(0);

    useEffect(() => () => {
        clearTimeout(messageHideTimeout.current ?? undefined)
        clearTimeout(controlsHideTimeout.current ?? undefined)
    }, []);

    const setMessageAndOtherState = (state: Partial<typeof initialState>, hideInSeconds = 1) => {
        clearTimeout(messageHideTimeout.current ?? undefined);
        setter(state);

        // If hide in seconds == inifinty that means we want manual hiding || message === "" that means hiding message
        if (hideInSeconds === Infinity || !state.message) return;

        messageHideTimeout.current = setTimeout(() => {
            setter({ message: null })
            messageHideTimeout.current = null;
        }, hideInSeconds * 1000)

    }

    const setBuffering = (v: boolean) => setter({ buffering: v });

    const hideControlsAfterDelay = (doSet: boolean) => {
        clearTimeout(controlsHideTimeout.current ?? undefined);
        if (doSet && state.playing) {
            controlsHideTimeout.current = setTimeout(() => {
                if (state.playing) setter({ controlsSeen: false });
            }, 5000);
        }
    }

    const setControlsSeen = (v: boolean) => {
        if (state.screenLock) return;
        setter({ controlsSeen: v });
        hideControlsAfterDelay(v);
    }

    const setPlaying = useCallback((v: boolean) => {
        setMessageAndOtherState({
            playing: v,
            message: {
                label: v ? "Playing" : "Paused",
                icon: v ? "PlayIcon" : "PauseIcon"
            }
        });
    }, []);

    const togglePlayState = () => {
        setPlaying(!state.playing);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (state.playing) {
            video.play();
            hideControlsAfterDelay(true);
        }
        else video.pause();
    }, [state.playing]);

    const toggleControlsSeen = () => setControlsSeen(!state.controlsSeen);

    const setScreenLock = (v: boolean) => {
        setMessageAndOtherState({
            screenLock: v,
            message: {
                label: v ? "Locked" : "Unlocked",
                icon: v ? "LockIcon" : "UnlockIcon"
            }
        });
    }

    const setProgress = (v: number) => setter({ progress: v });
    const setDuration = (v: number) => setter({ duration: v });
    const setFullScreen = (v: boolean) => setter({ fullScreen: v });

    const setPlaybackRate = (rate: number) => {
        const vid = videoRef.current;
        if (!vid) return;

        vid.playbackRate = rate;
        setter({ playbackRate: rate })
    }

    const toggleFullScreen = () => {
        const el = videoContainerRef.current;
        if (!el) return;

        if (!document.fullscreenElement) {
            el.requestFullscreen();
            // setter({ fullScreen: true });
        } else {
            document.exitFullscreen();
            // setter({ fullScreen: false });
        };
    };

    const setMessage = (m: DisplayMessage, hideInSeconds?: number) =>
        setMessageAndOtherState({ message: m }, hideInSeconds)

    const jump = (interval: number) => {
        const v = videoRef.current;
        if (!v) return;

        // accumulate total interval before the timeout fires
        jumpInterval.current += interval;
        let jumped = jumpInterval.current;

        // clear any pending timeout so we wait for more taps
        if (messageHideTimeout.current) {
            clearTimeout(messageHideTimeout.current);
        }

        // show cumulative jump message right away
        const seconds = Math.abs(jumped);
        setter({
            message: {
                label: String(seconds),
                icon: jumped > 0 ? "ForwardIcon" : "BackwardIcon",
                rightSide: jumped > 0,
            }
        });

        // after a small delay (e.g., 300 ms), actually perform the jump
        messageHideTimeout.current = setTimeout(() => {
            v.currentTime += jumped;   // apply total accumulated jump
            jumpInterval.current = 0;                // reset accumulator
            setter({ message: null });                 // clear message
            messageHideTimeout.current = null;
        }, 500);
    };

    const jumpBackward = (interval: number) => jump(-interval);

    const jumpForward = (interval: number) => jump(interval);

    return (
        <VideoOptionsContext.Provider
            value={{
                ...state,
                togglePlayState,
                setPlaying,
                setBuffering,
                toggleControlsSeen,
                setControlsSeen,
                setScreenLock,
                setProgress,
                setDuration,
                setFullScreen,
                jumpBackward,
                jumpForward,
                toggleFullScreen,
                setMessage,
                setPlaybackRate,
                videoRef,
                videoContainerRef,
            }}
        >
            {children}
        </VideoOptionsContext.Provider>
    );
};

export const useGlobalOptions = () => {
    const context = useContext(VideoOptionsContext);
    if (!context) {
        throw new Error("useGlobalOptions must be used within a VideoOptionsProvider");
    }
    return context
};

export const requestPiP = (videoRef: RefObject<HTMLVideoElement | null>) => {
    const video = videoRef.current;
    if (!video) return;

    if ('requestPictureInPicture' in video) {
        video.requestPictureInPicture()
            .then(() => {
                console.log('Video entered Picture-in-Picture mode.');
            })
            .catch((error) => {
                console.error('Failed to enter Picture-in-Picture mode:', error);
            });
    } else {
        console.error('Picture-in-Picture is not supported in this browser.');
    }
}

export const handleScreenshot = (videoRef: RefObject<HTMLVideoElement | null>) => {
    const video = videoRef.current;
    if (!video) return;

    // Create a canvas with the same video dimensions
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;

    // Draw the current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to image data URL
    const imageUrl = canvas.toDataURL("image/png");

    // Option 1: Download automatically
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "screenshot.png";
    link.click();
};