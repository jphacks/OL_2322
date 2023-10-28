import React, { FC, useCallback, useEffect, useState } from "react";
import s from "./GraphModal.module.css";
import Graph from "@/components/common/Graph";

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

interface AnalysisMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const GraphModal: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [userMessageData, setUserMessageData] = useState<UserMessageData[]>([]);
    const [maxY, setMaxY] = useState<number>(0);
    const [analysisResults, setAnalysisResults] = useState<{ [key: string]: string }>({});
    const GPT_API_KEY = process.env.GPT_API_KEY;
    const API_URL = process.env.API_URL;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetch(`${API_URL}/api/v1/users`);
                if (!userResponse.ok) {
                    throw new Error("ユーザーデータの取得に失敗しました");
                }
                const users: User[] = await userResponse.json();
                const data = [];
                for (const user of users) {
                    const messageResponse = await fetch(`${API_URL}/api/v1/messages/allmessage/${user.user_id}`);
                    const messageData = await messageResponse.json();
                    data.push({
                        user_id: user.user_id,
                        display_name: user.display_name,
                        data: messageData.user_messages,
                    });
                }
                setUserMessageData(data);

                const maxYValue = data.reduce((max, userData) => {
                    if (userData.data) {
                        const userMax = Math.max(...userData.data.map((item: { messages_count: any }) => item.messages_count));
                        return Math.max(max, userMax);
                    }
                    return max;
                }, 0);
                setMaxY(maxYValue);

                const analysisPromises = data.map(async (userData) => {
                    const aggregateText = userData.data.map((item: { date: string; messages_count: string }) => item.date + "、" + item.messages_count).join("。");
                    const analysis = await analyzeText(userData.display_name, aggregateText);
                    return {
                        user_id: userData.user_id,
                        analysis: analysis,
                    };
                });

                const analysisData = await Promise.all(analysisPromises);
                const newAnalysisResults = analysisData.reduce((results, data) => {
                    results[data.user_id] = data.analysis;
                    return results;
                }, {} as { [key: string]: string });
                setAnalysisResults(newAnalysisResults);
            } catch (error: any) {
                console.error("fetchUserData内でエラーが発生しました:", error.message);
            }
        };
        fetchUserData();
    }, []);

    const analyzeText = async (display_name: string, text: string): Promise<string> => {
        const truncatedText = text.length > 10000 ? text.substring(0, 10000) : text;
        const messages: AnalysisMessage[] = [
            {
                role: "user",
                content: `${display_name}さんの発言です、要約してください: ${truncatedText}`,
            },
        ];

        const body = JSON.stringify({
            messages,
            model: "gpt-3.5-turbo",
        });

        try {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${GPT_API_KEY}`,
                },
                body,
            });

            if (!res.ok) {
                if (res.status === 429) {
                    console.error("Rate limit exceeded, retrying in 60 seconds...");
                    await new Promise((res) => setTimeout(res, 60000));
                    return await analyzeText(display_name, text);
                }

                const errorDetail = await res.text();
                console.error("Failed to analyze text:", errorDetail);
                return "";
            }

            const data = await res.json();
            const choice = 0;
            return data.choices[choice].message.content;
        } catch (error: any) {
            console.error("analyzeText内でエラーが発生しました:", error.message);
            return "";
        }
    };

    const handleAnalyzeButtonClick = useCallback(async (userId: string, display_name: string) => {
        try {
            const aggregateTextResponse = await fetch(`${API_URL}/api/v1/messages/aggregate_text/${userId}`);
            if (!aggregateTextResponse.ok) {
                throw new Error(`Failed to fetch aggregate text for user ${userId}`);
            }
            const aggregateTextData = await aggregateTextResponse.json();
            const aggregateText = aggregateTextData.aggregated_text.join("。");

            const analysis = await analyzeText(display_name, aggregateText);

            setAnalysisResults((prevResults) => ({
                ...prevResults,
                [userId]: analysis,
            }));
        } catch (error: any) {
            console.error("ボタンクリック時にエラーが発生しました:", error.message);
        }
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
                        <p>最近のユーザーの発言 ({formattedDate})</p>
                    </div>
                    <div className={s.content}>
                        {userMessageData.map((userData, index) =>
                            userData.display_name ? (
                                <div key={index} className={s.onebox}>
                                    <p>{userData.display_name}</p>
                                    <Graph data={userData.data} maxY={maxY} />
                                    <div className={s.analysis}>
                                        <button onClick={() => handleAnalyzeButtonClick(userData.user_id, userData.display_name)}>1週間の発言要約</button>
                                        <p>{analysisResults[userData.user_id]}</p>
                                    </div>
                                </div>
                            ) : null
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphModal;
