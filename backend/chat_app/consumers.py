import json
import os
import openai
import environ

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from project.settings import BASE_DIR
from django.db.models import Q
from chat_app.models import Chat, Message
from user_app.models import Agent

env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))
openai.api_key = env('OPENAI_API_KEY')


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat_id = int(self.room_name)
        self.chat = Chat.objects.get(id=self.chat_id)

        if self.scope["user"] == AnonymousUser():
            self.close()
            return False

        self.agents = Agent.objects.filter(user_id=self.scope["user"])
        available_chats = list(
            # Chat.objects.filter(Q(owner_id__in=self.agents) | Q(addressee_id__in=self.agents)) # To feature
            Chat.objects.filter(owner_id__in=self.agents)
            .values_list('id', flat=True)
        )

        if self.chat_id not in available_chats:
            self.close()
            return False

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_name, self.channel_name
        )
        self.owner_chat = Agent.objects.get(id=self.chat.owner_id.id)
        self.addressee = Agent.objects.get(id=self.chat.addressee_id.id)

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_name, self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        prompt = text_data_json['message']
        self.send(text_data=json.dumps({"message": prompt}))

        if prompt:
            complete = self.ask_gpt_stream(prompt)
            Message.objects.create(chat_id=self.chat,
                                   message_text=prompt,
                                   owner_id=self.owner_chat)
            Message.objects.create(chat_id=self.chat,
                                   message_text=complete,
                                   owner_id=self.addressee)


    # Receive message from room group
    def ask_gpt_stream(self, prompt):
        previous_messages = Message.objects.filter(chat_id=self.chat_id).order_by('-id')[:5]
        messages = [
            {"role": "system", "content": "You are a helpful assistant."}
        ]

        for message in previous_messages:
            if message.owner_id == self.owner_chat:
                mes = {"role": "user", "content": message.message_text}
            else:
                mes = {"role": "assistant", "content": message.message_text}
            messages.append(mes)

        user_prompt = {"role": "user", "content": prompt}
        messages.append(user_prompt)

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            stream=True
        )

        complete = ""
        # iterate through the stream of events
        for event in response:
            print(event)
            try:
                if event['choices'][0]['finish_reason'] != 'stop':
                    event_text = event['choices'][0]['delta']['content']  # extract the text
                    self.send(text_data=json.dumps({"message": event_text, "finish_reason": "null"}))
                    complete += event_text
                else:
                    self.send(text_data=json.dumps({"message": '', "finish_reason": "stop"}))
            except:
                pass

        return complete

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        self.send(text_data=json.dumps({"message": message}))