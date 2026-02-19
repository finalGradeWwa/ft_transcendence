from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status, generics, filters
from .serializers import UserSerializer, UserUpdateSerializer, PublicUserSerializer
from django.contrib.auth import get_user_model


User = get_user_model()


# GET /api/auth/me/ - get user data
# PATCH /api/auth/me/ - update user profile

class MeView(APIView):

	permission_classes = [IsAuthenticated]

	def get(self, request):
		serializer = UserSerializer(request.user)
		return Response(serializer.data)

	def patch(self, request):
		serializer = UserUpdateSerializer(
			request.user,
			data=request.data,
			partial=True
		)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data)


class UnfriendAPIView(APIView):
    """Remove a mutual friendship."""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        user = request.user

        if target == user:
            return Response(
                {"detail": "You cannot unfriend yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if they are actually friends
        if not user.is_friend_with(target):
            return Response(
                {"detail": f"You are not friends with {target.username}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Remove both directions of the friendship
        user.unfriend(target)

        return Response(
            {"detail": f"You are no longer friends with {target.username}."},
            status=status.HTTP_200_OK,
        )


class ListFriendsAPIView(APIView):
    """Get all friends (mutual connections) for a user."""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        friends = user.get_friends()
        
        serializer = PublicUserSerializer(friends, many=True)
        return Response(serializer.data)


class IsFriendAPIView(APIView):
    """Check if two users are friends."""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        target_id = request.query_params.get("target_id")
        
        if not target_id:
            return Response(
                {"detail": "target_id query parameter required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
       
        try:
            target_id_int = int(target_id)
        except (TypeError, ValueError):
            return Response(
                {"detail": "target_id must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        target = get_object_or_404(User, pk=target_id_int)
        is_friend = user.is_friend_with(target)
        
        return Response({"is_friend": is_friend})


class UserFriendsListAPIView(APIView):
    """Get all of current user's friends (mutual connections)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        friends = request.user.get_friends()
        serializer = PublicUserSerializer(friends, many=True)
        return Response(serializer.data)


class FriendRequestsListAPIView(APIView):
    """Get incoming friend requests (requests you've received but haven't accepted/rejected)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        pending = user.get_pending_requests()
        serializer = PublicUserSerializer(pending, many=True)
        return Response(serializer.data)


class RejectFriendRequestAPIView(APIView):
    """Reject a friend request by removing the incoming request."""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        user = request.user

        if target == user:
            return Response(
                {"detail": "You cannot reject yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if target sent us a friend request
        if not target.following.filter(pk=user.pk).exists():
            return Response(
                {"detail": f"{target.username} is not following you."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target.following.remove(user)

        return Response(
            {"detail": f"You have rejected {target.username}."},
            status=status.HTTP_200_OK,
        )


class SendFriendRequestAPIView(APIView):
    """Send a friend request to another user."""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        user = request.user

        if target == user:
            return Response(
                {"detail": "You cannot send a friend request to yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if friend request already sent
        if user.following.filter(pk=target.pk).exists():
            return Response(
                {"detail": f"Friend request already sent to {target.username}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.following.add(target)

        return Response(
            {"detail": f"Friend request sent to {target.username}."},
            status=status.HTTP_200_OK,
        )


class AcceptFriendRequestAPIView(APIView):
    """Accept an incoming friend request to become friends."""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        user = request.user

        if target == user:
            return Response(
                {"detail": "You cannot accept a request from yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if target sent us a friend request
        if not target.following.filter(pk=user.pk).exists():
            return Response(
                {"detail": f"{target.username} has not sent you a friend request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if already friends
        if user.following.filter(pk=target.pk).exists():
            return Response(
                {"detail": f"You are already friends with {target.username}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Accept by creating mutual connection
        user.following.add(target)

        return Response(
            {"detail": f"You are now friends with {target.username}."},
            status=status.HTTP_200_OK,
        )


class CancelFriendRequestAPIView(APIView):
    """Cancel an outgoing friend request that hasn't been accepted yet."""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        user = request.user

        if target == user:
            return Response(
                {"detail": "Invalid operation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if we sent a friend request
        if not user.following.filter(pk=target.pk).exists():
            return Response(
                {"detail": f"No friend request sent to {target.username}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Don't allow canceling if they're already friends
        if target.following.filter(pk=user.pk).exists():
            return Response(
                {"detail": f"You are already friends with {target.username}. Use unfriend instead."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.following.remove(target)

        return Response(
            {"detail": f"Friend request to {target.username} cancelled."},
            status=status.HTTP_200_OK,
        )


class OutgoingFriendRequestsListAPIView(APIView):
    """Get all outgoing friend requests (requests you've sent that haven't been accepted)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        outgoing = user.get_outgoing_requests()
        serializer = PublicUserSerializer(outgoing, many=True)
        return Response(serializer.data)


class UserSearchAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    queryset = User.objects.all()
    serializer_class = PublicUserSerializer
    filter_backends = [filters.SearchFilter]

    search_fields = ['username', 'first_name', 'last_name']
