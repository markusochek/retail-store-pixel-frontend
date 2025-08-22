"use client";

import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import pictureOfAManOnAuthorization from "@/../public/icons/picture-of-a-man-on-authorization.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";

const Header = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setIsLoggedIn(true);
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');

            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            setIsLoggedIn(false);
            setUser(null);
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleAuthSuccess = () => {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setIsLoggedIn(true);
            setUser(JSON.parse(userData));
        }
    };

    return (
        <header className="flex justify-end items-center p-4 gap-4">
            {isLoggedIn ? (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Image
                            src={pictureOfAManOnAuthorization}
                            alt="User avatar"
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                    >
                        Выйти
                    </button>
                </div>
            ) : (
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={() => setIsAuthModalOpen(true)}
                >
                    <Image
                        src={pictureOfAManOnAuthorization}
                        alt="Login"
                        width={24}
                        height={24}
                    />
                    <span className="text-sm">Войти</span>
                </div>
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => {
                    setIsAuthModalOpen(false);
                    handleAuthSuccess();
                }}
            />
        </header>
    );
};

export default Header;