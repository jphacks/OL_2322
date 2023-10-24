import React, { FC, useState, useEffect } from "react";
import s from "@/components/common/ReplyBar/ReplyBar.module.css";
interface ParentMessage {
    id: number;
    user_id: string;
    ts: string;
    thread_ts: string | null;
    text: string;
    image_name: string | null;
    image_url: string | null;
    url: string | null;
    channel_id: string;
    created_at: string;
    updated_at: string;
}

interface ChildMessage {
    id: number;
    user_id: string;
    ts: string;
    thread_ts: string | null;
    text: string;
    image_name: string | null;
    image_url: string | null;
    url: string | null;
    channel_id: string;
    created_at: string;
    updated_at: string;
}

interface ThreadMessage {
    id: number;
    user_id: string;
    ts: string;
    thread_ts: string | null;
    text: string;
    image_name: string | null;
    image_url: string | null;
    url: string | null;
    channel_id: string;
    created_at: string;
    updated_at: string;
}
interface MessageGroup {
    parent: ParentMessage;
    children: ChildMessage[];
    thread: ThreadMessage[];
}

interface ReplyBarProps {
    messageGroup: MessageGroup;
}

interface User {
    display_name: string;
    image: string;
}

interface UserMap {
    [key: string]: User;
}

const ReplyBar: FC<ReplyBarProps> = ({ messageGroup }) => {
    const { parent, thread } = messageGroup;
    const SLACK_ENTERPRISE_TOKEN = process.env.NEXT_PUBLIC_SLACK_ENTERPRISE_TOKEN;
    const API_URL = process.env.API_URL;
    const [userMap, setUserMap] = useState<UserMap>({});

    useEffect(() => {
        const userIds = [parent.user_id, ...thread.map((threadMessage) => threadMessage.user_id)];
        const uniqueUserIds = Array.from(new Set(userIds));
        Promise.all(
            uniqueUserIds.map((userId) =>
                fetch(`${API_URL}/api/v1/users/${userId}`)
                    .then((response) => response.json())
                    .then((data) => ({ userId, data }))
            )
        ).then((results) => {
            const newUserMap: UserMap = {};
            results.forEach((result) => {
                newUserMap[result.userId] = result.data;
            });
            setUserMap(newUserMap);
        });
    }, [parent.user_id, thread]);

    const formatDateTime = (isoString: string) => {
        const dateObj = new Date(isoString);
        const formattedDate = dateObj.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
        const formattedTime = dateObj.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false });
        return `${formattedDate} - ${formattedTime}`;
    };

    const renderContent = (text: string | null, url: string | null, imageUrl: string | null) => {
        if (text && url && imageUrl) {
            return (
                <>
                    <p className={s.p}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            {text}
                        </a>
                    </p>
                    <p className={s.p}>
                        <img src={imageUrl + "?t=" + SLACK_ENTERPRISE_TOKEN} alt="Image" />
                    </p>
                </>
            );
        }
        if (text && url) {
            return (
                <p className={s.p}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        {text}
                    </a>
                </p>
            );
        }
        if (text && imageUrl) {
            return (
                <>
                    <p className={s.p}>{text}</p>
                    <p className={s.p}>
                        <img src={imageUrl + "?t=" + SLACK_ENTERPRISE_TOKEN} alt="Image" />
                    </p>
                </>
            );
        }
        if (url && imageUrl) {
            return (
                <>
                    <p className={s.p}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            {url}
                        </a>
                    </p>
                    <p className={s.p}>
                        <img src={imageUrl + "?t=" + SLACK_ENTERPRISE_TOKEN} alt="Image" />
                    </p>
                </>
            );
        }
        if (text) {
            return <p className={s.p}>{text}</p>;
        }
        if (url) {
            return (
                <p className={s.p}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                    </a>
                </p>
            );
        }
        if (imageUrl) {
            return (
                <p className={s.p}>
                    <img src={imageUrl + "?t=" + SLACK_ENTERPRISE_TOKEN} alt="Image" />
                </p>
            );
        }
        return null;
    };

    return (
        <div key={parent.id}>
            <div>
                <div className={s.onebox}>
                    <div className={s.imgbox}>{userMap[parent.user_id] ? <img className={s.img} src={userMap[parent.user_id].image} alt={userMap[parent.user_id].display_name} /> : <img className={s.img} src="Group 10.svg" alt="default icon" />}</div>
                    <div>
                        <div className={s.nameTimeBox}>
                            {userMap[parent.user_id] && <p className={s.pname}>{userMap[parent.user_id]?.display_name || "Loading..."}</p>}
                            {parent.created_at && <p className={s.ptime}>{formatDateTime(parent.created_at)}</p>}
                        </div>
                        <div>{renderContent(parent.text, parent.url, parent.image_url)}</div>
                    </div>
                </div>

                <div className={s.replyWord}>
                    <p className={s.pword}>{thread.length} 件の返信</p>
                </div>

                <div className="children">
                    {thread.map((threadMessage) => (
                        <>
                            <div key={threadMessage.id} className={s.onebox}>
                                <div className={s.imgbox}>{userMap[threadMessage.user_id] ? <img className={s.img} src={userMap[threadMessage.user_id].image} alt={userMap[threadMessage.user_id].display_name} /> : <img className={s.img} src="Group 10.svg" alt="default icon" />}</div>

                                <div>
                                    <div className={s.nameTimeBox}>
                                        {userMap[threadMessage.user_id] && <p className={s.pname}>{userMap[threadMessage.user_id]?.display_name || "Loading..."}</p>}
                                        {threadMessage.created_at && <p className={s.ptime}>{formatDateTime(threadMessage.created_at)}</p>}
                                    </div>
                                    {renderContent(threadMessage.text, threadMessage.url, threadMessage.image_url)}
                                </div>
                            </div>
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReplyBar;
