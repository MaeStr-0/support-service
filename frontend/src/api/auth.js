import api from "./client";

export async function getCsrf() {
    await api.get("/auth/csrf/");
}

export async function register(username, password, email) {
    const response = await api.post("/auth/register/", {
        username,
        password,
        email,
    });

    return response.data;
}

export async function login(username, password) {
    const response = await api.post("/auth/login/", {
        username,
        password,
    });

    return response.data;
}

export async function logout() {
    const response = await api.post("/auth/logout/");

    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get("/auth/me/");

    return response.data;
}

export async function getAdmins() {
    const response = await api.get("/auth/admins/");
    return response.data;
}