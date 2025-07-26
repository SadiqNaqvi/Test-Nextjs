"use client";

import { useState } from "react";

const Page = () => {

    // const [loading, setLoading] = useState(false);
    // const [content, setContent] = useState('');
    // const [error, setError] = useState();
    const [src, setSrc] = useState('');

    const scrapeWeb = async (data: FormData) => {
        // setLoading(() => true);
        const urlParam = data.get("url")?.toString();
        if (!urlParam) return;
        const urlObj = new URL(urlParam);
        setSrc(urlObj.href);

        // fetch(`/api/scrapping?url=${url}`, { cache: "no-store" })
        //     .then(async (res) => {
        //         const { status } = res;
        //         const resp = await res.text()
        //         if (status !== 200) throw new Error(resp);
        //         else return resp;
        //     }).then(res => {
        //         setContent(res);
        //         setError(undefined);
        //     }).catch(err => setError(err.message))
        //     .finally(() => setLoading(() => false));
    }

    const ContentBox = () => {
        // if (loading) return <p>Loading... Please wait</p>
        // else if (error) return <p>{error}</p>
        if (!src) return <p>Enter a url to continue</p>
        else return <iframe
            onLoadStart={(a) => console.log("Loading start", a)}
            onLoadedData={(a) => console.log("data found", a)}
            onError={(a) => console.log("Error", a)}
            src={`/api/scrapping?url=${encodeURIComponent(src)}`}
            className="size-full"
            sandbox="allow-scripts allow-forms allow-same-origin"
        />
    }

    return (
        <main className="max-w-screen-sm w-full mx-auto h-screen">
            <form action={scrapeWeb} id="urlToScrapeForm">
                <input
                    className="max-w-full w-full"
                    type="search" name="url" min={15} />
            </form>
            <section className="size-full max-w-full p-4 m-2 border border-zinc-500 rounded-md">
                <ContentBox />
            </section>
        </main>
    )
}

export default Page;