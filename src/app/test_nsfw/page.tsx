"use client";

import JsonViewer from "@Components/JsonViewer";
import Image from "next/image";
import { useState } from "react";

export default function NsfwTest() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [path, setPath] = useState("");

    const scanAndDetect = async (file: File | Blob) => {
        setPath(URL.createObjectURL(file));
        setLoading(true);

        // const result = response.ok ? await response.json() : await response.text();
        // const client = await Client.connect("Midnightar/nude-detection-2");
        // const result = await client.predict("/predict", {
        //     image: file,
        // });

        setLoading(false);
        setResult(result);
    }

    const fetchAndScan = async (formdata: FormData) => {
        const url = formdata.get("url");
        if (!url || typeof url !== "string") return;

        const target = encodeURIComponent(url);

        setLoading(true);
        const response = await fetch(`https://testlalaapp.vercel.app/api/proxy?url=${target}`);
        const blob = await response.blob();

        await scanAndDetect(blob);

        // const file = new File([blob], "Test file");
        // const fd = new FormData();
        // fd.append("files", file);

        // // Your worker URL:
        // const res = await fetch("/api/test_nsfw", {
        //     method: "POST",
        //     body: fd,
        // });

        // const json = await res.json();
        // setResult(json);
        // setLoading(false);
    }

    async function upload(file: File | null) {
        if (!file) return alert("Select a file first");
        await scanAndDetect(file);
        // setLoading(true);
        // const fd = new FormData();
        // fd.append("files", file);

        // // Your worker URL:
        // const res = await fetch("/api/test_nsfw", {
        //     method: "POST",
        //     body: fd,
        // });

        // const json = await res.json();
        // setResult(json);
        // setLoading(false);
    }

    return (
        <main className="py-8 max-w-md mx-auto">

            {loading && (
                <aside className="fixed inset-0 z-[2] backdrop-brightness-50 flex flex-cntr-all">
                    <div className="size-8 border-4 border-zinc-200 border-b-transparent rounded-full animate-spin"></div>
                </aside>
            )}
            <h1 className="text-center text-2xl">NSFW test</h1>
            <section className="mt-4 flex flex-cntr-all">
                <div className="relative">
                    <input
                        className="absolute inset-0 opacity-0 z-[1]"
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={loading}
                        onChange={(e) => upload(e.target.files?.[0] ?? null)} />
                    <button className="px-4 py-2 rounded-md bg-zinc-100 text-zinc-900" disabled={loading}>
                        Upload & Check
                    </button>
                </div>
            </section>
            <div className="py-8 flex flex-cntr-all px-4 gap-4">
                <div className="flex-1 h-[2px] bg-zinc-500 rounded-xl"></div>
                <span>Or</span>
                <div className="flex-1 h-[2px] bg-zinc-500 rounded-xl"></div>
            </div>
            <section>
                <form action={fetchAndScan}>
                    <input name="url" className="border border-zinc-500 w-full p-3 rounded-md" />
                </form>
            </section>
            <section className="my-4">
                {path && (
                    <Image
                        height={300}
                        width={300}
                        className="size-[300px] object-contain"
                        src={path}
                        alt=""
                    />
                )}
            </section>

            {result && (
                <JsonViewer json={result} />
            )}
        </main>
    );
}

// const join_urls = (...urls: string[]): string => {
//     try {
//         return urls.reduce((base_url: string, part: string) => {
//             base_url = base_url.replace(/\/+$/, "");
//             part = part.replace(/^\/+/, "");
//             return new URL(part, base_url + "/").toString();
//         });
//     } catch (e) {
//         throw new Error("INVALID URL In Join Urls Method");
//     }
// };


// const options = { events: ["data"] }
// const app_reference = ""
// const headers = { "Content-Type": "application/json" }
// let api_prefix: string = ""
// let config: Record<string, any> = {};
// let api_info = {};
// let api_map: Record<string, number> = {};

