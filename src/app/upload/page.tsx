"use client";

import { objectToFormData } from "@lib/utils";
import { useState } from "react";

const UploadPage = () => {

    const [src, setSrc] = useState('');

    const upload = async (e: any) => {
        const files: File[] = e.target.files;
        const formData = objectToFormData({ files: Array.from(files) });
        console.log(formData?.get("files"));
        const resp = await fetch('/api/media', { method: "POST", body: formData }).then(r => r.json());
        if ("data" in resp) {
            console.log(resp.data);
        } else console.log(resp);
    }

    return (
        <main className="size-screen flex flex-cntr-all">
            <section>
                <input type="file" multiple onChange={upload} />
                <button className="mt-4 p-2 bg-zinc-100 text-zinc-950">Upload</button>
            </section>
            <img
                src="https://image.tmdb.org/t/p/original/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg"
                width={250} height={250} />
            {/* {src && (
            <img src={`/api/proxy?url=${src}`} width={250} height={250} />
            )} */}
        </main>
    )
}


export default UploadPage;
/*{
    "data": {
        "id": "P9GaFnkq",
        "filename": "“Alone, they are powerful. Together, they are inevitable.”.🚨 Download link in BIO 🚨.@ghibligli.jpg",
        "type": "jpg",
        "url": "https://ranoz.gg/file/P9GaFnkq",
        "upload_url": "https://st1.66480a2a15b8f3056357ba108b14d3a4.r2.cloudflarestorage.com/P9GaFnkq-%E2%80%9CAlone%2C%20they%20are%20powerful.%20Together%2C%20they%20are%20inevitable.%E2%80%9D.%F0%9F%9A%A8%20Download%20link%20in%20BIO%20%F0%9F%9A%A8.%40ghibligli.jpg",
        "upload_state": "pending"
    }
}
    */