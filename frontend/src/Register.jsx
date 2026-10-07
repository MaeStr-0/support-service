import React, { useState } from "react";

import { getCsrf, register } from "./api/auth";


function Register({ onRegister, onLogin }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await getCsrf();

            const user = await register(
                username,
                password,
                email
            );

            onRegister(user);
        } catch (error) {
            const data = error.response?.data;

            if (data?.error) {
                setError(data.error);
            } else {
                setError("Ошибка регистрации");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Support Service</h1>

                <p className="auth-subtitle">
                    Создание аккаунта
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Логин"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                    />

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />

                    {error && (
                        <div className="error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Регистрация..."
                            : "Зарегистрироваться"}
                    </button>
                </form>

                <button
                    className="link-button"
                    onClick={onLogin}
                >
                    Уже есть аккаунт? Войти
                </button>
            </div>
        </div>
    );
}

export default Register;