// function get_description(
//     type: { type: any; description: string },
//     serializer: string
// ): string {
//     if (serializer === "GallerySerializable") {
//         return "array of [file, label] tuples";
//     } else if (serializer === "ListStringSerializable") {
//         return "array of strings";
//     } else if (serializer === "FileSerializable") {
//         return "array of files or single file";
//     }
//     return type?.description;
// }

// function get_type(
//     type: { type: any; description: string },
//     component: string,
//     serializer: string,
//     signature_type: "return" | "parameter"
// ): string | undefined {
//     if (component === "Api") return type.type;
//     switch (type?.type) {
//         case "string":
//             return "string";
//         case "boolean":
//             return "boolean";
//         case "number":
//             return "number";
//     }

//     if (
//         serializer === "JSONSerializable" ||
//         serializer === "StringSerializable"
//     ) {
//         return "any";
//     } else if (serializer === "ListStringSerializable") {
//         return "string[]";
//     } else if (component === "Image") {
//         return signature_type === "parameter" ? "Blob | File | Buffer" : "string";
//     } else if (serializer === "FileSerializable") {
//         if (type?.type === "array") {
//             return signature_type === "parameter"
//                 ? "(Blob | File | Buffer)[]"
//                 : `{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}[]`;
//         }
//         return signature_type === "parameter"
//             ? "Blob | File | Buffer"
//             : `{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}`;
//     } else if (serializer === "GallerySerializable") {
//         return signature_type === "parameter"
//             ? "[(Blob | File | Buffer), (string | null)][]"
//             : `[{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}, (string | null))][]`;
//     }
// }

// function map_names_to_ids(
//     fns: Config["dependencies"]
// ): Record<string, number> {
//     let apis: Record<string, number> = {};

//     fns.forEach(({ api_name, id }) => {
//         if (api_name) apis[api_name] = id;
//     });
//     return apis;
// }

// const view_api = async () => {

//     if (!config) {
//         return;
//     }

//     const url = join_urls(config.root, api_prefix, "info");

//     const response = await fetch(url, {
//         headers,
//         credentials: "include"
//     });

//     let apiInfo;
//     apiInfo = await response.json();

//     if ("api" in apiInfo) {
//         apiInfo = apiInfo.api;
//     }

//     if (
//         apiInfo.named_endpoints["/predict"] &&
//         !apiInfo.unnamed_endpoints["0"]
//     ) {
//         apiInfo.unnamed_endpoints[0] = apiInfo.named_endpoints["/predict"];
//     }

//     const transformed_info: Record<string, any> = {
//         named_endpoints: {},
//         unnamed_endpoints: {}
//     };

//     Object.keys(apiInfo).forEach((category) => {
//         if (category === "named_endpoints" || category === "unnamed_endpoints") {
//             transformed_info[category] = {};

//             Object.entries(apiInfo[category]).forEach(
//                 ([endpoint, { parameters, returns }]: any) => {
//                     const dependencyIndex = -1;

//                     const dependencyTypes = { generator: false, cancel: false };

//                     const transform_type = (
//                         data: any,
//                         component: string,
//                         serializer: string,
//                         signature_type: "return" | "parameter"
//                     ): any => ({
//                         ...data,
//                         description: get_description(data?.type, serializer),
//                         type:
//                             get_type(data?.type, component, serializer, signature_type) || ""
//                     });

//                     transformed_info[category][endpoint] = {
//                         parameters: parameters.map((p: any) =>
//                             transform_type(p, p?.component, p?.serializer, "parameter")
//                         ),
//                         returns: returns.map((r: any) =>
//                             transform_type(r, r?.component, r?.serializer, "return")
//                         ),
//                         type: dependencyTypes
//                     };
//                 }
//             );
//         }
//     });

//     api_info = transformed_info;
// }

// const resolveConfig = async () => {

//     const res = await fetch(`https://huggingface.co/api/spaces/${app_reference}/host`);
//     const json = await res.json();

