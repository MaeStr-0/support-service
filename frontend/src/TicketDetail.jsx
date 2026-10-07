import React, {
    useEffect,
    useState,
} from "react";

import {
    getTicket,
    getComments,
    createComment,
} from "./api/tickets";

import Chat from "./Chat";


const statusLabels = {
    new: "Новая",
    in_progress: "В работе",
    closed: "Закрыта",
};


function TicketDetail({
    ticketId,
    onBack,
    user,
}) {
    const [ticket, setTicket] =
        useState(null);

    const [comments, setComments] =
        useState([]);

    const [commentText, setCommentText] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [sending, setSending] =
        useState(false);

    const [error, setError] =
        useState("");


    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const [
                ticketData,
                commentsData,
            ] = await Promise.all([
                getTicket(ticketId),
                getComments(ticketId),
            ]);

            setTicket(ticketData);
            setComments(commentsData);
        } catch (error) {
            console.error(error);

            setError(
                "Не удалось загрузить заявку"
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadData();
    }, [ticketId]);


    async function handleCommentSubmit(event) {
        event.preventDefault();

        if (!commentText.trim()) {
            return;
        }

        try {
            setSending(true);
            setError("");

            const comment =
                await createComment(
                    ticketId,
                    commentText.trim()
                );

            setComments((current) => [
                ...current,
                comment,
            ]);

            setCommentText("");
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Не удалось добавить комментарий"
            );
        } finally {
            setSending(false);
        }
    }


    if (loading) {
        return (
            <div className="content">

                <div className="empty-state">
                    Загрузка заявки...
                </div>

            </div>
        );
    }


    if (!ticket) {
        return (
            <div className="content">

                <div className="error">
                    Заявка не найдена
                </div>


                <button
                    className="secondary-button"
                    onClick={onBack}
                >
                    ← Назад
                </button>

            </div>
        );
    }


    return (
        <div className="app-container">

            <header className="header">

                <div>
                    <h1>
                        Support Service
                    </h1>

                    <span>
                        Заявка #{ticket.id}
                    </span>
                </div>


                <div className="header-actions">

                    <span className="current-user">
                        {user.username}
                    </span>


                    <button
                        className="secondary-button"
                        onClick={onBack}
                    >
                        ← К заявкам
                    </button>

                </div>

            </header>


            <main className="content">

                {error && (
                    <div className="error page-error">
                        {error}
                    </div>
                )}


                <div className="ticket-detail-card">

                    <div className="ticket-detail-header">

                        <div>

                            <div className="ticket-number">
                                Заявка #{ticket.id}
                            </div>


                            <h2>
                                {ticket.title}
                            </h2>

                        </div>


                        <div
                            className={
                                `status status-${ticket.status}`
                            }
                        >
                            {statusLabels[
                                ticket.status
                            ]}
                        </div>

                    </div>


                    <div className="ticket-description">
                        {ticket.description}
                    </div>


                    <div className="ticket-meta">

                        <div>
                            <span>
                                Создана
                            </span>

                            <strong>
                                {new Date(
                                    ticket.created_at
                                ).toLocaleString(
                                    "ru-RU"
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Обновлена
                            </span>

                            <strong>
                                {new Date(
                                    ticket.updated_at
                                ).toLocaleString(
                                    "ru-RU"
                                )}
                            </strong>
                        </div>


                        {ticket.assigned_to && (

                            <div>

                                <span>
                                    Ответственный
                                </span>

                                <strong>
                                    {ticket.assigned_to_username}
                                </strong>

                            </div>

                        )}

                    </div>

                </div>


                <section className="comments-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Комментарии
                            </h2>

                            <p>
                                Обсуждение заявки
                            </p>

                        </div>


                        <span className="comment-count">
                            {comments.length}
                        </span>

                    </div>


                    {comments.length === 0 ? (

                        <div className="empty-comments">
                            Комментариев пока нет
                        </div>

                    ) : (

                        <div className="comments-list">

                            {comments.map(
                                (comment) => (

                                <div
                                    className="comment"
                                    key={comment.id}
                                >

                                    <div className="comment-header">

                                        <strong>
                                            {
                                                comment.username
                                            }
                                        </strong>


                                        <span>
                                            {new Date(
                                                comment.created_at
                                            ).toLocaleString(
                                                "ru-RU"
                                            )}
                                        </span>

                                    </div>


                                    <div className="comment-text">
                                        {comment.text}
                                    </div>

                                </div>

                            ))}

                        </div>

                    )}


                    {user.is_admin && (

                        <form
                            className="comment-form"
                            onSubmit={
                                handleCommentSubmit
                            }
                        >

                            <textarea
                                placeholder="Добавить комментарий..."
                                value={commentText}
                                onChange={(event) =>
                                    setCommentText(
                                        event.target.value
                                    )
                                }
                                rows="4"
                            />

                            <div className="comment-form-actions">

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        sending ||
                                        !commentText.trim()
                                    }
                                >
                                    {sending
                                        ? "Отправка..."
                                        : "Добавить комментарий"}
                                </button>

                            </div>

                        </form>

                    )}

                </section>


                <Chat
                    ticketId={ticketId}
                    user={user}
                />

            </main>

        </div>
    );
}


export default TicketDetail;