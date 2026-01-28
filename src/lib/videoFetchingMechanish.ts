// useVideoPrefetcher.ts
import { useEffect, useRef } from 'react';

/* ---------- Types ---------- */

interface ByteRange { start: number; end: number; total?: number; }
interface Chunk { byteRange: ByteRange; data: ArrayBuffer; }
interface CacheEntry extends Chunk { timestamp: number; expiry: number; key: string }
export interface PrefetcherConfig {
    chunkDuration?: number;   // approximate seconds per chunk
    initialChunkSize?: number; // bytes
    maxChunkSize?: number;     // bytes
    cacheExpiryMs?: number;    // automatic entry expiry
    pauseTimeoutMs?: number;   // auto clear after pause
}

/* ---------- CacheManager ---------- */

class CacheManager {
    private dbPromise: Promise<IDBDatabase>;
    constructor(private videoUrl: string, private expiryMs = 1000 * 60 * 10) { // 10 min expiry
        this.dbPromise = this.init();
    }

    private get storeName() { return encodeURIComponent(this.videoUrl); }

    private async init(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const open = indexedDB.open('videoCacheDB', 1);
            open.onupgradeneeded = () => {
                const db = open.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'key' });
                }
            };
            open.onsuccess = () => resolve(open.result);
            open.onerror = () => reject(open.error);
        });
    }

    async put(key: string, chunk: Chunk): Promise<void> {
        const db = await this.dbPromise;
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const entry: CacheEntry = {
            ...chunk,
            key,
            timestamp: Date.now(),
            expiry: Date.now() + this.expiryMs,
        };
        store.put(entry);
    }

    async get(key: string): Promise<CacheEntry | undefined> {
        const db = await this.dbPromise;
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        return new Promise((resolve) => {
            const req = store.get(key);
            req.onsuccess = () => {
                const val = req.result as CacheEntry;
                if (!val || val.expiry < Date.now()) resolve(undefined);
                else resolve(val);
            };
            req.onerror = () => resolve(undefined);
        });
    }

    async clear(allStores = false): Promise<void> {
        const db = await this.dbPromise;
        if (allStores) {
            // remove all video caches
            const names = Array.from(db.objectStoreNames);
            names.forEach(name => db.deleteObjectStore(name));
        } else {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).clear();
        }
    }

    async keepOnly(keys: string[]): Promise<void> {
        const db = await this.dbPromise;
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.getAllKeys();
        req.onsuccess = () => {
            const all = req.result as string[];
            all.filter(k => !keys.includes(k)).forEach(k => store.delete(k));
        };
    }
}

/* ---------- VideoFetcher (adaptive chunk size) ---------- */

class VideoFetcher {
    private dynamicSize = 1_000_000;
    constructor(
        private videoUrl: string,
        private config: Partial<PrefetcherConfig> | undefined
    ) {
        if (config?.initialChunkSize)
            this.dynamicSize = config.initialChunkSize
    }

    async fetchRange(range: ByteRange): Promise<Chunk> {
        console.log("In fetchRange");
        const startTime = performance.now();

        const resp = await fetch(this.videoUrl, { headers: { Range: `bytes=${range.start}-${range.end}` } });

        if (!resp.ok && resp.status !== 206 && resp.status !== 200) {
            throw new Error(`Fetch range failed: ${resp.status}`);
        }

        const contentRange = resp.headers.get('Content-Range');
        let s = range.start, e = range.end, t = undefined as number | undefined;
        if (contentRange) {
            const m = contentRange.match(/bytes (\d+)-(\d+)\/(\d+)/);
            if (m) {
                s = parseInt(m[1], 10);
                e = parseInt(m[2], 10);
                t = parseInt(m[3], 10);
            }
        } else {
            // fallback, try Content-Length and treat as single chunk response
            const len = resp.headers.get('Content-Length');
            if (len) {
                const bytes = parseInt(len, 10);
                s = 0;
                e = bytes - 1;
                // t unknown
            }
        }

        const data = await resp.arrayBuffer();
        const duration = performance.now() - startTime;
        const speed = data.byteLength / (duration / 1000);
        this.dynamicSize = Math.min(
            Math.max(speed * 2, 256_000),
            this.config?.maxChunkSize ?? 4_000_000
        );
        return { data, byteRange: { start: s, end: e, total: t } };
    }