//     console.log("json in resolve config", json);

//     const _host = json.host;

//     const { protocol, host } = new URL(_host);

//     const configUrl = `${protocol}//${host}`

//     const config_url = join_urls(configUrl, "config");

//     const response = await fetch(config_url, {
//         headers,
//         credentials: "include"
//     });

//     config = await response.json();
//     config.root = configUrl;
//     config.dependencies?.forEach((dep: any, i: number) => {
//         if (dep.id === undefined) {
//             dep.id = i;
//         }
//     });
//     return config;
// }

// const connect = async (app_reference: string) => {
//     await resolveConfig();
//     api_prefix = config.api_prefix || "";

//     if (config.auth_required) {
//         return;
//     }

//     await view_api();
//     api_map = map_names_to_ids(config?.dependencies || []);
// }

// async function predict(
//     this: Client,
//     endpoint: string | number,
//     data: unknown[] | Record<string, unknown> = {}
// ): Promise<PredictReturn> {
//     let data_returned = false;
//     let status_complete = false;

//     if (!this.config) {
//         throw new Error("Could not resolve app config");
//     }

//     return new Promise(async (resolve, reject) => {
//         const app = this.submit(endpoint, data, null, null, true);
//         let result: unknown;

//         for await (const message of app) {
//             if (message.type === "data") {
//                 if (status_complete) {
//                     resolve(result as PredictReturn);
//                 }
//                 data_returned = true;
//                 result = message;
//             }

//             if (message.type === "status") {
//                 if (message.stage === "error") reject(message);
//                 if (message.stage === "complete") {
//                     status_complete = true;
//                     // if complete message comes after data, resolve here
//                     if (data_returned) {
//                         resolve(result as PredictReturn);
//                     }
//                 }
//             }
//         }
//     });
// }

// export function submit(
//     endpoint: string | number,
//     data: unknown[] | Record<string, unknown> = {},
//     event_data?: unknown,
//     trigger_id?: number | null,
//     all_events?: boolean
// ) {
//     try {

//         // const {
//         //     app_reference,
//         //     config,
//         //     session_hash,
//         //     api_info,
//         //     api_map,
//         //     stream_status,
//         //     pending_stream_messages,
//         //     pending_diff_streams,
//         //     event_callbacks,
//         //     unclosed_events,
//         //     post_data,
//         //     options,
//         //     api_prefix
//         // } = this;

//         // const that = this;

//         if (!api_info) throw new Error("No API found");
//         if (!config) throw new Error("Could not resolve app config");

//         let { fn_index, endpoint_info, dependency } = get_endpoint_info(
//             api_info,
//             endpoint,
//             api_map,
//             config
//         );

//         let resolved_data = map_data_to_params(data, endpoint_info);

//         let stream: EventSource | null;
//         let protocol = config.protocol ?? "ws";
//         if (protocol === "ws") {
//             throw new Error("WebSocket protocol is not supported in this version");
//         }
//         let event_id_final = "";

//         let payload: Record<string, any>;
//         let event_id: string | null = null;
//         let complete: any | undefined | false = false;
//         let last_status: Record<string, any> = {};
//         let url_params =
//             typeof window !== "undefined" && typeof document !== "undefined"
//                 ? new URLSearchParams(window.location.search).toString()
//                 : "";

//         const events_to_publish =
//             options?.events?.reduce(
//                 (acc, event) => {
//                     acc[event] = true;
//                     return acc;
//                 },
//                 {} as Record<string, boolean>
//             ) || {};

//         // event subscription methods
//         function fire_event(event: GradioEvent): void {
//             if (all_events || events_to_publish[event.type]) {
//                 push_event(event);
//             }
//         }

//         async function cancel(): Promise<void> {
//             let reset_request = {};
//             let cancel_request = {};
//             reset_request = { event_id };
//             cancel_request = { event_id, session_hash, fn_index };

