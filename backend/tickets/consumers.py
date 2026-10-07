import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Message, Ticket


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.ticket_id = self.scope["url_route"]["kwargs"]["ticket_id"]
        self.room_group_name = f"ticket_{self.ticket_id}"

        user = self.scope["user"]

        if not user.is_authenticated:
            await self.close(code=4001)
            return

        has_access = await self.check_ticket_access(
            user,
            self.ticket_id,
        )

        if not has_access:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        messages = await self.get_messages(
            self.ticket_id
        )

        for message in messages:
            await self.send(
                text_data=json.dumps(
                    {
                        "id": message["id"],
                        "username": message["username"],
                        "text": message["text"],
                        "created_at": message["created_at"],
                    }
                )
            )


    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )


    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        text = data.get("text", "").strip()

        if not text:
            return

        message = await self.create_message(
            self.scope["user"],
            self.ticket_id,
            text,
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": message["id"],
                    "username": message["username"],
                    "text": message["text"],
                    "created_at": message["created_at"],
                },
            },
        )


    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                event["message"]
            )
        )


    @database_sync_to_async
    def check_ticket_access(
        self,
        user,
        ticket_id,
    ):
        try:
            ticket = Ticket.objects.get(
                id=ticket_id
            )
        except Ticket.DoesNotExist:
            return False

        return (
            user.is_staff
            or ticket.user_id == user.id
        )


    @database_sync_to_async
    def create_message(
        self,
        user,
        ticket_id,
        text,
    ):
        ticket = Ticket.objects.get(
            id=ticket_id
        )

        message = Message.objects.create(
            ticket=ticket,
            sender=user,
            text=text,
        )

        return {
            "id": message.id,
            "username": user.username,
            "text": message.text,
            "created_at": message.created_at.isoformat(),
        }


    @database_sync_to_async
    def get_messages(
        self,
        ticket_id,
    ):
        messages = (
            Message.objects
            .filter(ticket_id=ticket_id)
            .select_related("sender")
            .order_by("created_at")
        )

        return [
            {
                "id": message.id,
                "username": message.sender.username,
                "text": message.text,
                "created_at": message.created_at.isoformat(),
            }
            for message in messages
        ]