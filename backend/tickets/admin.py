from django.contrib import admin

from .models import Ticket, Comment


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = (
        "author",
        "created_at",
    )


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "user",
        "status",
        "assigned_to",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "user__username",
    )

    ordering = (
        "-created_at",
    )

    inlines = [
        CommentInline,
    ]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "ticket",
        "author",
        "created_at",
    )

    list_filter = (
        "created_at",
    )

    search_fields = (
        "text",
        "author__username",
        "ticket__title",
    )

    ordering = (
        "-created_at",
    )