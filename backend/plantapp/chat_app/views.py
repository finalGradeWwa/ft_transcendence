
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timezone as dt_timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Message
from .serializers import MessageSerializer, SimpleUserSerializer

User = get_user_model()


class InboxAPIView(APIView):

	permission_classes = [IsAuthenticated]

	def get(self, request):
		User = get_user_model()
		users = User.objects.exclude(id=request.user.id)

		payload = []
		for user in users:
			last_message = (
				Message.objects.filter(
					Q(sender=request.user, recipient=user)
					|
					Q(sender=user, recipient=request.user)
				)
				.order_by('-timestamp')
				.first()
			)

			unread_count = Message.objects.filter(
				sender=user,
				recipient=request.user,
				is_read=False,
			).count()

			payload.append(
				{
					"user": SimpleUserSerializer(user).data,
					"last_message": MessageSerializer(last_message).data if last_message else None,
					"unread_count": unread_count,
					"_sort_ts": last_message.timestamp if last_message else datetime.fromtimestamp(0, tz=dt_timezone.utc),
				}
			)
		payload.sort(key=lambda x: x["_sort_ts"], reverse=True)
		for item in payload:
			item.pop("_sort_ts", None)

		return Response(payload)


class ConversationAPIView(APIView):

	permission_classes = [IsAuthenticated]

	def get(self, request, username):
		User = get_user_model()
		other_user = get_object_or_404(User, username=username)

		Message.objects.filter(
			sender=other_user,
			recipient=request.user,
			is_read=False,
		).update(is_read=True)

		messages_qs = Message.objects.filter(
			Q(sender=request.user, recipient=other_user)
			|
			Q(sender=other_user, recipient=request.user)
		).select_related('sender', 'recipient').order_by('timestamp')

		# Optional pagination: limit & offset
		limit_param = request.query_params.get("limit")
		offset_param = request.query_params.get("offset", "0")
		pagination = None
		if limit_param is not None:
			try:
				limit = max(1, min(int(limit_param), 100))
				offset = max(0, int(offset_param))
			except ValueError:
				return Response({"detail": "Invalid pagination parameters."}, status=status.HTTP_400_BAD_REQUEST)

			total = messages_qs.count()
			messages_qs = messages_qs[offset:offset + limit]
			pagination = {
				"count": total,
				"limit": limit,
				"offset": offset,
				"has_next": (offset + limit) < total,
				"has_previous": offset > 0,
			}

		serializer = MessageSerializer(messages_qs, many=True)
		payload = {
			"other_user": SimpleUserSerializer(other_user).data,
			"messages": serializer.data,
		}
		if pagination is not None:
			payload["pagination"] = pagination
		return Response(payload)

	def post(self, request, username):
		User = get_user_model()
		other_user = get_object_or_404(User, username=username)

		content = request.data.get("content")
		if not content:
			return Response({"detail": "'content' is required."}, status=status.HTTP_400_BAD_REQUEST)

		message = Message.objects.create(
			sender=request.user,
			recipient=other_user,
			content=content,
		)

		return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class UserListAPIView(APIView):

	permission_classes = [IsAuthenticated]

	def get(self, request):
		User = get_user_model()
		users = User.objects.exclude(id=request.user.id)
		serializer = SimpleUserSerializer(users, many=True)
		return Response(serializer.data)
