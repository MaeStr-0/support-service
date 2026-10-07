import React, { useEffect, useState } from "react";

import {
    createTicket,
    getTickets,
} from "./api/tickets";


const statusLabels = {
    new: "Новая",
    in_progress: "В работе",
    closed: "Закрыта",
};


function TicketList({ onOpenTicket, onLogout, user }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);


    async function loadTickets() {
        try {
            setLoading(true);

            const data = await getTickets();

            setTickets(data);
        } catch {
            setError("Не удалось загрузить заявки");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadTickets();
    }, []);


    async function handleCreate(event) {
        event.preventDefault();

        setError("");
        setCreating(true);

        try {
            const ticket = await createTicket(
                title,
                description
            );

            setTickets((current) => [
                ticket,
                ...current,
            ]);

            setTitle("");
            setDescription("");
            setShowForm(false);
        } catch (error) {
            setError(
                error.response?.data ||
                "Не удалось создать заявку"
            );
        } finally {
            setCreating(false);
        }
    }


    return (
        <div className="app-container">

            <header className="header">
                <div>
                    <h1>Support Service</h1>
                    <span>Мои заявки</span>
                </div>

                <div className="header-actions">
                    <span className="current-user">
                        {user.username}
                    </span>

                    <button
                        className="logout-button"
                        onClick={onLogout}
                    >
                        Выйти
                    </button>
                </div>
            </header>


            <main className="content">

                <div className="page-title">
                    <div>
                        <h2>Заявки</h2>
                        <p>
                            Управление вашими обращениями
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() =>
                            setShowForm(!showForm)
                        }
                    >
                        + Новая заявка
                    </button>
                </div>


                {showForm && (
                    <form
                        className="ticket-form"
                        onSubmit={handleCreate}
                    >
                        <h3>Новая заявка</h3>

                        <input
                            type="text"
                            placeholder="Тема заявки"
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            required
                        />

                        <textarea
                            placeholder="Опишите проблему..."
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            rows="6"
                            required
                        />

                        {error && (
                            <div className="error">
                                {error}
                            </div>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                Отмена
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={creating}
                            >
                                {creating
                                    ? "Создание..."
                                    : "Создать заявку"}
                            </button>
                        </div>
                    </form>
                )}


                {loading && (
                    <div className="empty-state">
                        Загрузка заявок...
                    </div>
                )}


                {!loading && tickets.length === 0 && (
                    <div className="empty-state">
                        <h3>Заявок пока нет</h3>

                        <p>
                            Создайте первую заявку,
                            чтобы обратиться в поддержку.
                        </p>
                    </div>
                )}


                <div className="ticket-list">

                    {tickets.map((ticket) => (
                        <div
                            className="ticket-card"
                            key={ticket.id}
                            onClick={() =>
                                onOpenTicket(ticket.id)
                            }
                        >
                            <div className="ticket-card-main">

                                <div className="ticket-number">
                                    #{ticket.id}
                                </div>

                                <h3>
                                    {ticket.title}
                                </h3>

                                <p>
                                    {ticket.description}
                                </p>

                                <span className="ticket-date">
                                    {new Date(
                                        ticket.created_at
                                    ).toLocaleString("ru-RU")}
                                </span>

                            </div>

                            <div
                                className={
                                    `status status-${ticket.status}`
                                }
                            >
                                {statusLabels[
                                    ticket.status
                                ] || ticket.status}
                            </div>
                        </div>
                    ))}

                </div>

            </main>
        </div>
    );
}


export default TicketList;