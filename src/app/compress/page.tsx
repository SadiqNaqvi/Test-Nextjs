"use client";

import { objectToFormData } from "@lib/utils";
import { ChangeEventHandler, useState } from "react";

// tf.enableProdMode()

// let model: nsfwjs.NSFWJS;

// async function loadModel() {
//     if (model) return true;
//     try {
//         model = await nsfwjs.load(
//             "https://raw.githubusercontent.com/infinitered/nsfwjs/refs/heads/master/models/mobilenet_v2/"
//         );
//         console.log("Model Loaded successfully");
//         return true;
//     } catch (error: any) {
//         console.log(error);
//         return false;
//     }
// }

// const predict = async (file: File, guesses = 5) => {

//     if (!model)
//         throw new Error("Model is not loaded yet.")

//     const url = URL.createObjectURL(file);
//     let element: HTMLImageElement | HTMLVideoElement | null = null;

//     if (file.type.startsWith("image/")) {
//         element = document.createElement("img");
//     } else if (file.type.startsWith("video/")) {
//         element = document.createElement("img");
//     }

//     if (!element)
//         throw new Error("Invalid type! Only image or Video is allowed.")

//     element.height = 400;
//     element.width = 400;
//     element.src = url;

//     try {
//         return await new Promise<nsfwjs.predictionType[]>((res) => {
//             element.onload = async () => {
//                 if (!model) throw new Error("Model is not defined")
//                 const results = await model.classify(element, guesses);
//                 URL.revokeObjectURL(url);
//                 res(results);
//             };
//         });
//     } catch (error) {
//         console.error(error);
//         URL.revokeObjectURL(url);
//         throw error;
//     }
// }

// async function isNSFW(file: File) {
//     if (!model) return setMessage("Model is not loaded yet.")
//     try {
//         const predictions = await predict(file, 3);

//         let nsfw = false;

//         for (const prediction of predictions) {
//             if ((prediction.className === "Porn" || prediction.className === "Sexy" || prediction.className === "Hentai") && prediction.probability > 0.4) {
//                 nsfw = true;
//                 break;
//             }
//         }

//         return nsfw;

//     } catch (error) {
//         console.error(error);
//         return false;
//     }
// }

export const scaleImage = async (file: File): Promise<Blob> => {
    if (!file) throw new Error("No file is provided");
    else if (!file.type.startsWith("image/")) throw new Error("Provided file is not a valid image");

    const reader = new FileReader();
    reader.readAsDataURL(file);

    return await new Promise<Blob>(
        (resolve) =>
        (reader.onloadend = () => {

            const image = new Image();
            image.src = reader.result as string;

            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                const context = canvas.getContext("2d")!;

                context.drawImage(image, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) throw new Error("No blob is found!")
                    resolve(blob)
                }, `image/webp`);
            };
        })
    )
};

type IOFile = {
    src: string,
    size: string,
    type: string,
}

const oneKb = 1024
const oneMb = oneKb * oneKb;

const showSize = (size: number): string => {
    let newSize = size
    let unit = "B";

    if (size > oneMb) {
        size = size / oneMb;
        unit = "MB"
    } else if (size > oneKb) {
        size = size / oneKb;
        unit = "KB"
    }

    const [int, frac] = size.toString().split(".");
    return [int].concat([frac.slice(0, 2)]).join('.').concat(` ${unit}`)
}

