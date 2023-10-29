import React, { FC } from "react";
import s from "./HelpModal.module.css";

const HelpModal: FC<{ onClose: () => void }> = ({ onClose }) => {
    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={s.modalContainer} onClick={handleOutsideClick}>
            <div className={s.modalInnerContainer}>
                <div className={s.modalContent}>
                    <div className={s.apptitle}>
                        <p>Slack-Message-Finder</p>
                    </div>
                    <div className={s.content}>
                        <p>・SlackBotを使用して、Slackからログをリアルタイムで保存していきます</p>
                        <p>・基本操作はSlackと同じです</p>
                        <p>・Slackと違う点として、チャンネルを2つ同時に表示できます</p>
                        <div className={s.person}>
                            <div className={s.personExp}>
                                <p>・製作者</p>
                            </div>
                            <div className={s.personName}>
                                <p className={s.name}>
                                    ：若月
                                    <a style={{ margin: "35px" }} href="https://github.com/KokiWakatsuki" target="_blank" rel="noopener noreferrer">
                                        github
                                    </a>
                                    インフラ、テーブル担当
                                </p>
                                <p className={s.name}>
                                    ：飯田
                                    <a style={{ margin: "35px" }} href="https://github.com/YosukeIida" target="_blank" rel="noopener noreferrer">
                                        github
                                    </a>
                                    bot (python) 担当
                                </p>
                                <p className={s.name}>
                                    ：髙須賀
                                    <a style={{ marginLeft: "20px", marginRight: "35px" }} href="https://github.com/takumi0616" target="_blank" rel="noopener noreferrer">
                                        github
                                    </a>
                                    フロント、バック担当
                                </p>
                            </div>
                        </div>

                        <p>・使用技術</p>
                        <p>Next.js, React, TypeScript, Ruby on Rails, postgreSQL, python</p>
                        <p>SlackBot API, Google API, CloudFlare, proxmox</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