    getChunkSize() { return Math.round(this.dynamicSize); }
}

/* ---------- MediaSourceController ---------- */

class MediaSourceController {
    private mediaSource = new MediaSource();
    private sourceBuffer?: SourceBuffer;
    private appendQueue: Uint8Array[] = [];
    private fetching = false;
    private destroyed = false;
    private sourceOpenResolve?: () => void;
    private currentChunk?: Chunk;
    private nextChunk?: Chunk;
    private pausedTimer?: ReturnType<typeof setTimeout>;

    constructor(
        private video: HTMLVideoElement,
        private videoUrl: string,
        private config?: Partial<PrefetcherConfig>
    ) {
        this.cache = new CacheManager(videoUrl, config?.cacheExpiryMs);
        this.fetcher = new VideoFetcher(videoUrl, config);
        this.video.src = URL.createObjectURL(this.mediaSource);
        this.sourceOpenPromise = new Promise((res) => { this.sourceOpenResolve = res; });
        this.mediaSource.addEventListener('sourceopen', this.onSourceOpen);
        this.mediaSource.addEventListener("sourceopen", () => console.log("MediaSource open"));
        this.mediaSource.addEventListener("sourceended", () => console.log("MediaSource ended"));
        this.mediaSource.addEventListener("sourceclose", () => console.log("MediaSource closed"));
        this.bindLifecycleEvents();
    }

    private sourceOpenPromise: Promise<void>;
    private cache: CacheManager;
    private fetcher: VideoFetcher;

    // private initSource = () => {
    //     this.sourceBuffer = this.mediaSource.addSourceBuffer(
    //         // 'video/mp4; codecs="avc1.64001e"'
    //     );
    // };

    private onSourceOpen = () => {
        try {
            // create SourceBuffer only once
            if (!this.sourceBuffer) {
                const mime = 'video/mp4; codecs="avc1.64001f, mp4a.40.2"';
                if (!MediaSource.isTypeSupported(mime)) {
                    console.error("MIME type not supported:", mime);
                    return;
                }
                console.log("MIME is supported");
                // codec string may need to match your file (mp4/h264 here)
                this.sourceBuffer = this.mediaSource.addSourceBuffer(
                    // 'video/mp4; codecs="avc1.64001e"'
                    // 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
                    mime
                );
                // listen for updateend to flush queue
                this.sourceBuffer.addEventListener('updateend', this.onUpdateEnd);
            }
        } catch (err) {
            console.error('Failed to create SourceBuffer', err);
        } finally {
            // allow fetchInitialChunk to proceed
            if (this.sourceOpenResolve) {
                this.sourceOpenResolve();
                this.sourceOpenResolve = undefined;
            }
            // start fetching only after sourceopen
            this.fetchInitialChunk().catch((e) => console.error('fetchInitialChunk error', e));
        }
    };

    private onUpdateEnd = () => {
        // flush queue
        if (!this.sourceBuffer) return;
        if (this.appendQueue.length > 0 && !this.sourceBuffer.updating) {
            const buf = this.appendQueue.shift()!;
            try {
                this.sourceBuffer.appendBuffer(buf);
            } catch (err) {
                console.error('appendBuffer failed on updateend', err);
            }
        }
    };

    /* ---- Lifecycle events for cache clearing ---- */

    private bindLifecycleEvents() {
        console.log("Event Binding started");
        window.addEventListener('beforeunload', () => this.cache.clear());
        this.video.addEventListener('pause', this.onPause);
        this.video.addEventListener('play', this.onPlay);
        this.video.addEventListener('loadedmetadata', () => {
            // Allow metadata preload (poster, duration)
            // This triggers thumbnail + duration display
            if (this.video.readyState >= 1) {
                console.debug('Metadata loaded:', {
                    duration: this.video.duration,
                    poster: this.video.poster,
                });
            }
        });
    }

