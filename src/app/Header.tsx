"use client";

import { useState } from "react";
import { getIconPath } from "@/app/lib/helpers/icons";
import AuthModal from "./AuthModal";

const Header = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <header className="flex justify-end p-4">
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsAuthModalOpen(true)}
            >
                <img
                    src={getIconPath("yumminky-pc-43-1024.webp")}
                    alt=""
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