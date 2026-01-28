"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";

type Props = {
    url: string;
    // Optional tokens for platforms that require them (Instagram/Facebook Graph API, Twitter/X API v2, etc.)
    instagramAccessToken?: string; // e.g. <app_id>|<app_secret> or Graph token
    facebookAccessToken?: string;
    twitterBearerToken?: string;
    className?: string;
};

type OEmbedResponse = {
    type?: string;
    version?: string;
    provider_name?: string;
    provider_url?: string;
    title?: string;
    author_name?: string;
    author_url?: string;
    thumbnail_url?: string;
    html?: string;
    url?: string;
    width?: number;
    height?: number;
};

const OptionalViewer = ({ state, children }: PropsWithChildren<{ state: boolean }>) => {

    if (state) return children;

}

const UniversalMediaPreview = ({
    url,
    instagramAccessToken,
    facebookAccessToken,
    twitterBearerToken,
    className = "",
}: Props) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [oembed, setOembed] = useState<OEmbedResponse | null>(null);
    const [platform, setPlatform] = useState<string | null>(null);

    useEffect(() => {
        if (!url) return;
        setLoading(true);
        setError(null);
        setOembed(null);
        const p = detectPlatform(url);
        setPlatform(p);

        (async () => {
            try {
                // try platform-specific oEmbed or embed sources
                let o: OEmbedResponse | null = null;

                switch (p) {
                    case "youtube":
                        o = await fetchOEmbed(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
                        break;
                    case "vimeo":
                        o = await fetchOEmbed(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
                        break;
                    case "reddit":
                        // reddit supports oEmbed
                        o = await fetchOEmbed(`https://www.reddit.com/oembed?url=${encodeURIComponent(url)}&format=json`);
                        break;
                    case "pinterest":
                        // Pinterest has an oEmbed endpoint
                        try {
                            o = await fetchOEmbed(`https://widgets.pinterest.com/v3/pidgets/oembed.json/?url=${encodeURIComponent(url)}`);
                        } catch (e) {
                            // fallback: try generic oembed
                            o = await safeGenericOEmbedFetch(url);
                        }
                        break;
                    case "tiktok":
                        // TikTok provides an oEmbed endpoint
                        o = await fetchOEmbed(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
                        break;
                    case "instagram":
                        // Instagram's oEmbed requires a Facebook App access token for some usage
                        if (!instagramAccessToken && !facebookAccessToken) {
                            // We'll attempt the public oEmbed (may be blocked); if it fails, tell user to provide token
                            try {
                                o = await fetchOEmbed(`https://graph.facebook.com/v16.0/instagram_oembed?url=${encodeURIComponent(url)}&omitscript=true`);
                            } catch (err) {
                                setError(
                                    "Instagram oEmbed requires an access token (instagramAccessToken or facebookAccessToken). Provide one via props to render Instagram media."
                                );
                            }
                        } else {
                            const token = instagramAccessToken || facebookAccessToken;
                            o = await fetchOEmbed(
                                `https://graph.facebook.com/v16.0/instagram_oembed?url=${encodeURIComponent(url)}&omitscript=true&access_token=${encodeURIComponent(
                                    token!
                                )}`
                            );
                        }
                        break;
                    case "facebook":
                        // Facebook oEmbed also typically requires an access token
                        if (!facebookAccessToken) {
                            setError("Facebook oEmbed requires a facebookAccessToken to render.");
                        } else {
                            o = await fetchOEmbed(
                                `https://graph.facebook.com/v16.0/oembed_post?url=${encodeURIComponent(url)}&access_token=${encodeURIComponent(
                                    facebookAccessToken!
                                )}`
                            );
                        }
                        break;
                    case "twitter":
                        // Twitter/X removed public oEmbed in many cases; the safest approach is to provide a direct embed HTML via publish.twitter.com or use API
                        // We'll try publish.twitter.com's oEmbed as a fallback (it sometimes works)
                        try {
                            o = await fetchOEmbed(`https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`);
                        } catch (e) {
                            setError("Twitter/X embedding may require API access; provide a server-side embed HTML or token.");
                        }
                        break;
                    default:
                        // Try generic oEmbed discovery
                        o = await safeGenericOEmbedFetch(url);
                        break;
                }

                setOembed(o);
            } catch (err: any) {
                setError(err?.message || String(err));
            } finally {
                setLoading(false);
            }
        })();
    }, [url, instagramAccessToken, facebookAccessToken, twitterBearerToken]);

    function detectPlatform(raw: string) {
        const u = raw.toLowerCase();
        if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
        if (u.includes("vimeo.com")) return "vimeo";
        if (u.includes("reddit.com") || u.includes("redd.it")) return "reddit";
        if (u.includes("pinterest.com") || u.includes("pin.it")) return "pinterest";
        if (u.includes("tiktok.com")) return "tiktok";
        if (u.includes("instagram.com") || u.includes("instagr.am")) return "instagram";
        if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
        if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
        return "unknown";
    }

    async function fetchOEmbed(oembedUrl: string) {
        const res = await fetch(oembedUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`oEmbed fetch failed: ${res.status}`);
        const json = await res.json();
        return json as OEmbedResponse;
    }

    // Generic attempt: try common oEmbed endpoints via discovery or common endpoints
    async function safeGenericOEmbedFetch(resourceUrl: string) {
        // Try a few common endpoints heuristically
        const tries = [
            `https://r.jina.ai/${encodeURIComponent(resourceUrl)}`,
            `https://noembed.com/embed?url=${encodeURIComponent(resourceUrl)}`,
        ];

        for (const t of tries) {
            try {
                // some endpoints may not be valid — skip errors
                const res = await fetch(t, { cache: "no-store" }).catch(() => null);
                if (!res) continue;
                if (!res.ok) continue;
                const json = await res.json();
                if (json && (json.html || json.url || json.thumbnail_url)) return json as OEmbedResponse;
            } catch (e) {
                // ignore
            }
        }

        // If nothing works, throw
        throw new Error("No oEmbed available for this URL");
    }

    // Helper renderers
    function renderProviderIcon(name: string | null) {
        // simple SVG icons; keep small and neutral
        const size = 20;
        switch (name) {
            case "youtube":
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M23 7a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-8.9.9A3 3 0 0 0 .9 7 31.1 31.1 0 0 0 0 12a31.1 31.1 0 0 0 .9 5c.6 1.2 2.4 2.1 4.2 2.1C4.5 20 12 20 12 20s7.5 0 8.9-.9A3 3 0 0 0 23 17a31.1 31.1 0 0 0 1-5 31.1 31.1 0 0 0-1-5z" fill="#ff0000" />
                        <path d="M9.8 15.5V8.5l6.2 3.5-6.2 3.5z" fill="#fff" />
                    </svg>
                );
            case "instagram":
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect x="4" y="4" width="16" height="16" rx="4" stroke="#000" />
                        <circle cx="12" cy="12" r="3" fill="#000" />
                        <circle cx="17" cy="7" r="1" fill="#000" />
                    </svg>
                );
            case "twitter":
            case "x":
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M22 5.9c-.7.3-1.4.5-2.2.6.8-.5 1.4-1.3 1.7-2.3-.7.4-1.5.7-2.4.9C18.9 4 17.8 3.5 16.6 3.5c-2 0-3.6 1.6-3.6 3.6 0 .3 0 .6.1.9C9.7 7.8 6.4 6 4.3 3.4c-.4.7-.7 1.4-.7 2.2 0 1.5.8 2.9 2.1 3.7-.6 0-1.1-.2-1.6-.4v.1c0 2.1 1.5 3.8 3.5 4.2-.4.1-.8.2-1.3.2-.3 0-.6 0-.9-.1.6 2 2.4 3.4 4.5 3.4-1.6 1.2-3.6 1.9-5.8 1.9H5c2 1.2 4.4 1.9 6.9 1.9 8.3 0 12.9-6.9 12.9-12.9v-.6c.9-.6 1.6-1.3 2.2-2.1-.8.3-1.7.5-2.6.6z" fill="#1DA1F2" />
                    </svg>
                );
            case "reddit":
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
                        <path d="M12 2c-5.5 0-10 3.6-10 8s4.5 8 10 8 10-3.6 10-8-4.5-8-10-8zm-3.5 8.2c.4 0 .8.3.8.8s-.4.8-.8.8-.8-.3-.8-.8.4-.8.8-.8zm7 0c.4 0 .8.3.8.8s-.4.8-.8.8-.8-.3-.8-.8.4-.8.8-.8zM8.5 15.5c1-1.3 3.3-1.8 3.5-1.8s2.5.5 3.5 1.8c.6.8-.6 1.6-3.5 1.6s-4.1-.8-3.5-1.6z" fill="#FF4500" />
                    </svg>
                );
            default:
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
                        <circle cx="12" cy="12" r="10" stroke="#888" fill="transparent" />
                    </svg>
                );
        }
    }

    // Render oEmbed HTML safely inside a responsive container
    function renderEmbedHtml(html?: string | null) {
        if (!html) return null;
        // Often oEmbed HTML contains <script> tags; many providers require you to insert their script once.
        // We will render the HTML and also include a tiny hint that some providers may need their script.
        return (
            <div className="w-full aspect-video overflow-hidden rounded-md" dangerouslySetInnerHTML={{ __html: html }} />
        );
    }

    // For direct images / videos
    function renderDirectMedia(o: OEmbedResponse) {
        // Try video first
        // Many oEmbed responses use 'url' or 'thumbnail_url'
        const mediaUrl = (o.url as string) || (o.thumbnail_url as string) || null;
        if (!mediaUrl) return null;

        // Basic type sniffing
        if (mediaUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
            return (
                <video controls className="w-full rounded-md max-h-[60vh]">
                    <source src={mediaUrl} />
                    Your browser does not support the video tag.
                </video>
            );
        }

        // else render image
        return <img src={mediaUrl} alt={o.title || "embedded media"} className="w-full rounded-md" />;
    }

    return (
        <div className={`universal-media-preview ${className} p-2 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-800`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">{renderProviderIcon(platform)}</div>
                <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{platform ? platform.toUpperCase() : "UNKNOWN"}</div>
                    <div className="mt-1">
                        {loading && <div className="text-sm text-gray-500">Loading preview…</div>}
                        {error && (
                            <div className="text-sm text-red-500">
                                {error}
                                <div className="mt-2 text-xs text-gray-500">Showing fallback link.</div>
                            </div>
                        )}

                        {!loading && !error && oembed && (
                            <div className="mt-2">
                                {/* If provider returned embeddable html, use it */}
                                {oembed.html ? (
                                    <div className="mb-2">{renderEmbedHtml(oembed.html)}</div>
                                ) : (
                                    <div className="mb-2">{renderDirectMedia(oembed)}</div>
                                )}

                                {/* Attribution + source link */}
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1">{renderProviderIcon(platform)}<span>{oembed.provider_name || platform}</span></span>
                                        {oembed.title && <span className="ml-2">· {oembed.title}</span>}
                                    </div>
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                                        Open source
                                    </a>
                                </div>
                            </div>
                        )}

                        {!loading && !oembed && !error && (
                            <div className="mt-2">
                                <div className="text-sm text-gray-600">No preview available.</div>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline mt-1 block">
                                    Open source
                                </a>
                            </div>
                        )}

                        {/* Fallback when error */}
                        {error && (
                            <div className="mt-2">
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                                    Open source link
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


const FrameIt = () => {

    const [url, setUrl] = useState("");

    const handleUrl = (fd: FormData) => {
        const url = fd.get("url");
        if (!url || typeof url !== "string") return;
        setUrl(url);
    }

    return (
        <main>
            <header>
                <form action={handleUrl} className="w-full p-4">
                    <input name="url" className="p-2 border border-gray-500 rounded-md w-full" />
                </form>
            </header>
            <OptionalViewer state={!!url}>
                <UniversalMediaPreview url={url} />
            </OptionalViewer>
        </main>
    )

}
// https://instagram.com/p/DROomGDETqZ
export default FrameIt;