    destroy() {
        console.log("Destroying mechanism");
        this.destroyed = true;
        this.cache.clear(); // for iframe unmounts
        this.video.removeEventListener('pause', this.onPause);
        this.video.removeEventListener('play', this.onPlay);
        this.video.removeEventListener('timeupdate', this.onTimeUpdate);
        this.video.removeEventListener('seeking', this.onSeeking);
        this.mediaSource.removeEventListener('sourceopen', this.onSourceOpen);
        if (this.mediaSource.readyState === 'open') {
            try {
                this.mediaSource.endOfStream();
            } catch (_) { }
        }
        if (this.mediaSource.readyState === 'open') {
            try { this.mediaSource.endOfStream(); } catch (_) { }
        }
    }

    private onPause = () => {
        this.pausedTimer = setTimeout(async () => {
            // Keep current & next chunks only
            const keepKeys: string[] = [];
            if (this.currentChunk) keepKeys.push(this.keyFor(this.currentChunk.byteRange));
            if (this.nextChunk) keepKeys.push(this.keyFor(this.nextChunk.byteRange));
            await this.cache.keepOnly(keepKeys);
        }, this.config?.pauseTimeoutMs ?? 1000 * 60 * 5); // 5 min
    };

    private onPlay = () => {
        if (this.pausedTimer) {
            clearTimeout(this.pausedTimer);
            this.pausedTimer = undefined;
        }
    };

    /* ---- Fetching and playback ---- */

    private keyFor(range: ByteRange) { return `${range.start}-${range.end}`; }

    private async fetchInitialChunk() {

        console.log("Initial chunk fetching");
        await this.sourceOpenPromise;
        const size = this.fetcher.getChunkSize();
        const chunk = await this.fetchOrCache(0, size);
        await this.append(chunk);
        this.currentChunk = chunk;
        this.prefetchNext();
        this.video.addEventListener('timeupdate', this.onTimeUpdate);
        this.video.addEventListener('seeking', this.onSeeking);
    }

    private async fetchOrCache(start: number, size: number): Promise<Chunk> {
        console.log("fetching started");
        const end = start + size - 1;
        const key = `${start}-${end}`;
        const cached = await this.cache.get(key);
        console.log("cached", cached);
        if (cached) return cached;
        const chunk = await this.fetcher.fetchRange({ start, end });
        console.log(chunk.byteRange);
        await this.cache.put(key, chunk);
        return chunk;
    }

    private async append(chunk: Chunk) {
        console.log("appending chunk");
        if (!this.sourceBuffer || this.destroyed) {
            console.log("append is called");
            console.log("sourceBuffer:", !!this.sourceBuffer);
            console.log("destroyed:", !!this.destroyed);
            return;
        }

        const view = new Uint8Array(chunk.data);

        if (this.sourceBuffer.updating || this.appendQueue.length > 0) {
            this.appendQueue.push(view);
            return;
        }

        console.log(
            "Appending chunk",
            chunk.byteRange.start,
            "-",
            chunk.byteRange.end,
            "size:",
            chunk.data.byteLength,
            "updating:",
            this.sourceBuffer.updating,
            "readyState:",
            this.mediaSource.readyState
        );

        try {
            this.sourceBuffer.appendBuffer(view);
            console.log(
                "updateend → buffered ranges:",
                Array.from({ length: this.sourceBuffer!.buffered.length }).map((_, i) => ({
                    start: this.sourceBuffer!.buffered.start(i),
                    end: this.sourceBuffer!.buffered.end(i),
                }))
            );
        } catch (err) {
            // fallback: enqueue and let updateend flush
            console.warn('appendBuffer threw, enqueueing instead', err);
            this.appendQueue.push(view);
        }
    }

