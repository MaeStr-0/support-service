import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getTickets,
    updateTicketStatus,
    assignTicket,
    exportTickets,
} from "./api/tickets";

import {
    getAdmins,
} from "./api/auth";


const statusLabels = {
    new: "Новая",
    in_progress: "В работе",
    closed: "Закрыта",
};


function AdminDashboard({
    onOpenTicket,
    onLogout,
    user,
}) {
    const [tickets, setTickets] =
        useState([]);

    const [admins, setAdmins] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [search, setSearch] =
        useState("");


    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const [
                ticketsData,
                adminsData,
            ] = await Promise.all([
                getTickets(),
                getAdmins(),
            ]);

            setTickets(ticketsData);
            setAdmins(adminsData);
        } catch (error) {
            console.error(error);

            setError(
                "Не удалось загрузить данные"
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadData();
    }, []);


    async function handleStatusChange(
        ticketId,
        newStatus
    ) {
        try {
            setError("");

            const updatedTicket =
                await updateTicketStatus(
                    ticketId,
                    newStatus
                );

            setTickets((current) =>
                current.map((ticket) =>
                    ticket.id === ticketId
                        ? updatedTicket
                        : ticket
                )
            );
        } catch (error) {
            console.error(error);

            setError(
                "Не удалось изменить статус"
            );
        }
    }


    async function handleAssign(
        ticketId,
        adminId
    ) {
        try {
            setError("");

            if (!adminId) {
                return;
            }

            const updatedTicket =
                await assignTicket(
                    ticketId,
                    Number(adminId)
                );

            setTickets((current) =>
                current.map((ticket) =>
                    ticket.id === ticketId
                        ? updatedTicket
                        : ticket
                )
            );
        } catch (error) {
            console.error(error);

            setError(
                "Не удалось назначить ответственного"
            );
        }
    }


    async function handleExport() {
        try {
            setError("");

            const blob =
                await exportTickets();

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;
            link.download = "tickets.csv";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);

            setError(
                "Не удалось экспортировать заявки"
            );
        }
    }


    const filteredTickets = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return tickets.filter((ticket) => {

            const matchesStatus =
                statusFilter === "all" ||
                ticket.status === statusFilter;


            const matchesSearch =
                !normalizedSearch ||
                ticket.title
                    .toLowerCase()
                    .includes(
                        normalizedSearch
                    ) ||
                ticket.username
                    .toLowerCase()
                    .includes(
                        normalizedSearch
                    );


            return (
                matchesStatus &&
                matchesSearch
            );
        });
    }, [
        tickets,
        statusFilter,
        search,
    ]);


    const statistics = {
        total: tickets.length,

        new: tickets.filter(
            (ticket) =>
                ticket.status === "new"
        ).length,

        inProgress: tickets.filter(
            (ticket) =>
                ticket.status === "in_progress"
        ).length,

        closed: tickets.filter(
            (ticket) =>
                ticket.status === "closed"
        ).length,
    };


    function resetFilters() {
        setStatusFilter("all");
        setSearch("");
    }


    if (loading) {
        return (
            <div className="content">

                <div className="empty-state">
                    Загрузка...
                </div>

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
                        Панель администратора
                    </span>

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

                        <h2>
                            Все заявки
                        </h2>

                        <p>
                            Управление обращениями
                            пользователей
                        </p>

                    </div>


                    <button
                        className="primary-button"
                        onClick={handleExport}
                    >
                        ↓ Экспорт CSV
                    </button>

                </div>


                {error && (
                    <div className="error page-error">
                        {error}
                    </div>
                )}


                <div className="admin-statistics">

                    <div className="statistics-card">

                        <span>
                            Всего
                        </span>

                        <strong>
                            {statistics.total}
                        </strong>

                    </div>


                    <div className="statistics-card">

                        <span>
                            Новые
                        </span>

                        <strong>
                            {statistics.new}
                        </strong>

                    </div>


                    <div className="statistics-card">

                        <span>
                            В работе
                        </span>

                        <strong>
                            {statistics.inProgress}
                        </strong>

                    </div>


                    <div className="statistics-card">

                        <span>
                            Закрытые
                        </span>

                        <strong>
                            {statistics.closed}
                        </strong>

                    </div>

                </div>


                <div className="admin-filters">

                    <input
                        type="text"
                        placeholder="Поиск по заявке или пользователю..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />


                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="all">
                            Все статусы
                        </option>

                        <option value="new">
                            Новые
                        </option>

                        <option value="in_progress">
                            В работе
                        </option>

                        <option value="closed">
                            Закрытые
                        </option>

                    </select>


                    <button
                        className="secondary-button"
                        onClick={resetFilters}
                    >
                        Сбросить
                    </button>

                </div>


                <div className="admin-results-info">

                    Найдено заявок:{" "}

                    <strong>
                        {filteredTickets.length}
                    </strong>

                </div>


                {filteredTickets.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            Заявки не найдены
                        </h3>

                        <p>
                            Попробуйте изменить
                            параметры поиска.
                        </p>

                    </div>

                ) : (

                    <div className="admin-ticket-list">

                        {filteredTickets.map(
                            (ticket) => (

                            <div
                                className="admin-ticket-card"
                                key={ticket.id}
                            >

                                <div
                                    className="admin-ticket-main"
                                    onClick={() =>
                                        onOpenTicket(
                                            ticket.id
                                        )
                                    }
                                >

                                    <div className="ticket-number">
                                        #{ticket.id}
                                    </div>


                                    <h3>
                                        {ticket.title}
                                    </h3>


                                    <p>
                                        {ticket.description}
                                    </p>


                                    <div className="admin-ticket-user">

                                        Пользователь:{" "}

                                        <strong>
                                            {ticket.username}
                                        </strong>

                                    </div>

                                </div>


                                <div className="admin-ticket-controls">

                                    <div className="admin-control">

                                        <label>
                                            Статус
                                        </label>


                                        <select
                                            value={
                                                ticket.status
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleStatusChange(
                                                    ticket.id,
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="new">
                                                Новая
                                            </option>

                                            <option value="in_progress">
                                                В работе
                                            </option>

                                            <option value="closed">
                                                Закрыта
                                            </option>

                                        </select>

                                    </div>


                                    <div className="admin-control">

                                        <label>
                                            Ответственный
                                        </label>


                                        <select
                                            value={
                                                ticket.assigned_to ||
                                                ""
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleAssign(
                                                    ticket.id,
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Не назначен
                                            </option>


                                            {admins.map(
                                                (admin) => (

                                                <option
                                                    key={
                                                        admin.id
                                                    }
                                                    value={
                                                        admin.id
                                                    }
                                                >
                                                    {
                                                        admin.username
                                                    }
                                                </option>

                                            ))}

                                        </select>

                                    </div>


                                    <div
                                        className={
                                            `status status-${ticket.status}`
                                        }
                                    >
                                        {
                                            statusLabels[
                                                ticket.status
                                            ]
                                        }
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </main>

        </div>
    );
}


export default AdminDashboard;