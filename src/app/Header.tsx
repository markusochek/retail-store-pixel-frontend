"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";
import pictureOfAManOnAuthorization from "@/../public/icons/picture-of-a-man-on-authorization.png";
import Image from "next/image";

const Header = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <header className="flex justify-end p-4">
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsAuthModalOpen(true)}
            >
                <Image
                    src={pictureOfAManOnAuthorization}
                    alt={""}
                    width={24}
                    height={24}
                />
                <span>Войти</span>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </header>
    );
};

export default Header;