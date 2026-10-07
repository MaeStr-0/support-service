from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Ticket, Comment
from .permissions import IsAdmin
from .serializers import TicketSerializer, CommentSerializer
import csv

from django.http import HttpResponse


class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Ticket.objects.all().order_by("-created_at")

        return Ticket.objects.filter(
            user=user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TicketDetailView(generics.RetrieveAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Ticket.objects.all()

        return Ticket.objects.filter(user=user)


class TicketStatusUpdateView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_status = request.data.get("status")

        valid_statuses = {
            Ticket.Status.NEW,
            Ticket.Status.IN_PROGRESS,
            Ticket.Status.CLOSED,
        }

        if new_status not in valid_statuses:
            return Response(
                {
                    "error": "Invalid status",
                    "available_statuses": [
                        Ticket.Status.NEW,
                        Ticket.Status.IN_PROGRESS,
                        Ticket.Status.CLOSED,
                    ],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket.status = new_status

        if new_status == Ticket.Status.IN_PROGRESS:
            ticket.assigned_to = request.user

        elif new_status == Ticket.Status.NEW:
            ticket.assigned_to = None

        ticket.save()

        return Response(
            TicketSerializer(ticket).data
        )


class TicketAssignView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        admin_id = request.data.get("admin_id")

        if admin_id is None:
            return Response(
                {"error": "admin_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            admin = User.objects.get(
                pk=admin_id,
                is_staff=True,
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Admin not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        ticket.assigned_to = admin
        ticket.save()

        return Response(
            TicketSerializer(ticket).data
        )


class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs["pk"]
        user = self.request.user

        if user.is_staff:
            return Comment.objects.filter(
                ticket_id=ticket_id
            )

        return Comment.objects.filter(
            ticket_id=ticket_id,
            ticket__user=user,
        )


class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        ticket_id = self.kwargs["pk"]

        try:
            ticket = Ticket.objects.get(
                pk=ticket_id
            )
        except Ticket.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Ticket not found")

        serializer.save(
            ticket=ticket,
            author=self.request.user,
        )

class TicketExportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        tickets = (
            Ticket.objects
            .select_related(
                "user",
                "assigned_to",
            )
            .order_by("-created_at")
        )

        response = HttpResponse(
            content_type="text/csv; charset=utf-8"
        )

        response["Content-Disposition"] = (
            'attachment; filename="tickets.csv"'
        )

        response.write("\ufeff")

        writer = csv.writer(response)

        writer.writerow([
            "ID",
            "User",
            "Title",
            "Description",
            "Status",
            "Assigned To",
            "Created At",
            "Updated At",
        ])

        for ticket in tickets:
            writer.writerow([
                ticket.id,
                ticket.user.username,
                ticket.title,
                ticket.description,
                ticket.status,
                (
                    ticket.assigned_to.username
                    if ticket.assigned_to
                    else ""
                ),
                ticket.created_at.strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                ticket.updated_at.strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
            ])

        return response