"use client";

import { checkPushStatus, disablePush, enablePush } from "./notifications"

const NotificationButton = ({ cid }: { cid: string }) => {

    if (checkPushStatus() === "granted")
        return <button className="p-2 border border-gray-500 rounded-md" onClick={() => disablePush(cid)}>D</button>

    else
        return <button className="p-2 border border-gray-500 rounded-md" onClick={() => enablePush(cid)}>E</button>
}

export default NotificationButton;