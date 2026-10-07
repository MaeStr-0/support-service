# Support Service

Веб-приложение для регистрации и обработки заявок от пользователей.

Пользователь может создавать заявки, просматривать их статус, оставлять комментарии и общаться с сотрудником поддержки в режиме реального времени.

Администратор может просматривать все заявки, изменять их статус, назначать ответственного сотрудника, просматривать комментарии и экспортировать заявки в CSV.

---

## Возможности

### Пользователь

- регистрация;
- авторизация;
- выход из аккаунта;
- создание заявки;
- просмотр собственных заявок;
- просмотр деталей заявки;
- просмотр статуса заявки;
- добавление комментариев;
- общение с поддержкой в real-time чате;
- просмотр истории сообщений.

### Администратор

- просмотр всех заявок;
- поиск заявок по названию и пользователю;
- фильтрация по статусу;
- просмотр статистики;
- изменение статуса заявки;
- автоматическое назначение администратора при переводе заявки в статус «В работе»;
- ручное назначение ответственного администратора;
- просмотр и добавление комментариев;
- участие в чате с пользователем;
- экспорт всех заявок в CSV.

---

## Технологический стек

### Backend

- Python 3.12
- Django
- Django REST Framework
- Django Channels
- Daphne
- PostgreSQL
- Redis

### Frontend

- React 18
- JavaScript
- Vite
- Axios

### Infrastructure

- Docker
- Docker Compose

---

## Архитектура

Проект разделён на frontend и backend:

```text
support-service/
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── tickets/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── consumers.py
│   │   ├── routing.py
│   │   ├── permissions.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── tests.py
│   │
│   ├── users/
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── auth.js
│   │   │   └── tickets.js
│   │   │
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── TicketList.jsx
│   │   ├── TicketDetail.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Chat.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
└── README.md