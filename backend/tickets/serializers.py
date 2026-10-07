from rest_framework import serializers

from .models import Comment, Ticket


class TicketSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    assigned_to_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Ticket
        fields = [
            "id",
            "username",
            "title",
            "description",
            "status",
            "assigned_to",
            "assigned_to_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "assigned_to_username",
            "status",
            "assigned_to",
            "created_at",
            "updated_at",
        ]

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="author.username",
        read_only=True,
    )

    class Meta:
        model = Comment
        fields = [
            "id",
            "username",
            "text",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "created_at",
        ]