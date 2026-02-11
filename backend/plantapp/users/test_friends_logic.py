from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class FriendSystemTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user(
            email="alice@a.com",
            username="alice",
            password="password123",
        )
        self.bob = User.objects.create_user(
            email="bob@b.com",
            username="bob",
            password="password123",
        )
        self.charlie = User.objects.create_user(
            email="charlie@c.com",
            username="charlie",
            password="password123",
        )

    def test_is_friend_true_and_false(self):
        url = f"/users/{self.alice.id}/is-friend/?target_id={self.bob.id}"

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_friend"])

        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_friend"])

    def test_list_friends_mutual_follow(self):
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)
        self.alice.following.add(self.charlie)
        self.charlie.following.add(self.alice)

        response = self.client.get(f"/users/{self.alice.id}/friends/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = {user["username"] for user in response.data}
        self.assertEqual(usernames, {"bob", "charlie"})

    def test_pending_friend_requests(self):
        self.bob.following.add(self.alice)

        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/friend-requests/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["username"], "bob")

    def test_reject_friend_request(self):
        self.bob.following.add(self.alice)

        self.client.force_authenticate(user=self.alice)
        response = self.client.post(f"/users/{self.bob.id}/reject/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.bob.following.filter(id=self.alice.id).exists())
