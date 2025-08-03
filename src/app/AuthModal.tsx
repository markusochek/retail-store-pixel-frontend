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

import React from 'react';

type AuthMode = "login" | "register";

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [mode, setMode] = useState<AuthMode>("login");
    const [error, setError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        try {
            const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
            const response = await axios.post(endpoint, data);

            if (response.data.success) {
                router.refresh();
                onClose();
                reset();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Произошла ошибка");
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
            <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>
            {error && <p className="text-red-500">{error}</p>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block mb-1">email</label>
                    <input
                        {...register("email", { required: "Обязательное поле" })}
                        className="w-full p-2 border rounded"
                    />
                    {errors.email && (
                        <p className="text-red-500">{errors.email.message as string}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1">Пароль</label>
                    <input
                        {...register("password", {
                            required: "Обязательное поле",
                            minLength: {
                                value: 6,
                                message: "Минимум 6 символов"
                            }
                        })}
                        type="password"
                        className="w-full p-2 border rounded"
                    />
                    {errors.password && (
                        <p className="text-red-500">{errors.password.message as string}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    {mode === "login" ? "Войти" : "Зарегистрироваться"}
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={switchMode}
                    className="text-blue-500 hover:underline"
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