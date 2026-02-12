from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework import status , generics, filters
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

class ListFollowersAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        followers = user.followers.all()

        serializer = PublicUserSerializer(
            followers,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

class ListFollowingAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        following = user.following.all()

        serializer = PublicUserSerializer(
            following,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

class FollowUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        user = request.user

        if target == user:
            return Response(
                {"detail": "You cannot follow yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user.following.filter(pk=target.pk).exists():
             return Response(
            {"detail": f"You are already following {target.username}."},
            status=status.HTTP_400_BAD_REQUEST,
        )


        user.following.add(target)

        return Response(
            {"detail": f"You are now following {target.username}."},
            status=status.HTTP_200_OK,
        )

class UnfollowUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        user = request.user

        user.following.remove(target)

        return Response(
            {"detail": f"You have unfollowed {target.username}."},
            status=status.HTTP_200_OK,
        )

class UserSearchAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    queryset = User.objects.all()
    serializer_class = PublicUserSerializer
    filter_backends = [filters.SearchFilter]

    search_fields = ['username', 'first_name', 'last_name']
