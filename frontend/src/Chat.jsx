import React, {
    useEffect,
    useRef,
    useState,
} from "react";


function Chat({
    ticketId,
    user,
}) {
    const [messages, setMessages] =
        useState([]);

    const [text, setText] =
        useState("");

    const [connected, setConnected] =
        useState(false);


    const socketRef =
        useRef(null);

    const messagesEndRef =
        useRef(null);


    useEffect(() => {
        const socket = new WebSocket(
            `ws://localhost:8000/ws/tickets/${ticketId}/chat/`
        );

        socketRef.current = socket;


        socket.onopen = () => {
            console.log(
                "WebSocket connected"
            );

            setConnected(true);
        };


        socket.onmessage = (event) => {
            try {
                const message =
                    JSON.parse(event.data);

                setMessages((current) => [
                    ...current,
                    message,
                ]);
            } catch (error) {
                console.error(
                    "Invalid WebSocket message:",
                    error
                );
            }
        };


        socket.onclose = (event) => {
            console.log(
                "WebSocket disconnected:",
                event.code,
                event.reason
            );

            setConnected(false);
        };


        socket.onerror = (error) => {
            console.error(
                "WebSocket error:",
                error
            );
        };


        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [ticketId]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);


    function handleSubmit(event) {
        event.preventDefault();

        const message = text.trim();

        if (!message) {
            return;
        }

        if (
            !socketRef.current ||
            socketRef.current.readyState !==
                WebSocket.OPEN
        ) {
            return;
        }

        socketRef.current.send(
            JSON.stringify({
                text: message,
            })
        );

        setText("");
    }


    return (
        <section className="chat-section">

            <div className="section-header">

                <div>

                    <h2>
                        Чат
                    </h2>

                    <p>
                        Общение с поддержкой
                    </p>

                </div>


                <div
                    className={
                        connected
                            ? "chat-status connected"
                            : "chat-status disconnected"
                    }
                >

                    <span className="chat-status-dot"></span>

                    {connected
                        ? "Подключено"
                        : "Нет соединения"}

                </div>

            </div>


            <div className="chat-messages">

                {messages.length === 0 && (

                    <div className="empty-chat">
                        Сообщений пока нет
                    </div>

                )}


                {messages.map((message) => {

                    const isOwnMessage =
                        message.username ===
                        user.username;


                    return (
                        <div
                            className={
                                isOwnMessage
                                    ? "chat-message own"
                                    : "chat-message"
                            }
                            key={message.id}
                        >

                            <div className="chat-message-header">

                                <strong>
                                    {message.username}
                                </strong>


                                <span>
                                    {new Date(
                                        message.created_at
                                    ).toLocaleTimeString(
                                        "ru-RU",
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </span>

                            </div>


                            <div className="chat-message-text">
                                {message.text}
                            </div>

                        </div>
                    );
                })}


                <div ref={messagesEndRef} />

            </div>


            <form
                className="chat-form"
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    placeholder={
                        connected
                            ? "Напишите сообщение..."
                            : "Подключение..."
                    }
                    value={text}
                    onChange={(event) =>
                        setText(
                            event.target.value
                        )
                    }
                    disabled={!connected}
                />


                <button
                    type="submit"
                    className="primary-button"
                    disabled={
                        !connected ||
                        !text.trim()
                    }
                >
                    Отправить
                </button>

            </form>

        </section>
    );
}


export default Chat;