'use client';

import { useState } from "react"

export default function SearchPage() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [error, setError] = useState('');

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