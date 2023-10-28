import React, { FC, useState } from "react";
import s from "./Header.module.css";
import HelpModal from "@/components/modal/HelpModal";
import GraphModal from "@/components/modal/GraphModal";

const Header: FC = () => {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

    const handleOpenHelpModal = () => {
        setIsHelpModalOpen(true);
    };

    const handleCloseHelpModal = () => {
        setIsHelpModalOpen(false);
    };

    const handleOpenGraphModal = () => {
        setIsGraphModalOpen(true);
    };

    const handleCloseGraphModal = () => {
        setIsGraphModalOpen(false);
    };

    return (
        <section>
            <header className={s.headerContent}>
                <div className={s.flexContainer}>
                    <div className={s.titleContainer}>
                        <p className={s.title}>Message-Log-Viewer</p>
                    </div>

                    <div className={s.searchInputContainer}>
                        <div className={s.inputContainer}>
                            <img src="magnifyingGlass.svg" alt="magnifyingGlass.svg" className={s.img1} />
                            <input type="text" placeholder="TMLlab内を検索する" className={s.searchInput} />
                        </div>
                    </div>

                    <div className={s.graphbuttonContainer}>
                        <button className={s.GraphButton} onClick={handleOpenGraphModal}>
                            <img src="Group 12.svg"  className={s.img2}  />
                        </button>
                    </div>

                    <div className={s.buttonContainer}>
                        <button className={s.helpButton} onClick={handleOpenHelpModal}>
                            ?
                        </button>
                    </div>
                </div>
            </header>
            {isGraphModalOpen && <GraphModal onClose={handleCloseGraphModal} />}
            {isHelpModalOpen && <HelpModal onClose={handleCloseHelpModal} />}
        </section>
    );
};

export default Header;
