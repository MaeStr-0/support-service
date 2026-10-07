from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Ticket


class TicketAPITests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1",
            password="password123",
        )

        self.user2 = User.objects.create_user(
            username="user2",
            password="password123",
        )

        self.admin = User.objects.create_user(
            username="admin",
            password="password123",
            is_staff=True,
        )

    def test_user_can_create_ticket(self):
        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.post(
            "/api/tickets/",
            {
                "title": "Test ticket",
                "description": "Test description",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Ticket.objects.count(),
            1,
        )

        ticket = Ticket.objects.first()

        self.assertEqual(
            ticket.user,
            self.user1,
        )

        self.assertEqual(
            ticket.title,
            "Test ticket",
        )

    def test_user_sees_only_own_tickets(self):
        Ticket.objects.create(
            user=self.user1,
            title="User 1 ticket",
            description="Description 1",
        )

        Ticket.objects.create(
            user=self.user2,
            title="User 2 ticket",
            description="Description 2",
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            "/api/tickets/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["title"],
            "User 1 ticket",
        )

    def test_user_cannot_open_foreign_ticket(self):
        ticket = Ticket.objects.create(
            user=self.user2,
            title="Private ticket",
            description="Private description",
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            f"/api/tickets/{ticket.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_user_cannot_change_ticket_status(self):
        ticket = Ticket.objects.create(
            user=self.user1,
            title="Test ticket",
            description="Test description",
        )

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.patch(
            f"/api/tickets/{ticket.id}/status/",
            {
                "status": Ticket.Status.IN_PROGRESS,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        ticket.refresh_from_db()

        self.assertEqual(
            ticket.status,
            Ticket.Status.NEW,
        )

    def test_admin_can_change_ticket_status(self):
        ticket = Ticket.objects.create(
            user=self.user1,
            title="Test ticket",
            description="Test description",
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            f"/api/tickets/{ticket.id}/status/",
            {
                "status": Ticket.Status.IN_PROGRESS,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        ticket.refresh_from_db()

        self.assertEqual(
            ticket.status,
            Ticket.Status.IN_PROGRESS,
        )

        self.assertEqual(
            ticket.assigned_to,
            self.admin,
        )


class TicketAdditionalAPITests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1",
            password="password123",
        )

        self.user2 = User.objects.create_user(
            username="user2",
            password="password123",
        )

        self.admin = User.objects.create_user(
            username="admin",
            password="password123",
            is_staff=True,
        )

        self.ticket = Ticket.objects.create(
            user=self.user1,
            title="Test ticket",
            description="Test description",
        )

    def test_admin_can_create_comment(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.post(
            f"/api/tickets/{self.ticket.id}/comments/create/",
            {
                "text": "Admin comment",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            self.ticket.comments.count(),
            1,
        )

        comment = self.ticket.comments.first()

        self.assertEqual(
            comment.author,
            self.admin,
        )

        self.assertEqual(
            comment.text,
            "Admin comment",
        )


    def test_user_cannot_comment_on_foreign_ticket(self):
        self.client.force_authenticate(
            user=self.user2
        )

        response = self.client.post(
            f"/api/tickets/{self.ticket.id}/comments/create/",
            {
                "text": "Foreign comment",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.assertEqual(
            self.ticket.comments.count(),
            0,
        )

    def test_admin_can_assign_ticket(self):
        second_admin = User.objects.create_user(
            username="admin2",
            password="password123",
            is_staff=True,
        )

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            f"/api/tickets/{self.ticket.id}/assign/",
            {
                "admin_id": second_admin.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.ticket.refresh_from_db()

        self.assertEqual(
            self.ticket.assigned_to,
            second_admin,
        )

    def test_user_cannot_assign_ticket(self):
        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.patch(
            f"/api/tickets/{self.ticket.id}/assign/",
            {
                "admin_id": self.admin.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_can_export_tickets(self):
        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.get(
            "/api/tickets/export/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response["Content-Type"],
            "text/csv; charset=utf-8",
        )

        self.assertIn(
            "tickets.csv",
            response["Content-Disposition"],
        )

        content = response.content.decode(
            "utf-8-sig"
        )

        self.assertIn(
            "ID,User,Title,Description,Status",
            content,
        )

        self.assertIn(
            "Test ticket",
            content,
        )

    def test_user_cannot_export_tickets(self):
        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            "/api/tickets/export/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )