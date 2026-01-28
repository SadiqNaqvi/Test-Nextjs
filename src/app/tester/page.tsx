"use client";

import { useQuery } from "@lib/hook";
import { useState } from "react";
import { isCorrectURL } from "@lib/utils"
import JsonViewer from "@Components/JsonViewer";

import React from 'react';

const ResponseSection = ({ error, loading, response }: { error: string, loading: boolean, response: any }) => {

    if (loading) return (
        <section className="mt-4">
            <p className="text-center">Loading, Please wait...</p>
        </section>
    )

    else if (error) return (
        <section className="mt-4 text-center">
            <h4 className="text-lg font-semibold mb-4">Oops! Some Error Occured</h4>
            <p>{error}</p>
        </section>

    )

    else if (!response) return (
        <section className="mt-4">
            <p className="text-center">Enter URL to test</p>
        </section>
    )

    return (
        <section className="mt-4">
            <JsonViewer json={response} />
        </section>
    )
}

const ApiTesterPage = () => {

    // const [paramsBlock, setParamsBlock] = useState(1);

    const { error, loading, response, startQuery, } = useQuery();

    const fetchResponse = (data: FormData) => {
        const url = data.get("url")?.toString();
        if (!url || url.length < 10) return;

        else if (!isCorrectURL(url, true)) return;

        const target = encodeURIComponent(url);

        startQuery(`https://testlalaapp.vercel.app/api/proxy?url=${target}`);
    }

    return (
        <>
            <form action={fetchResponse} className="flex gap-4 mx-auto mt-4 px-4">

                <input name="url" className="p-2 rounded-md border-2 border-gray-500 w-full" />

                <button type="submit" className="px-4 py-2 rounded-md bg-zinc-100 text-black">Test</button>

            </form>

            <ResponseSection error={error} loading={loading} response={response} />
        </>
    )


}

export default ApiTesterPage;
