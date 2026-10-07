import React, { useEffect, useState } from "react";

import Login from "./Login";
import Register from "./Register";
import TicketList from "./TicketList";
import TicketDetail from "./TicketDetail";
import AdminDashboard from "./AdminDashboard";

import {
    getCurrentUser,
    getCsrf,
    logout,
} from "./api/auth";


function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState("login");
    const [selectedTicketId, setSelectedTicketId] = useState(null);


    useEffect(() => {
        async function checkAuth() {
            try {
                await getCsrf();

                const currentUser =
                    await getCurrentUser();

                setUser(currentUser);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);


    async function handleLogout() {
        try {
            await logout();
        } finally {
            setUser(null);
            setPage("login");
        }
    }


    if (loading) {
        return (
            <div>
                Загрузка...
            </div>
        );
    }


    if (!user) {
        if (page === "register") {
            return (
                <Register
                    onRegister={setUser}
                    onLogin={() =>
                        setPage("login")
                    }
                />
            );
        }

        return (
            <Login
                onLogin={setUser}
                onRegister={() =>
                    setPage("register")
                }
            />
        );
    }


    if (selectedTicketId) {
        return (
            <TicketDetail
                ticketId={selectedTicketId}
                onBack={() =>
                    setSelectedTicketId(null)
                }
                user={user}
            />
        );
    }


    if (user.is_admin) {
        return (
            <AdminDashboard
                onOpenTicket={(ticketId) =>
                    setSelectedTicketId(ticketId)
                }
                onLogout={handleLogout}
                user={user}
            />
        );
    }


    return (
        <TicketList
            onOpenTicket={(ticketId) =>
                setSelectedTicketId(ticketId)
            }
            onLogout={handleLogout}
            user={user}
        />
    );
}


export default App;