const ImageCompressor = () => {

    const [message, setMessage] = useState("Please select an image to compress.")
    const [inputFile, setInputFile] = useState<IOFile | undefined>();
    const [outputFile, setOutputFile] = useState<IOFile | undefined>();

    const handleChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
        const file: File | undefined = e.target.files?.[0];
        if (!file) return;
        else if (!file.type.startsWith("image/")) return setMessage("Invalid Image. Please try again.");
        else if (file.size > oneMb * 10) return setMessage("File is too large! Please try again");

        setMessage("Loading...")

        setInputFile({
            src: URL.createObjectURL(new Blob([file], { type: file.type })),
            size: showSize(file.size),
            type: file.type,
        });

        setMessage("Compressing");

        scaleImage(file).then(blob => {

            setOutputFile({
                src: URL.createObjectURL(blob),
                size: showSize(blob.size),
                type: blob.type,
            });

        })
            .catch((er: any) => setMessage(er.message))
            .finally(() => setMessage("Complete"))
    }

    if (inputFile) return (
        <>
            <section className="flex flex-col md:flex-row gap-8">
                <div className="space-y-4">
                    <img
                        height={300}
                        width={300}
                        src={inputFile.src}
                        className="size-[300px] object-contain"

                    />
                    <p>Type: {inputFile.type}</p>
                    <p>Size: {inputFile.size}</p>
                </div>

                {outputFile ? (
                    <div className="space-y-4">
                        <img
                            height={300}
                            width={300}
                            src={outputFile.src}
                            className="size-[300px] object-contain"

                        />
                        <p>Type: {outputFile.type}</p>
                        <p>Size: {outputFile.size}</p>
                    </div>
                ) : (
                    <div className="size-[300px] animate-pulse bg-gray-500"></div>
                )}

            </section>

            <p className="mt-6">{message}</p>

        </>
    )

    return (
        <>
            <div className="relative">
                <input
                    className="absolute inset-0 opacity-0 z-[1]"
                    type="file"
                    accept="image/*"
                    onChange={handleChange} />
                <button className="mt-4 p-2 rounded-md bg-zinc-100 text-zinc-950">Upload</button>
            </div>
            <p className="mt-6">{message}</p>
        </>
    )

}

const VideoCompressor = () => {

    const [message, setMessage] = useState("Please select an video to compress.")
    const [inputFile, setInputFile] = useState<IOFile | undefined>();
    const [outputFile, setOutputFile] = useState<IOFile | undefined>();

    const handleChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
        const file: File | undefined = e.target.files?.[0];
        if (!file) return;
        else if (!file.type.startsWith("video/")) return setMessage("Invalid video. Please try again.");
        else if (file.size > oneMb * 100) return setMessage("File is too large! Please try again");

        setMessage("Loading...")

        setInputFile({
            src: URL.createObjectURL(new Blob([file], { type: file.type })),
            size: showSize(file.size),
            type: file.type,
        });

        setMessage("Compressing");

        fetch('/api/compress', {
            method: "POST",
            body: objectToFormData({ files: [file] }),
        }).then(r => r.blob())
            .then(blob => {
                setOutputFile({
                    size: showSize(blob.size),
                    type: blob.type,
                    src: URL.createObjectURL(blob),
                });
                setMessage("Completed")
            })
            .catch(e => setMessage(e.message));

    }

    if (inputFile) return (
        <>
            <section className="flex flex-col md:flex-row gap-8">
                <div className="space-y-4">
                    <video
                        controls
                        height={300}
                        width={300}
                        src={inputFile.src}
                        className="size-[300px] object-contain"

                    />
                    <p>Type: {inputFile.type}</p>
                    <p>Size: {inputFile.size}</p>
                </div>

                {outputFile ? (
                    <div className="space-y-4">
                        <video
                            controls
                            height={300}
                            width={300}
                            src={outputFile.src}
                            className="size-[300px] object-contain"

                        />
                        <p>Type: {outputFile.type}</p>
                        <p>Size: {outputFile.size}</p>
                    </div>
                ) : (
                    <div className="size-[300px] animate-pulse bg-gray-500"></div>
                )}

            </section>

            <p className="mt-6">{message}</p>

        </>
    )

    return (
        <>
            <div className="relative">
                <input
                    className="absolute inset-0 opacity-0 z-[1]"
                    type="file"
                    accept="video/*"
                    onChange={handleChange} />
                <button className="mt-4 p-2 rounded-md bg-zinc-100 text-zinc-950">Upload</button>
            </div>
            <p className="mt-6">{message}</p>
        </>
    )

}

const CompressPage = () => {

    const [type, setType] = useState<"image" | "video" | "none">("none")

    if (type === "image") return (
        <main className="size-screen flex flex-col flex-cntr-all">
            <ImageCompressor />
        </main>
    )

    else if (type === "video") return (
        <main className="size-screen flex flex-col flex-cntr-all">
            <VideoCompressor />
        </main>
    )

    return (
        <main className="size-screen flex flex-col flex-cntr-all">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold">Welcome to File Compressor</h1>
                <p className="mt-2 text-sm text-center">Please choose file type</p>
            </div>
            <div className="flex gap-4">
                <button className="p-2 rounded-md bg-zinc-100 text-zinc-950" onClick={() => setType("image")}>Image</button>
                <button className="p-2 rounded-md bg-zinc-100 text-zinc-950" onClick={() => setType("video")}>Video</button>
            </div>
        </main>
    )

}

export default CompressPage;