//             try {
//                 if (!config) {
//                     throw new Error("Could not resolve app config");
//                 }

//                 if ("event_id" in cancel_request) {
//                     await fetch(`${config.root}${api_prefix}/cancel`, {
//                         headers: { "Content-Type": "application/json" },
//                         method: "POST",
//                         body: JSON.stringify(cancel_request)
//                     });
//                 }

//                 await fetch(`${config.root}${api_prefix}/${RESET_URL}`, {
//                     headers: { "Content-Type": "application/json" },
//                     method: "POST",
//                     body: JSON.stringify(reset_request)
//                 });
//             } catch (e) {
//                 console.warn(
//                     "The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
//                 );
//             }
//         }

//         const resolve_heartbeat = async (config: Config): Promise<void> => {
//             await this._resolve_heartbeat(config);
//         };

//         async function handle_render_config(render_config: any): Promise<void> {
//             if (!config) return;
//             let render_id: number = render_config.render_id;
//             config.components = [
//                 ...config.components.filter((c) => c.props.rendered_in !== render_id),
//                 ...render_config.components
//             ];
//             config.dependencies = [
//                 ...config.dependencies.filter((d) => d.rendered_in !== render_id),
//                 ...render_config.dependencies
//             ];
//             const any_state = config.components.some((c) => c.type === "state");
//             const any_unload = config.dependencies.some((d) =>
//                 d.targets.some((t) => t[1] === "unload")
//             );
//             config.connect_heartbeat = any_state || any_unload;
//             await resolve_heartbeat(config);
//             fire_event({
//                 type: "render",
//                 data: render_config,
//                 endpoint: _endpoint,
//                 fn_index
//             });
//         }

//         const job = this.handle_blob(
//             config.root,
//             resolved_data,
//             endpoint_info
//         ).then(async (_payload) => {
//             let input_data = handle_payload(
//                 _payload,
//                 dependency,
//                 config.components,
//                 "input",
//                 true
//             );
//             payload = {
//                 data: input_data || [],
//                 event_data,
//                 fn_index,
//                 trigger_id
//             };
//             if (skip_queue(fn_index, config)) {
//                 fire_event({
//                     type: "status",
//                     endpoint: _endpoint,
//                     stage: "pending",
//                     queue: false,
//                     fn_index,
//                     time: new Date()
//                 });

//                 post_data(
//                     `${config.root}${api_prefix}/run${_endpoint.startsWith("/") ? _endpoint : `/${_endpoint}`
//                     }${url_params ? "?" + url_params : ""}`,
//                     {
//                         ...payload,
//                         session_hash
//                     }
//                 )
//                     .then(async ([output, status_code]: any) => {
//                         const data = output.data;

//                         if (status_code == 200) {
//                             fire_event({
//                                 type: "data",
//                                 endpoint: _endpoint,
//                                 fn_index,
//                                 data: handle_payload(
//                                     data,
//                                     dependency,
//                                     config.components,
//                                     "output",
//                                     options.with_null_state
//                                 ),
//                                 time: new Date(),
//                                 event_data,
//                                 trigger_id
//                             });
//                             if (output.render_config) {
//                                 await handle_render_config(output.render_config);
//                             }

//                             fire_event({
//                                 type: "status",
//                                 endpoint: _endpoint,
//                                 fn_index,
//                                 stage: "complete",
//                                 eta: output.average_duration,
//                                 queue: false,
//                                 time: new Date()
//                             });
//                         } else {
//                             fire_event({
//                                 type: "status",
//                                 stage: "error",
//                                 endpoint: _endpoint,
//                                 fn_index,
//                                 message: output.error,
//                                 queue: false,
//                                 time: new Date()
//                             });
//                         }
//                     })
//                     .catch((e) => {
//                         fire_event({
//                             type: "status",
//                             stage: "error",
//                             message: e.message,
//                             endpoint: _endpoint,
//                             fn_index,
//                             queue: false,
//                             time: new Date()
//                         });
//                     });
//             } else if (protocol == "sse") {
//                 fire_event({
//                     type: "status",
//                     stage: "pending",
//                     queue: true,
//                     endpoint: _endpoint,
//                     fn_index,
//                     time: new Date()
//                 });
//                 var params = new URLSearchParams({
//                     fn_index: fn_index.toString(),
//                     session_hash: session_hash
//                 }).toString();
//                 let url = new URL(
//                     `${config.root}${api_prefix}/${SSE_URL}?${url_params ? url_params + "&" : ""
//                     }${params}`
//                 );