    private async prefetchNext() {
        console.log("fetching next chunk");
        if (this.fetching || !this.currentChunk) return;
        this.fetching = true;
        const nextStart = this.currentChunk.byteRange.end + 1;
        const size = this.fetcher.getChunkSize();
        try {
            this.nextChunk = await this.fetchOrCache(nextStart, size);
        } finally {
            this.fetching = false;
        }
    }

    private onTimeUpdate = async () => {
        if (
            !this.sourceBuffer ||
            this.mediaSource.readyState !== 'open' ||
            this.destroyed
        ) return;

        let bufferedEnd = 0;
        try {
            if (this.sourceBuffer.buffered.length > 0) {
                bufferedEnd = this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1);
            }
        } catch (e) {
            bufferedEnd = 0;
        }

        if (bufferedEnd - this.video.currentTime < 2 && this.nextChunk && !this.sourceBuffer.updating) {
            await this.append(this.nextChunk);
            this.currentChunk = this.nextChunk;
            this.nextChunk = undefined;
            this.prefetchNext();
        }
    };

    private onSeeking = async () => {

        if (!this.currentChunk) return;

        const total = this.currentChunk.byteRange.total ?? 0;
        if (!total || !this.video.duration) {
            // fallback: just prefetch current next chunk
            this.prefetchNext();
            return;
        }

        const byteStart = Math.floor((this.video.currentTime / this.video.duration) * total);
        const size = this.fetcher.getChunkSize();

        if (!this.sourceBuffer) return;
        const chunk = await this.fetchOrCache(byteStart, size);

        await this.waitForNotUpdating();

        try {
            if (this.sourceBuffer.buffered.length > 0) {
                const start = this.sourceBuffer.buffered.start(0);
                const end = this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1);
                // call remove(); must wait for updateend
                this.sourceBuffer.addEventListener('updateend', async () => {
                    // after removal, append new chunk
                    await this.append(chunk);
                    this.currentChunk = chunk;
                    this.prefetchNext();
                }, { once: true });
                this.sourceBuffer.remove(start, end);
            } else {
                // no buffered ranges, just append
                await this.append(chunk);
                this.currentChunk = chunk;
                this.prefetchNext();
            }
        } catch (err) {
            console.error('Seeking remove/append failed', err);
            // fallback: append anyway
            await this.append(chunk);
            this.currentChunk = chunk;
            this.prefetchNext();
        }
    }
    private waitForNotUpdating(): Promise<void> {
        if (!this.sourceBuffer) return Promise.resolve();
        if (!this.sourceBuffer.updating) return Promise.resolve();
        return new Promise((res) => {
            const cb = () => {
                res();
                this.sourceBuffer?.removeEventListener('updateend', cb);
            };
            this.sourceBuffer!.addEventListener('updateend', cb);
        });
    }
}

/* ---------- React Hook ---------- */

export function useVideoPrefetcher(videoRef: React.RefObject<HTMLVideoElement | null>, videoUrl: string, config?: Partial<PrefetcherConfig>) {
    const controllerRef = useRef<MediaSourceController>(null);

    const startLoading = async () => {
        const video = videoRef.current;
        if (!video || controllerRef.current) return;

        if (video.readyState < 1) {
            await new Promise<void>((res) => {
                const cb = () => { res(); video.removeEventListener('loadedmetadata', cb); };
                video.addEventListener('loadedmetadata', cb);
            });
        }

        if (!video.poster && video.videoWidth > 0 && video.videoHeight > 0) {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d")!;

            try {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (!blob) throw new Error("No blob is found!")
                    video.poster = URL.createObjectURL(blob)
                }, "image/webp");
            } catch (e) {
                console.warn('Failed to draw poster (maybe no frame yet)', e);
            }
        }

        const controller = new MediaSourceController(video, videoUrl, config);
        controllerRef.current = controller;
    }

    const destroyCache = () => {
        controllerRef.current?.destroy();
    }

    useEffect(() => {

        return () => {
            controllerRef.current?.destroy(); // clears cache on iframe/page unmount
            controllerRef.current = null;
        };
    }, []);

    return { startLoading, destroyCache };
}
