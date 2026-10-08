# Support Service

Веб-приложение для регистрации и обработки заявок от пользователей.

Пользователь может создавать заявки, просматривать их статус, читать комментарии к заявке и общаться с администратором в чате.

Администратор может просматривать все заявки, изменять их статус, назначать сотрудника на заявку, писать комментарии к заявке, общаться с пользователем в чате и экспортировать заявки в CSV.

## Стек

* **Backend:** Python, Django, Django REST Framework
* **Database:** PostgreSQL
* **Realtime:** Django Channels, WebSocket, Redis
* **Frontend:** React, Vite, Axios
* **API:** Swagger 
* **Deployment:** Docker, Docker Compose

## Запуск

Требования:

* Docker
* Docker Compose

Клонировать репозиторий:

```bash
git clone https://github.com/MaeStr-0/support-service.git
cd support-service
```

Запустить проект:

```bash
docker compose up --build
```

При первом запуске автоматически:

* запускаются PostgreSQL и Redis;
* выполняются Django migrations;
* создаётся первый администратор;
* запускается backend и frontend.

### Доступ

* Frontend: http://localhost:3000
* Backend: http://localhost:8000
* Swagger: http://localhost:8000/api/docs/
* Django Admin: http://localhost:8000/admin/

### Администратор

Данные администратора по умолчанию:

```text
Login: admin
Password: admin123
```

## Остановка

```bash
docker compose down
```
