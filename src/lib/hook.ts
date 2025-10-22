"use client";

import { useState } from "react"

export const useQuery = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [response, setResponse] = useState<any>(null)

    const startQuery = (url: string) => {
        setLoading(true);

        fetch(url, { next: { revalidate: 0 } })
            .then(async r => {
                const type = r.headers.get("Content-Type");
                console.log(type);
                if (type?.includes("application/json"))
                    return r.json();
                if (type?.includes("text/plain"))
                    return r.text();
                else return r.blob().then(b => URL.createObjectURL(b));
            })
            .then(setResponse)
            .catch((e: any) => setError(e.message))
            .finally(() => setLoading(false))

    }

    return {
        loading, error, response,
        startQuery,
    }

}