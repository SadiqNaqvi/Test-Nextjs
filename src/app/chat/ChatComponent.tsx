"use client";

import { useEffect, useState } from "react";
import { getAbly } from "./utils";
import NotificationButton from "./NotificationButton"

type payload = { id: string, sender: string, status: string, type: string };
type Message = payload & { message: string }

const ChatComponent = ({ client_id }: { client_id: string }) => {
    const realtime = getAbly(client_id);

    const [messages, setMessages] = useState<Message[]>([]);

    const showMessage = (message: { text: string, metadata: payload }) => {
        const { text, metadata } = message;

        const { id, status, sender, type } = metadata as Message;

        if (type === "notification" && sender === client_id) return;

        setMessages((prev) => {

            const prevMessage = prev.filter(el => el.id !== id);

            return [...prevMessage, { id, status, sender, message: text, type }];
        });
    }

    const channel = realtime.channels.get("test-channel");
    const leaveRoom = () => {
        channel.presence.leave({ sender: client_id });
    }

    useEffect(() => {
        channel.subscribe("test-message", ({ data }: any) => showMessage(data));

        channel.presence.subscribe("enter", ({ data }: any) => showMessage({
            text: `${data.sender} entered the chat`,
            metadata: { id: Date.now().toString(36), sender: data.sender, status: "sent", type: "notification" }
        }));

        channel.presence.subscribe("update", ({ data }: any) => showMessage({
            text: `${data.sender} updated their presence`,
            metadata: { id: Date.now().toString(36), sender: data.sender, status: "sent", type: "notification" }
        }));

        channel.presence.subscribe("leave", ({ data }: any) => showMessage({
            text: `${data.sender} left the chat with ${messages.length} messages`,
            metadata: { id: Date.now().toString(36), sender: data.sender, status: "sent", type: "notification" }
        }));

        channel.presence.enter({ sender: client_id });

        return leaveRoom;
    }, [channel]);

    useEffect(() => {
        const pageHide = () => sendMessage({ message: `${client_id} page hide` }, "notification")
        window.addEventListener("pagehide", pageHide);

        const pageshow = () => sendMessage({ message: `${client_id} page show` }, "notification")
        window.addEventListener("pageshow", pageshow);

        const pageblur = () => sendMessage({ message: `${client_id} page blur` }, "notification")
        window.addEventListener("blur", pageblur);

        const beforeunload = () => sendMessage({ message: `${client_id} before upload` }, "notification")
        window.addEventListener("beforeunload", beforeunload);

        const visibilityChange = () => sendMessage({ message: `${client_id} visibility changed` }, "notification")
        document.addEventListener("visibilitychange", visibilityChange);
        return () => {
            window.removeEventListener("pagehide", pageHide);
            window.removeEventListener("pageshow", pageshow);
            window.removeEventListener("blur", pageblur);
            window.removeEventListener("beforeunload", beforeunload);
            document.removeEventListener("visibilitychange", visibilityChange);
        }
    }, []);

    const sendMessage = async (data: { message: string }, type?: "notification" | "message") => {
        const { message } = data;
        if (message.trim().length === 0) return;
        const metadata = {
            sender: client_id,
            status: "sending",
            id: Date.now().toString(36),
            type: type ?? "message",
        }

        if (type !== "notification") setMessages([...messages, { message, ...metadata }]);
        try {
            await channel.publish('test-message', { text: message, metadata: { ...metadata, status: "sent" } });
        } catch (err: any) {

        }
    }

    const send = async (data: FormData) => {
        const message = data.get("message")?.toString();
        if (!message) return;
        sendMessage({ message });
        fetch('/api/ably', { method: "POST" }).then(async r => {
            if (r.status === 500) {
                alert(await r.text())
            }
        });
    }

    return (
        <main>
            <header className="p-4 flex flex-cntr-between">
                <div>
                    <h1 className="text-xl font-semibold">Chat Room</h1>
                    <p className="text-sm">You - {client_id}</p>
                </div>
                <NotificationButton cid={client_id} />
            </header>
            <section className="w-full min-h-[100dvh] pb-28">
                <ul className="space-y-4 sm:px-4">
                    {messages.map(({ id, message, sender, status, type }) => {
                        if (type === "notification") return (
                            <li className="text-center text-zinc-500" key={id}>{message}</li>
                        )

                        return (
                            <li className={`w-full flex gap-2 flex-col ${sender === client_id ? "items-end" : ""} p-2`} key={id}>
                                <p className="text-sm text-zinc-500">{sender === client_id ? "You" : sender}</p>
                                <div className={`py-2 px-4 border border-gray-500 w-fit messageBubble ${sender === client_id ? "send" : "recieved"}`}>
                                    <p>{message}</p>
                                    <p className="text-xs mt-1 text-zinc-500">{status}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </section>
            <footer className="fixed bg-zinc-800 bottom-0 p-4 w-full">
                <form action={send}>
                    <input className="px-4 py-2 bg-transparent rounded-md border border-gray-500 w-full" name="message" />
                </form>
            </footer>
        </main >
    )
}

export default ChatComponent;