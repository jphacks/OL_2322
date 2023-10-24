import React, { FC, useState, useEffect } from "react";
import s from "./SideBar.module.css";

interface Channel {
    id: number;
    channel_id: string;
    name: string;
    creator: string;
    is_private: boolean;
    created_at: string;
    updated_at: string;
}

interface SideBarProps {
    setSelectedChannel: (channel_ids: string[]) => void;
}

const SideBar: FC<SideBarProps> = ({ setSelectedChannel }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
    const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
    const API_URL = process.env.API_URL;

    useEffect(() => {
        fetch(`${API_URL}/api/v1/channels`)
            .then((response) => response.json())
            .then((data) => {
                setChannels(data);
            })
            .catch((error) => {
                console.error("Error fetching channels:", error);
            });
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleChannelClick = (channel: Channel) => {
        console.log(`Switched to channel: ${channel.name}`);
        console.log("Clicked channel:", channel);
        setSelectedChannelIds((prevSelectedChannelIds) => {
            let updatedSelectedChannelIds;
            if (prevSelectedChannelIds.includes(channel.channel_id)) {
                updatedSelectedChannelIds = prevSelectedChannelIds.filter((id) => id !== channel.channel_id);
            } else {
                if (prevSelectedChannelIds.length < 2) {
                    updatedSelectedChannelIds = [...prevSelectedChannelIds, channel.channel_id];
                } else {
                    updatedSelectedChannelIds = [prevSelectedChannelIds[1], channel.channel_id];
                }
            }
            console.log("Updated selected channel IDs:", updatedSelectedChannelIds);
            setSelectedChannel(updatedSelectedChannelIds);
            return updatedSelectedChannelIds;
        });
    };

    return (
        <div className={s.sideBarContainer}>
            <div className={s.teamNameContent}>
                <p>TMLlab</p>
            </div>
            <div className={s.sideBarContent}>
                <div className={s.mainNavContent}>
                    <div className={s.mainButtonContent}>
                        <button className={s.mainButton}>{"# " + "canvas"}</button>
                        <button className={s.mainButton}>{"# " + "すべてのチャンネル"}</button>
                        <button className={s.mainButton}>{"# " + "ファイル"}</button>
                        <button className={s.mainButton}>{"# " + "メンバーディレクトリ"}</button>
                        <button className={s.mainButton}>{"# " + "その他"}</button>
                    </div>
                </div>

                <div className={s.channelNavContent}>
                    <div className={s.channelButtonContent}>
                        {channels.map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => handleChannelClick(channel)}
                                className={`
                                ${s.channelButton} 
                                ${selectedChannelIds.includes(channel.channel_id) ? s.selectedChannelButton : ""}
                            `}
                            >
                                {"# " + channel.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SideBar;
