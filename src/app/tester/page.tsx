"use client";

import { useState } from "react";

import React from 'react';

type JsonViewerProps = {
    json: any;
};

const getValueColor = (value: any): string => {
    if (typeof value === 'string') return '#ce9178';   // string: reddish
    if (typeof value === 'number') return '#b5cea8';   // number: greenish
    if (typeof value === 'boolean') return '#569cd6';  // boolean: blue
    if (value === null) return '#569cd6';              // null: same as boolean
    return '#d4d4d4';                                // default: gray
};

const JsonViewer = ({ json }: JsonViewerProps) => {
    // Function to determine the type of the field and return appropriate JSX
    const renderJson = (data: any, key?: string) => {
        const dataType = typeof data;

        // If the data is an object or array, handle open/close functionality using details/summary
        if (data && (dataType === 'object' || Array.isArray(data))) {
            const isArray = Array.isArray(data);
            const isObject = dataType === 'object' && !isArray;
            const count = isArray ? data.length : Object.keys(data).length;

            return (
                <div style={{ marginLeft: '20px', marginBlock: "8px" }}>
                    <details>
                        <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                            {key && <span style={{ color: '#9cdcfe' }}>{key}</span>}
                            <span style={{ color: '#dcdcaa' }}>
                                : {isObject ? `Object (${count} keys)` : `Array (${count} elements)`}
                            </span>
                        </summary>
                        <div style={{ marginLeft: '20px', borderLeft: "1px solid gray" }}>
                            {isArray &&
                                data.map((item, index) => (
                                    <div key={index}>{renderJson(item, index.toString())}</div>
                                ))}
                            {isObject &&
                                Object.keys(data).map((objKey) => (
                                    <div key={objKey}>{renderJson(data[objKey], objKey)}</div>
                                ))}
                        </div>
                    </details>
                </div>
            );
        }

        // Otherwise, it's a simple primitive value
        return (
            <div style={{ marginLeft: '20px' }}>
                {key && <span style={{ color: '#9cdcfe' }}>{key}</span>}
                <span style={{ color: '#d4d4d4' }}>
                    :{' '}
                    <span style={{ color: getValueColor(data) }}>
                        {JSON.stringify(data)}
                    </span>{' '}
                    <span style={{ color: 'gray' }}>({dataType})</span>
                </span>
            </div>
        );
    };

    return <div>{renderJson(json)}</div>;
};

const ApiTesterPage = () => {

    const [response, setResponse] = useState<any>();

    const fetchResponse = (data: FormData) => {
        const url = data.get("url")?.toString();

        if (!url || url.length < 10) return;

        fetch(url)
            .then(r => r.json())
            .then(setResponse)
            .catch((e: any) => setResponse(`Error: ${e.message}`))
    }

    return (
        <>
            <form action={fetchResponse} className="max-w-sm flex gap-4 flex-col mx-auto mt-32">

                <input name="url" className="p-2 rounded-md border-2 border-gray-500 w-full" />

                <button type="submit" className="px-4 py-2 rounded-md bg-zinc-100 text-black">Test</button>

            </form>
            {response && (
                <JsonViewer json={response} />
            )}
        </>
    )


}

export default ApiTesterPage;