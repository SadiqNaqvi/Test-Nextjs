"use client";

import AdvanceVideoPlayer from "@Components/AdvanceVideoPlayer/VideoPlayer";
import FancyVideoPlayer from "@Components/MinimalVideoPlayer/VideoPlayer";

import SmartVideoPlayer from "@Components/SmartVideoPlayer";
import { objectToFormData } from "@lib/utils";
import { useState } from "react";

const OldUploadPage = () => {

    const [response, setResponse] = useState("Please choose a file to upload");

    const upload = async (e: any) => {
        const files: File[] = e.target.files;
        const formData = objectToFormData({ files: Array.from(files) });

        setResponse("Loading...")

        await fetch('https://testlalaapp.vercel.app/api/media', {
            method: "POST",
            body: formData,
            headers: {
                authorization: "Bearer 1974d96b965bb9d2c481bfee627017403c7b28fa5d87c1376e8c0101d207c8db"
            }
        }).then(r => r.text()).then(setResponse)
            .catch(e => setResponse(e.message));
    }

    return (
        <main className="size-screen flex flex-col flex-cntr-all">
            <div className="relative">
                <input type="file" className="absolute inset-0 opacity-0 z-[1]" multiple onChange={upload} />
                <button className="mt-4 p-2 rounded-md bg-zinc-100 text-zinc-950">Upload</button>
            </div>
            <p className="mt-4">{response}</p>
        </main>
    )
}

const UploadSection = () => {

    const [response, setResponse] = useState("Please choose a file to upload");

    const upload = async (e: any) => {
        const files: File[] = e.target.files;
        const formData = objectToFormData({ files: Array.from(files) });
        setResponse("Loading...")
        fetch('/api/media', {
            method: "POST",
            body: formData,
            headers: {
                authorization: "Bearer 1974d96b965bb9d2c481bfee627017403c7b28fa5d87c1376e8c0101d207c8db"
            }
        }).then(r => r.text()).then(setResponse)
            .catch(e => setResponse(e.message));
    }

    return (
        <main className="size-screen flex flex-col flex-cntr-all">
            <div className="relative">
                <input className="absolute inset-0 opacity-0 z-[1]" type="file" multiple onChange={upload} />
                <button className="mt-4 p-2 rounded-md bg-zinc-100 text-zinc-950">Upload</button>
            </div>
            <p className="mt-6">{response}</p>
        </main>
    )

}

const FetchSection = () => {
    const [response, setResponse] = useState<string | { src: string, type: "image" | "video" }>("Please enter key to fetch media");

    const fetchMedia = (data: FormData) => {
        const key = data.get("key")?.toString();
        if (!key || key.length < 10) return setResponse("Invalid key");

        setResponse("Loading...");
        fetch(`/api/media/${key}`, {
            method: "GET",
            headers: {
                authorization: "Bearer 1974d96b965bb9d2c481bfee627017403c7b28fa5d87c1376e8c0101d207c8db"
            }
        }).then(r => r.blob()).then(blob => {
            console.log(blob);
            const src = URL.createObjectURL(blob);
            const type = blob.type.split('/')[0]
            if (type === "image" || type === "video")
                setResponse({ src, type })
            else setResponse("Response type is neither image nor video")
        })
    }

    const FormHeader = () => (
        <form action={fetchMedia} className="flex gap-4 mx-auto mt-4 px-4">

            <input name="key" className="p-2 rounded-md border-2 border-gray-500 w-full" />

            <button type="submit" className="px-4 py-2 rounded-md bg-zinc-100 text-black">Test</button>

        </form>
    )

    if (typeof response === "string") return (
        <section>
            <FormHeader />
            <p className="mt-4">{response}</p>
        </section>
    )

    else if (response.type === "image") return (
        <section>
            <FormHeader />
            <div className="mt-4">
                <img
                    height={500}
                    width={500}
                    src={response.src}
                    className="size-[500px] object-contain"
                />
            </div>
        </section>
    )

    else if (response.type === "video") return (
        <section>
            <FormHeader />
            <div className="mt-4">
                <video
                    height={500}
                    width={500}
                    src={response.src}
                    className="size-[500px] object-contain"
                />
            </div>
        </section>
    )

}

const UploadPage = () => {

    const [section, setSection] = useState<"old" | "upload" | "fetch" | "index">("index");

    if (section === "old") return <OldUploadPage />

    else if (section === "upload") return <UploadSection />

    else if (section === "fetch") return <FetchSection />

    return (
        <main className="size-screen flex flex-cntr-all gap-4">
            <div className="h-full w-full">
                <AdvanceVideoPlayer
                    src="http://localhost:3000/api/media/CI0CSYYY-Z6qp27Os_10ODPxPteIiwiFlBLgNKO6TssjIyvi8s-E"
                />
            </div>
            {/* <video
                controls
                // onLoad={ }
                height={400}
                width={400}
                preload="none"
                src="http://localhost:3000/api/media/CI0CSYYY-Z6qp27Os_10ODPxPteIiwiFlBLgNKO6TssjIyvi8s-E"></video> */}
        </main>
    )

    // return (
    //     <main className="size-screen flex flex-cntr-all gap-4">
    //         <button className="p-2 rounded-md bg-zinc-100 text-zinc-950" onClick={() => setSection("old")}>Old Upload</button>
    //         <button className="p-2 rounded-md bg-zinc-100 text-zinc-950" onClick={() => setSection("upload")}>New Uplaod</button>
    //         <button className="p-2 rounded-md bg-zinc-100 text-zinc-950" onClick={() => setSection("fetch")}>Fetch</button>
    //     </main>
    // )


}


export default UploadPage;