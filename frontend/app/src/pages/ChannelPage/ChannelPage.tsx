import React, { FC, useState, useEffect } from "react";
import SideBar from "@/components/common/SideBar";
import ReplyBar from "@/components/common/ReplyBar";
import MessageBox from "@/components/common/MessageBox";
import s from "./ChannelPage.module.css";
import { channel } from "diagnostics_channel";

interface Channel {
    id: number;
    channel_id: string;
    name: string;
    creator: string;
    is_private: boolean;
    created_at: string;
    updated_at: string;
}

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

interface User {
    user_id: string;
    email: string;
    image: string;
    real_name: string;
    showInfo: boolean;
}

interface MessageGroup {
    parent: ParentMessage;
    children: ChildMessage[];
    thread: ThreadMessage[];
}

const ChannelPage: FC = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel1, setSelectedChannel1] = useState<Channel | null>(null);
    const [selectedChannel2, setSelectedChannel2] = useState<Channel | null>(null);
    const [messageGroups1, setMessageGroups1] = useState<MessageGroup[]>([]);
    const [messageGroups2, setMessageGroups2] = useState<MessageGroup[]>([]);
    const [selectedMessageGroup1, setSelectedMessageGroup1] = useState<MessageGroup | null>(null);
    const [selectedMessageGroup2, setSelectedMessageGroup2] = useState<MessageGroup | null>(null);
    const [users1, setUsers1] = useState<User[]>([]);
    const [users2, setUsers2] = useState<User[]>([]);
    const API_URL = process.env.API_URL;

    useEffect(() => {
        // console.log(`${API_URL}` + "/api/v1/channels")
        fetch(`${API_URL}/api/v1/channels`)
            .then((response) => response.json())
            .then((data: Channel[]) => {
                setChannels(data);
                const initialChannel1 = data.find((ch) => ch.channel_id === "channel_id1");
                const initialChannel2 = data.find((ch) => ch.channel_id === "channel_id2");
                setSelectedChannel1(initialChannel1 ?? null);
                setSelectedChannel2(initialChannel2 ?? null);
            });
    }, []);

    useEffect(() => {
        if (selectedChannel1) {
            fetch(`${API_URL}/api/v1/channels/${selectedChannel1.channel_id}/messages`)
                .then((response) => response.json())
                .then((data) => {
                    setMessageGroups1(data.grouped_messages);
                    setUsers1(data.users);
                });
        } else {
            setMessageGroups1([]);
            setUsers1([]);
        }
        setSelectedMessageGroup1(null);
    }, [selectedChannel1]);

    useEffect(() => {
        if (selectedChannel2) {
            fetch(`${API_URL}/api/v1/channels/${selectedChannel2.channel_id}/messages`)
                .then((response) => response.json())
                .then((data) => {
                    setMessageGroups2(data.grouped_messages);
                    setUsers2(data.users);
                });
        } else {
            setMessageGroups2([]);
            setUsers2([]);
        }
        setSelectedMessageGroup2(null);
    }, [selectedChannel2]);

    const handleToggleChildren1 = (messageGroup: MessageGroup) => {
        setSelectedMessageGroup1((prevMessageGroup) => (prevMessageGroup && prevMessageGroup.parent.id === messageGroup.parent.id ? null : messageGroup));
    };

    const handleToggleChildren2 = (messageGroup: MessageGroup) => {
        setSelectedMessageGroup2((prevMessageGroup) => (prevMessageGroup && prevMessageGroup.parent.id === messageGroup.parent.id ? null : messageGroup));
    };

    return (
        <>
            <div className={s.container}>
                <div className={s.sidebar}>
                    <SideBar
                        setSelectedChannel={(channel_ids: string[]) => {
                            if (channel_ids.length > 0) {
                                const selectedChannelId1 = channel_ids[0];
                                const channel1 = channels.find((ch) => ch.channel_id === selectedChannelId1);
                                if (channel1) {
                                    setSelectedChannel1(channel1);
                                }
                            } else {
                                setSelectedChannel1(null);
                            }

                            if (channel_ids.length > 1) {
                                const selectedChannelId2 = channel_ids[1];
                                const channel2 = channels.find((ch) => ch.channel_id === selectedChannelId2);
                                if (channel2) {
                                    setSelectedChannel2(channel2);
                                }
                            } else {
                                setSelectedChannel2(null);
                            }
                        }}
                    />
                </div>

                <div className={s.mainPage}>
                    <div className={s.allbox} style={{ height: selectedChannel2 ? "50%" : "100%" }}>
                        <div className={s.messagesBox} style={{ flex: selectedMessageGroup1 ? 6 : 1 }}>
                            <div className={s.channeltitle}>
                                <div>
                                    <p className={s.ptitle}>{selectedChannel1 ? selectedChannel1.name : ""}</p>
                                </div>
                                <div className={s.imgBox}>
                                    {users1.map((user) => (
                                        <div key={user.user_id} onMouseEnter={() => setUsers1(users1.map((u) => (u.user_id === user.user_id ? { ...u, showInfo: true } : { ...u, showInfo: false })))} onMouseLeave={() => setUsers1(users1.map((u) => ({ ...u, showInfo: false })))}>
                                            <img className={s.img} src={user.image} alt={user.real_name} />
                                            {user.showInfo && (
                                                <div className={s.userInfo}>
                                                    <div>
                                                        <p className={s.pinfo}>{user.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className={s.pinfo}>{user.real_name}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={s.box} style={{ borderTop: selectedChannel1 ? "6px solid #3e3d3d" : "" }}>
                                {messageGroups1.map((messageGroup) => (
                                    <MessageBox key={messageGroup.parent.id} messageGroup={messageGroup} onReplyClick={() => handleToggleChildren1(messageGroup)} />
                                ))}
                            </div>
                        </div>
                        {selectedMessageGroup1 ? (
                            <div className={s.replyBar} style={{ flex: selectedMessageGroup1 ? 4 : 0 }}>
                                <div className={s.threadltitle}>
                                    <p>スレッド</p>
                                </div>
                                <div className={s.box} style={{ borderTop: selectedChannel1 ? "6px solid #3e3d3d" : "" }}>
                                    <div className={s.replybox}>{selectedMessageGroup1 && <ReplyBar messageGroup={selectedMessageGroup1} />}</div>
                                </div>
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>

                    {selectedChannel2 && (
                        <div className={s.allbox2}>
                            <div className={s.messagesBox} style={{ flex: selectedMessageGroup2 ? 6 : 1 }}>
                                <div className={s.channeltitle}>
                                    <div>
                                        <p className={s.ptitle}>{selectedChannel2.name}</p>
                                    </div>
                                    <div className={s.imgBox}>
                                        {users2.map((user) => (
                                            <div key={user.user_id} onMouseEnter={() => setUsers2(users2.map((u) => (u.user_id === user.user_id ? { ...u, showInfo: true } : { ...u, showInfo: false })))} onMouseLeave={() => setUsers2(users2.map((u) => ({ ...u, showInfo: false })))}>
                                                <img className={s.img} src={user.image} alt={user.real_name} />
                                                {user.showInfo && (
                                                    <div className={s.userInfo}>
                                                        <div>
                                                            <p className={s.pinfo}>{user.email}</p>
                                                        </div>
                                                        <div>
                                                            <p className={s.pinfo}>{user.real_name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={s.box} style={{ borderTop: selectedChannel1 ? "6px solid #3e3d3d" : "" }}>
                                    {messageGroups2.map((messageGroup) => (
                                        <MessageBox key={messageGroup.parent.id} messageGroup={messageGroup} onReplyClick={() => handleToggleChildren2(messageGroup)} />
                                    ))}
                                </div>
                            </div>
                            {selectedMessageGroup2 ? (
                                <div
                                    className={s.replyBar}
                                    style={{
                                        flex: selectedMessageGroup2 ? 4 : 0,
                                    }}
                                >
                                    <div className={s.threadltitle}>
                                        <p>スレッド</p>
                                    </div>
                                    <div className={s.box} style={{ borderTop: selectedChannel1 ? "6px solid #3e3d3d" : "" }}>
                                        <div className={s.replybox}>{selectedMessageGroup2 && <ReplyBar messageGroup={selectedMessageGroup2} />}</div>
                                    </div>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChannelPage;