//                 if (this.jwt) {
//                     url.searchParams.set("__sign", this.jwt);
//                 }

//                 stream = this.stream(url);

//                 if (!stream) {
//                     return Promise.reject(
//                         new Error("Cannot connect to SSE endpoint: " + url.toString())
//                     );
//                 }

//                 stream.onmessage = async function (event: MessageEvent) {
//                     const _data = JSON.parse(event.data);
//                     const { type, status, data } = handle_message(
//                         _data,
//                         last_status[fn_index]
//                     );

//                     if (type === "update" && status && !complete) {
//                         // call 'status' listeners
//                         fire_event({
//                             type: "status",
//                             endpoint: _endpoint,
//                             fn_index,
//                             time: new Date(),
//                             ...status
//                         });
//                         if (status.stage === "error") {
//                             stream?.close();
//                             close();
//                         }
//                     } else if (type === "data") {
//                         let [_, status] = await post_data(
//                             `${config.root}${api_prefix}/queue/data`,
//                             {
//                                 ...payload,
//                                 session_hash,
//                                 event_id
//                             }
//                         );
//                         if (status !== 200) {
//                             fire_event({
//                                 type: "status",
//                                 stage: "error",
//                                 message: BROKEN_CONNECTION_MSG,
//                                 queue: true,
//                                 endpoint: _endpoint,
//                                 fn_index,
//                                 time: new Date()
//                             });
//                             stream?.close();
//                             close();
//                         }
//                     } else if (type === "complete") {
//                         complete = status;
//                     } else if (type === "log") {
//                         fire_event({
//                             type: "log",
//                             title: data.title,
//                             log: data.log,
//                             level: data.level,
//                             endpoint: _endpoint,
//                             duration: data.duration,
//                             visible: data.visible,
//                             fn_index
//                         });
//                     } else if (type === "generating" || type === "streaming") {
//                         fire_event({
//                             type: "status",
//                             time: new Date(),
//                             ...status,
//                             stage: status?.stage!,
//                             queue: true,
//                             endpoint: _endpoint,
//                             fn_index
//                         });
//                     }
//                     if (data) {
//                         fire_event({
//                             type: "data",
//                             time: new Date(),
//                             data: handle_payload(
//                                 data.data,
//                                 dependency,
//                                 config.components,
//                                 "output",
//                                 options.with_null_state
//                             ),
//                             endpoint: _endpoint,
//                             fn_index,
//                             event_data,
//                             trigger_id
//                         });

//                         if (complete) {
//                             fire_event({
//                                 type: "status",
//                                 time: new Date(),
//                                 ...complete,
//                                 stage: status?.stage!,
//                                 queue: true,
//                                 endpoint: _endpoint,
//                                 fn_index
//                             });
//                             stream?.close();
//                             close();
//                         }
//                     }
//                 };
//             } else if (
//                 protocol == "sse_v1" ||
//                 protocol == "sse_v2" ||
//                 protocol == "sse_v2.1" ||
//                 protocol == "sse_v3"
//             ) {
//                 // latest API format. v2 introduces sending diffs for intermediate outputs in generative functions, which makes payloads lighter.
//                 // v3 only closes the stream when the backend sends the close stream message.
//                 fire_event({
//                     type: "status",
//                     stage: "pending",
//                     queue: true,
//                     endpoint: _endpoint,
//                     fn_index,
//                     time: new Date()
//                 });
//                 let hostname = "";
//                 if (typeof window !== "undefined" && typeof document !== "undefined") {
//                     hostname = window?.location?.hostname;
//                 }

