"use client";

import { useState } from "react";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

type FormData = {
    email: string;
    password: string;
};

type AuthMode = "login" | "register";

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [mode, setMode] = useState<AuthMode>("login");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError("");

        try {
            const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
            const response = await axios.post(endpoint, data);

            if (response.status === 200 || response.status === 201) {
                if (response.data.accessToken) {
                    localStorage.setItem('accessToken', response.data.accessToken);
                }

                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                router.refresh();
                onClose();
                reset();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                "Произошла ошибка";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === "login" ? "register" : "login");
        setError("");
        reset();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={{
                overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
                content: {
                    top: "50%",
                    left: "50%",
                    right: "auto",
                    bottom: "auto",
                    transform: "translate(-50%, -50%)",
                    maxWidth: "400px",
                    width: "90%",
                },
            }}
        >
            <h2 className="text-xl font-bold mb-4">
                {mode === "login" ? "Вход" : "Регистрация"}
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block mb-1 text-sm font-medium">Email</label>
                    <input
                        {...register("email", {
                            required: "Обязательное поле",
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Некорректный email"
                            }
                        })}
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="example@mail.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium">Пароль</label>
                    <input
                        {...register("password", {
                            required: "Обязательное поле",
                            minLength: {
                                value: 6,
                                message: "Минимум 6 символов"
                            }
                        })}
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Введите пароль"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={switchMode}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    disabled={isLoading}
                >
                    {mode === "login"
                        ? "Нет аккаунта? Зарегистрируйтесь"
                        : "Уже есть аккаунт? Войдите"}
                </button>
            </div>
        </Modal>
    );
};

export default AuthModal;