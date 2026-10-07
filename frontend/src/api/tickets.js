import api from "./client";


export async function getTickets() {
    const response = await api.get("/tickets/");

    return response.data;
}


export async function getTicket(id) {
    const response = await api.get(`/tickets/${id}/`);

    return response.data;
}


export async function createTicket(title, description) {
    const response = await api.post("/tickets/", {
        title,
        description,
    });

    return response.data;
}


export async function getComments(ticketId) {
    const response = await api.get(
        `/tickets/${ticketId}/comments/`
    );

    return response.data;
}


export async function createComment(ticketId, text) {
    const response = await api.post(
        `/tickets/${ticketId}/comments/create/`,
        {
            text,
        }
    );

    return response.data;
}

export async function updateTicketStatus(ticketId, status) {
    const response = await api.patch(
        `/tickets/${ticketId}/status/`,
        {
            status,
        }
    );

    return response.data;
}


export async function assignTicket(ticketId, adminId) {
    const response = await api.patch(
        `/tickets/${ticketId}/assign/`,
        {
            admin_id: adminId,
        }
    );

    return response.data;
}

export async function exportTickets() {
    const response = await api.get(
        "/tickets/export/",
        {
            responseType: "blob",
        }
    );

    return response.data;
}