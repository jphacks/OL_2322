import React, { FC, useEffect, useState } from "react";
import s from "./GraphModal.module.css";
import Graph from '@/components/common/Graph';

interface User {
    user_id: string;
    display_name: string;
}

interface MessageData {
    date: string;
    messages_count: number;
}

interface UserMessageData {
    user_id: string;
    display_name: string;
    data: MessageData[];
}

const GraphModal: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [userMessageData, setUserMessageData] = useState<UserMessageData[]>([]);
    const [maxY, setMaxY] = useState<number>(0);  // y軸の最大値を保持するためのstateを追加

    useEffect(() => {
        const fetchUserData = async () => {
            const userResponse = await fetch('http://localhost:3000/api/v1/users');
            const users: User[] = await userResponse.json();
            const dataPromises = users.map(async user => {
                const messageResponse = await fetch(`http://localhost:3000/api/v1/messages/allmessage/${user.user_id}`);
                const messageData = await messageResponse.json();
                return {
                    user_id: user.user_id,
                    display_name: user.display_name,
                    data: messageData.user_messages,
                };
            });
            const data = await Promise.all(dataPromises);
            setUserMessageData(data);

            // y軸の最大値を計算
            const maxYValue = data.reduce((max, userData) => {
                if (userData.data) {  // userData.dataの存在を確認
                    const userMax = Math.max(...userData.data.map((item: { messages_count: any; }) => item.messages_count));
                    return Math.max(max, userMax);
                }
                return max;
            }, 0);
            setMaxY(maxYValue);
        };
        fetchUserData();
    }, []);

    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    return (
        <div className={s.modalContainer} onClick={handleOutsideClick}>
            <div className={s.modalInnerContainer}>
                <div className={s.modalContent}>
                    <div className={s.apptitle}>
                        <p>最近の発言    ({formattedDate})</p>
                    </div>
                    <div className={s.content}>
                    {userMessageData.map((userData, index) => (
                        userData.display_name ? (  // display_nameの存在を確認
                            <div key={index} className={s.onebox}>
                                <p>{userData.display_name}</p>
                                <Graph data={userData.data} maxY={maxY} />
                            </div>
                        ) : null  // display_nameが存在しない場合は何もレンダリングしない
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
};

export default GraphModal;
