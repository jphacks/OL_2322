import { Inter } from "next/font/google";
import React from "react";
import Header from "../components/common/Header";
import ChannelPage from "./ChannelPage";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    return (
        <>
            <Header />
            <ChannelPage />
        </>
    );
}
