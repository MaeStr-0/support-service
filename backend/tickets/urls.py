from django.urls import path

from .views import (
    TicketListCreateView,
    TicketDetailView,
    TicketStatusUpdateView,
    CommentListView,
    CommentCreateView,
    TicketAssignView,
    TicketExportView,
)


urlpatterns = [
    path(
        "",
        TicketListCreateView.as_view(),
    ),

    path(
        "<int:pk>/",
        TicketDetailView.as_view(),
    ),

    path(
        "<int:pk>/status/",
        TicketStatusUpdateView.as_view(),
    ),

    path(
        "<int:pk>/assign/",
        TicketAssignView.as_view()
    ),

    path(
        "<int:pk>/comments/",
        CommentListView.as_view(),
    ),

    path(
        "<int:pk>/comments/create/",
        CommentCreateView.as_view(),
    ),

    path(
        "export/",
        TicketExportView.as_view()
     ),
]
