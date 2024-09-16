'use client';

import { useEffect, useState } from "react"

export default function SearchPage() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        console.log(process.env.NEXT_PUBLIC_APIKEY);
        fetch('https://testlalaapp.vercel.app/api/collection')
            .then((res) => res.json())
            .then(json => console.log(json))
            .catch(err => console.error(err.message));
    }, [])

    const shareData = () => {
        const data = {
            title, text, url: "https://mytechbook.web.app"
        }
        if (navigator.canShare && navigator.canShare(data))
            navigator.share(data);
        else
            setError("Navigator.canShare is not defined");
    }

    return <div id="sharePage">
        <input type="text" value={title} placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
        <input type="text" value={text} placeholder="Text" onChange={(e) => setText(e.target.value)} />
        <button onClick={shareData}>Share</button>
        <p>{error}</p>
    </div>
}