import React from "react";
import { VictoryChart, VictoryLine, VictoryAxis } from "victory";

interface GraphProps {
    data?: { date: string; messages_count: number }[]; // dataプロパティをオプショナルにする
    maxY?: number;
}

const Graph: React.FC<GraphProps> = ({ data, maxY }) => {
    // dataが空の配列かどうかを確認
    const noData = !data || data.length === 0;

    if (noData) {
        return <p>過去1週間発言なし</p>;
    }

    const transformedData = data.map((item) => ({
        x: new Date(item.date),
        y: item.messages_count,
    }));

    const tickValues = data.map((item) => new Date(item.date)); // 各日付に対してティックを設定

    return (
        <VictoryChart width={800}>
            <VictoryAxis
                tickValues={tickValues} // tickValuesプロパティを設定
                tickFormat={(x) => {
                    const date = new Date(x);
                    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                }}
                style={{
                    axis: { stroke: "white" },
                    ticks: { stroke: "white" },
                    tickLabels: { fill: "white" },
                    grid: { stroke: "grey" },
                }}
            />
            <VictoryAxis
                dependentAxis
                domain={maxY !== undefined ? [0, maxY] : undefined}
                style={{
                    axis: { stroke: "white" },
                    ticks: { stroke: "white" },
                    tickLabels: { fill: "white" },
                    grid: { stroke: "grey" },
                }}
            />
            <VictoryLine
                data={transformedData}
                style={{
                    data: { stroke: "white" },
                }}
            />
        </VictoryChart>
    );
};

export default Graph;