//                 let hfhubdev = "dev.spaces.huggingface.tech";
//                 const origin = hostname.includes(".dev.")
//                     ? `https://moon-${hostname.split(".")[1]}.${hfhubdev}`
//                     : `https://huggingface.co`;

//                 const is_zerogpu_iframe =
//                     typeof window !== "undefined" &&
//                     typeof document !== "undefined" &&
//                     window.parent != window &&
//                     window.supports_zerogpu_headers;
//                 const zerogpu_auth_promise = is_zerogpu_iframe
//                     ? post_message<Map<string, string>>("zerogpu-headers", origin)
//                     : Promise.resolve(null);
//                 const post_data_promise = zerogpu_auth_promise.then((headers) => {
//                     return post_data(
//                         `${config.root}${api_prefix}/${SSE_DATA_URL}?${url_params}`,
//                         {
//                             ...payload,
//                             session_hash
//                         },
//                         headers
//                     );
//                 });

//                 return post_data_promise.then(async ([response, status]: any) => {
//                     if (response.event_id) {
//                         event_id_final = response.event_id as string;
//                     }

//                     if (status === 503) {
//                         fire_event({
//                             type: "status",
//                             stage: "error",
//                             message: QUEUE_FULL_MSG,
//                             queue: true,
//                             endpoint: _endpoint,
//                             fn_index,
//                             time: new Date(),
//                             visible: true
//                         });
//                     } else if (status === 422) {
//                         fire_event({
//                             type: "status",
//                             stage: "error",
//                             message: response.detail,
//                             queue: true,
//                             endpoint: _endpoint,
//                             fn_index,
//                             code: "validation_error",
//                             time: new Date(),
//                             visible: true
//                         });
//                         close();
//                     } else if (status !== 200) {
//                         fire_event({
//                             type: "status",
//                             stage: "error",
//                             broken: false,
//                             message: response.detail,
//                             queue: true,
//                             endpoint: _endpoint,
//                             fn_index,
//                             time: new Date(),
//                             visible: true
//                         });
//                     } else {
//                         event_id = response.event_id as string;
//                         event_id_final = event_id;
//                         let callback = async function (_data: object): Promise<void> {
//                             try {
//                                 const { type, status, data, original_msg } = handle_message(
//                                     _data,
//                                     last_status[fn_index]
//                                 );

//                                 if (type == "heartbeat") {
//                                     return;
//                                 }

//                                 if (type === "update" && status && !complete) {
//                                     // call 'status' listeners
//                                     fire_event({
//                                         type: "status",
//                                         endpoint: _endpoint,
//                                         fn_index,
//                                         time: new Date(),
//                                         original_msg: original_msg,
//                                         ...status
//                                     });
//                                 } else if (type === "complete") {
//                                     complete = status;
//                                 } else if (
//                                     type == "unexpected_error" ||
//                                     type == "broken_connection"
//                                 ) {
//                                     console.error("Unexpected error", status?.message);
//                                     const broken = type === "broken_connection";
//                                     fire_event({
//                                         type: "status",
//                                         stage: "error",
//                                         message: status?.message || "An Unexpected Error Occurred!",
//                                         queue: true,
//                                         endpoint: _endpoint,
//                                         broken,
//                                         session_not_found: status?.session_not_found,
//                                         fn_index,
//                                         time: new Date()
//                                     });
//                                 } else if (type === "log") {
//                                     fire_event({
//                                         type: "log",
//                                         title: data.title,
//                                         log: data.log,
//                                         level: data.level,
//                                         endpoint: _endpoint,
//                                         duration: data.duration,
//                                         visible: data.visible,
//                                         fn_index
//                                     });
//                                     return;
//                                 } else if (type === "generating" || type === "streaming") {
//                                     fire_event({
//                                         type: "status",
//                                         time: new Date(),
//                                         ...status,
//                                         stage: status?.stage!,
//                                         queue: true,
//                                         endpoint: _endpoint,
//                                         fn_index
//                                     });
//                                     if (
//                                         data &&
//                                         dependency.connection !== "stream" &&
//                                         ["sse_v2", "sse_v2.1", "sse_v3"].includes(protocol)
//                                     ) {
//                                         apply_diff_stream(pending_diff_streams, event_id!, data);
//                                     }
//                                 }
//                                 if (data) {
//                                     fire_event({
//                                         type: "data",
//                                         time: new Date(),
//                                         data: handle_payload(
//                                             data.data,
//                                             dependency,
//                                             config.components,
//                                             "output",
//                                             options.with_null_state
//                                         ),
//                                         endpoint: _endpoint,
//                                         fn_index
//                                     });
//                                     if (data.render_config) {
//                                         await handle_render_config(data.render_config);
//                                     }

