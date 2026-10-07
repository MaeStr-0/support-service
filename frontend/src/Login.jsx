import React, { useState } from "react";
import { getCsrf, login } from "./api/auth";

function Login({ onLogin, onRegister }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await getCsrf();

            const user = await login(
                username,
                password
            );

            onLogin(user);
        } catch (error) {
            setError(
                error.response?.data?.error ||
                "Ошибка авторизации"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Support Service</h1>

                <p className="auth-subtitle">
                    Вход в систему
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Логин"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                    />

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
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
                        {loading ? "Вход..." : "Войти"}
                    </button>
                </form>

                <button
                    className="link-button"
                    onClick={onRegister}
                >
                    Создать аккаунт
                </button>
            </div>
        </div>
    );
}

export default Login;