"use client";

import { useState } from "react";
import LoginPage from "./login";
import ChatComponent from "./ChatComponent";

const ChatPage = () => {

    const [client, setClient] = useState('');

    const login = (c: string) => {
        setClient(c)
    }

    if (client) return <ChatComponent client_id={client} />
    else return <LoginPage login={login} />
}

export default ChatPage;