//                                     if (complete) {
//                                         fire_event({
//                                             type: "status",
//                                             time: new Date(),
//                                             ...complete,
//                                             stage: status?.stage!,
//                                             queue: true,
//                                             endpoint: _endpoint,
//                                             fn_index
//                                         });
//                                         close();
//                                     }
//                                 }

//                                 if (status?.stage === "complete" || status?.stage === "error") {
//                                     if (event_callbacks[event_id!]) {
//                                         delete event_callbacks[event_id!];
//                                     }
//                                     if (event_id! in pending_diff_streams) {
//                                         delete pending_diff_streams[event_id!];
//                                     }
//                                 }
//                             } catch (e) {
//                                 console.error("Unexpected client exception", e);
//                                 fire_event({
//                                     type: "status",
//                                     stage: "error",
//                                     message: "An Unexpected Error Occurred!",
//                                     queue: true,
//                                     endpoint: _endpoint,
//                                     fn_index,
//                                     time: new Date()
//                                 });
//                                 if (["sse_v2", "sse_v2.1", "sse_v3"].includes(protocol)) {
//                                     close_stream(stream_status, that.abort_controller);
//                                     stream_status.open = false;
//                                     close();
//                                 }
//                             }
//                         };

//                         if (event_id in pending_stream_messages) {
//                             pending_stream_messages[event_id].forEach((msg) => callback(msg));
//                             delete pending_stream_messages[event_id];
//                         }
//                         // @ts-ignore
//                         event_callbacks[event_id] = callback;
//                         unclosed_events.add(event_id);
//                         if (!stream_status.open) {
//                             await this.open_stream();
//                         }
//                     }
//                 });
//             }
//         });

//         let done = false;
//         const values: (IteratorResult<GradioEvent> | PromiseLike<never>)[] = [];
//         const resolvers: ((
//             value: IteratorResult<GradioEvent> | PromiseLike<never>
//         ) => void)[] = [];

//         function close(): void {
//             done = true;
//             while (resolvers.length > 0)
//                 (resolvers.shift() as (typeof resolvers)[0])({
//                     value: undefined,
//                     done: true
//                 });
//         }

//         function push(
//             data: { value: GradioEvent; done: boolean } | PromiseLike<never>
//         ): void {
//             if (resolvers.length > 0) {
//                 (resolvers.shift() as (typeof resolvers)[0])(data);
//             } else {
//                 values.push(data);
//             }
//         }

//         function push_error(error: unknown): void {
//             push(thenable_reject(error));
//             close();
//         }

//         function push_event(event: GradioEvent): void {
//             push({ value: event, done: false });
//         }

//         function next(): Promise<IteratorResult<GradioEvent, unknown>> {
//             if (values.length > 0) {
//                 return Promise.resolve(values.shift() as (typeof values)[0]);
//             }
//             return new Promise((resolve) => resolvers.push(resolve));
//         }

//         const iterator = {
//             [Symbol.asyncIterator]: () => iterator,
//             next,
//             throw: async (value: unknown) => {
//                 push_error(value);
//                 return next();
//             },
//             return: async () => {
//                 close();
//                 return { value: undefined, done: true as const };
//             },
//             cancel,
//             send_chunk: (payload: Record<string, unknown>) => {
//                 this.post_data(`${config.root}${api_prefix}/stream/${event_id_final}`, {
//                     ...payload,
//                     session_hash: this.session_hash
//                 });
//             },
//             close_stream: () => {
//                 this.post_data(
//                     `${config.root}${api_prefix}/stream/${event_id_final}/close`,
//                     {}
//                 );

//                 close();
//             },
//             event_id: () => event_id_final,
//             wait_for_id: async () => {
//                 await job;
//                 return event_id;
//             }
//         };

//         return iterator;
//     } catch (error) {
//         console.error("Submit function encountered an error:", error);
//         throw error;
//     }
// }

// function get_endpoint_info(
//     api_info: any,
//     endpoint: string | number,
//     api_map: Record<string, number>,
//     config: any
// ): {
//     fn_index: number;
//     endpoint_info: EndpointInfo<JsApiData>;
//     dependency: Dependency;
// } {
//     let fn_index: number;
//     let endpoint_info: EndpointInfo<JsApiData>;

//     if (typeof endpoint === "number") {
//         fn_index = endpoint;
//         endpoint_info = api_info.unnamed_endpoints[fn_index];
//         dependency = config.dependencies.find((dep) => dep.id == endpoint)!;
//     } else {
//         const trimmed_endpoint = endpoint.replace(/^\//, "");

//         fn_index = api_map[trimmed_endpoint];
//         endpoint_info = api_info.named_endpoints[endpoint.trim()];
//         dependency = config.dependencies.find(
//             (dep) => dep.id == api_map[trimmed_endpoint]
//         )!;
//     }

//     if (typeof fn_index !== "number") {
//         throw new Error(
//             "There is no endpoint matching that name of fn_index matching that number."
//         );
//     }
//     return { fn_index, endpoint_info, dependency };
// }


// export const map_data_to_params = (
//     data: unknown[] | Record<string, unknown> = [],
//     endpoint_info: EndpointInfo<JsApiData | ApiData>
// ): unknown[] => {
//     // Workaround for the case where the endpoint_info is undefined
//     // See https://github.com/gradio-app/gradio/pull/8820#issuecomment-2237381761
//     const parameters = endpoint_info ? endpoint_info.parameters : [];

//     if (Array.isArray(data)) {
//         if (
//             endpoint_info &&
//             parameters.length > 0 &&
//             data.length > parameters.length
//         ) {
//             console.warn("Too many arguments provided for the endpoint.");
//         }
//         return data;
//     }

//     const resolved_data: unknown[] = [];
//     const provided_keys = Object.keys(data);

//     parameters.forEach((param, index) => {
//         if (data.hasOwnProperty(param.parameter_name)) {
//             resolved_data[index] = data[param.parameter_name];
//         } else if (param.parameter_has_default) {
//             resolved_data[index] = param.parameter_default;
//         } else {
//             throw new Error(
//                 `No value provided for required parameter: ${param.parameter_name}`
//             );
//         }
//     });

//     provided_keys.forEach((key) => {
//         if (!parameters.some((param) => param.parameter_name === key)) {
//             throw new Error(
//                 `Parameter \`${key}\` is not a valid keyword argument. Please refer to the API for usage.`
//             );
//         }
//     });

//     resolved_data.forEach((value, idx) => {
//         if (value === undefined && !parameters[idx].parameter_has_default) {
//             throw new Error(
//                 `No value provided for required parameter: ${parameters[idx].parameter_name}`
//             );
//         }
//     });

//     return resolved_data;
// };