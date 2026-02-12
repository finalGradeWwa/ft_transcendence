from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

# Create your tests here.

User = get_user_model()

class UserModelTests(TestCase):

    def test_create_user_with_username_email_and_password(self):
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="strongpassword123",
            bio="hello! my name is User123!",
        )

        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("strongpassword123"))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.bio, "hello! my name is User123!")

    def test_email_is_normalized(self):
        user = User.objects.create_user(
            username="normuser",
            email="TEST@EXAMPLE.COM",
            password="password123"
        )
        self.assertEqual(user.email, "TEST@example.com")

    def test_create_user_without_email_raises_error(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username="noemail",
                email="",
                password="password123"
            )

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123"
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)

    def test_str_representation(self):
        user = User.objects.create_user(
            username="stringuser",
            email="string@example.com",
            password="password123"
        )
        self.assertEqual(str(user), user.username)

class MeViewTests(APITestCase):

    def setUp(self):
        self.url = reverse('me')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='SecurePass123!',
            first_name='Test',
            last_name='User',
            bio='Test bio'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_me_success(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
        self.assertEqual(response.data['bio'], 'Test bio')
        self.assertIn('id', response.data)
        self.assertIn('date_joined', response.data)

    def test_get_me_unauthenticated(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_me_success(self):
        response = self.client.patch(self.url, {
            'first_name': 'Updated',
            'last_name': 'Name',
            'bio': 'Updated bio'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.assertEqual(response.data['last_name'], 'Name')
        self.assertEqual(response.data['bio'], 'Updated bio')

        # Verify in database
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')

    def test_patch_me_partial_update(self):
        response = self.client.patch(self.url, {
            'bio': 'Only bio updated'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'Only bio updated')
        self.assertEqual(response.data['first_name'], 'Test')  # Unchanged
        self.assertEqual(response.data['last_name'], 'User')  # Unchanged

    def test_patch_me_duplicate_username(self):
        User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='password123'
        )

        response = self.client.patch(self.url, {
            'username': 'otheruser'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_patch_me_duplicate_email(self):
        User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='password123'
        )

        response = self.client.patch(self.url, {
            'email': 'other@example.com'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_patch_me_same_username_allowed(self):
        response = self.client.patch(self.url, {
            'username': 'testuser'  # Same username
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_me_unauthenticated(self):
        self.client.force_authenticate(user=None)

        response = self.client.patch(self.url, {
            'first_name': 'Hacker'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class FollowAPITests(APITestCase):
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
    def test_user_can_follow_another_user(self):
        self.client.force_authenticate(user=self.alice)

        url = f"/users/{self.bob.id}/follow/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            self.alice.following.filter(id=self.bob.id).exists()
        )
        self.assertTrue(
            self.bob.followers.filter(id=self.alice.id).exists()
        )
    def test_user_cannot_follow_self(self):
        self.client.force_authenticate(user=self.alice)

        url = f"/users/{self.alice.id}/follow/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            self.alice.following.filter(id=self.alice.id).exists()
        )
    def test_user_can_unfollow(self):
        self.alice.following.add(self.bob)

        self.client.force_authenticate(user=self.alice)
        url = f"/users/{self.bob.id}/unfollow/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(
            self.alice.following.filter(id=self.bob.id).exists()
        )

    def test_user_cannot_unfollow_when_not_following(self):
        self.client.force_authenticate(user=self.alice)
        
        url = f"/users/{self.bob.id}/unfollow/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], f"You are not following {self.bob.username}.")

    def test_list_followers(self):
        self.alice.following.add(self.bob)

        url = f"/users/{self.bob.id}/followers/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["username"], "alice")

    def test_list_following(self):
        self.alice.following.add(self.bob)

        url = f"/users/{self.alice.id}/following/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["username"], "bob")

    def test_user_cannot_follow_non_existent(self):
        self.client.force_authenticate(user=self.alice)

        url = "/users/99999/follow/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 404)

    def test_user_cannot_follow_twice(self):
        self.client.force_authenticate(user=self.alice)

        url = f"/users/{self.bob.id}/follow/"
        response = self.client.post(url)
        response = self.client.post(url)

        self.assertEqual(response.status_code, 400)


class UnfriendAPITests(APITestCase):
    """Tests for POST /users/<id>/unfriend/ endpoint"""

    def setUp(self):
        self.alice = User.objects.create_user(
            email="alice@example.com",
            username="alice",
            password="password123",
        )
        self.bob = User.objects.create_user(
            email="bob@example.com",
            username="bob",
            password="password123",
        )
        self.charlie = User.objects.create_user(
            email="charlie@example.com",
            username="charlie",
            password="password123",
        )

    def test_unfriend_removes_both_follow_directions(self):
        """Unfriend should remove both users' follow relationships."""
        # Alice and Bob are mutual friends
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        self.client.force_authenticate(user=self.alice)
        url = f"/users/{self.bob.id}/unfriend/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 200)
        # Both directions should be removed
        self.assertFalse(self.alice.following.filter(pk=self.bob.pk).exists())
        self.assertFalse(self.bob.following.filter(pk=self.alice.pk).exists())
        # They should no longer be friends
        self.assertFalse(self.alice.is_friend_with(self.bob))
        self.assertFalse(self.bob.is_friend_with(self.alice))

    def test_unfriend_when_not_friends_returns_400(self):
        """Unfriend should fail if users are not mutual friends."""
        # Alice follows Bob but Bob doesn't follow back (not friends)
        self.alice.following.add(self.bob)

        self.client.force_authenticate(user=self.alice)
        url = f"/users/{self.bob.id}/unfriend/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 400)
        self.assertIn("not friends", response.data["detail"].lower())

    def test_unfriend_when_no_relationship_returns_400(self):
        """Unfriend should fail if there's no relationship at all."""
        self.client.force_authenticate(user=self.alice)
        url = f"/users/{self.bob.id}/unfriend/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 400)
        self.assertIn("not friends", response.data["detail"].lower())

    def test_unfriend_self_returns_400(self):
        """Cannot unfriend yourself."""
        self.client.force_authenticate(user=self.alice)
        url = f"/users/{self.alice.id}/unfriend/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 400)
        self.assertIn("cannot unfriend yourself", response.data["detail"].lower())

    def test_unfriend_nonexistent_user_returns_404(self):
        """Unfriend should return 404 for nonexistent user."""
        self.client.force_authenticate(user=self.alice)
        url = "/users/99999/unfriend/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 404)

    def test_unfriend_unauthenticated_returns_401(self):
        """Unfriend requires authentication."""
        url = f"/users/{self.bob.id}/unfriend/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 401)

    def test_unfriend_does_not_affect_other_friendships(self):
        """Unfriending one user should not affect other friendships."""
        # Alice is friends with both Bob and Charlie
        self.alice.following.add(self.bob, self.charlie)
        self.bob.following.add(self.alice)
        self.charlie.following.add(self.alice)

        # Alice unfriends Bob
        self.client.force_authenticate(user=self.alice)
        url = f"/users/{self.bob.id}/unfriend/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 200)
        # Alice and Bob are no longer friends
        self.assertFalse(self.alice.is_friend_with(self.bob))
        # Alice and Charlie are still friends
        self.assertTrue(self.alice.is_friend_with(self.charlie))


class IsFriendAPITests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user(
            email="alice@example.com",
            username="alice",
            password="password123",
        )
        self.bob = User.objects.create_user(
            email="bob@example.com",
            username="bob",
            password="password123",
        )
        self.charlie = User.objects.create_user(
            email="charlie@example.com",
            username="charlie",
            password="password123",
        )

    def test_is_friend_returns_true_for_mutual_follows(self):
        # Alice and Bob follow each other (mutual friends)
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        url = f"/users/{self.alice.id}/is-friend/?target_id={self.bob.id}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_friend"])

    def test_is_friend_returns_false_for_one_way_follow(self):
        # Alice follows Bob but Bob doesn't follow Alice
        self.alice.following.add(self.bob)

        url = f"/users/{self.alice.id}/is-friend/?target_id={self.bob.id}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_friend"])

    def test_is_friend_returns_false_for_no_relationship(self):
        # No relationship between Alice and Bob
        url = f"/users/{self.alice.id}/is-friend/?target_id={self.bob.id}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_friend"])

    def test_is_friend_missing_target_id_parameter(self):
        # Test the error contract when target_id is missing
        url = f"/users/{self.alice.id}/is-friend/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "target_id query parameter required")

    def test_is_friend_with_invalid_user_id(self):
        url = f"/users/99999/is-friend/?target_id={self.bob.id}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_is_friend_with_invalid_target_id(self):
        url = f"/users/{self.alice.id}/is-friend/?target_id=99999"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)


class UserFriendsListAPIViewTests(APITestCase):
    """Tests for GET /api/friends/ endpoint"""

    def setUp(self):
        self.alice = User.objects.create_user(
            email="alice@example.com",
            username="alice",
            password="password123",
        )
        self.bob = User.objects.create_user(
            email="bob@example.com",
            username="bob",
            password="password123",
        )
        self.charlie = User.objects.create_user(
            email="charlie@example.com",
            username="charlie",
            password="password123",
        )
        self.diana = User.objects.create_user(
            email="diana@example.com",
            username="diana",
            password="password123",
        )

    def test_get_friends_returns_mutual_follows_only(self):
        # Alice follows Bob, Bob follows Alice back (mutual)
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        # Alice follows Charlie but Charlie doesn't follow back (one-way)
        self.alice.following.add(self.charlie)

        # Diana follows Alice but Alice doesn't follow back (one-way)
        self.diana.following.add(self.alice)

        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/friends/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["username"], "bob")

    def test_get_friends_returns_empty_list_when_no_mutual_follows(self):
        # Alice follows Bob but Bob doesn't follow back
        self.alice.following.add(self.bob)

        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/friends/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_get_friends_with_multiple_mutual_follows(self):
        # Alice and Bob are mutual friends
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        # Alice and Charlie are mutual friends
        self.alice.following.add(self.charlie)
        self.charlie.following.add(self.alice)

        # Alice and Diana are mutual friends
        self.alice.following.add(self.diana)
        self.diana.following.add(self.alice)

        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/friends/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

        usernames = {friend["username"] for friend in response.data}
        self.assertEqual(usernames, {"bob", "charlie", "diana"})

    def test_get_friends_includes_correct_user_fields(self):
        # Alice and Bob are mutual friends
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/friends/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        friend = response.data[0]
        self.assertIn("id", friend)
        self.assertIn("username", friend)
        self.assertIn("first_name", friend)
        self.assertIn("last_name", friend)
        self.assertEqual(friend["username"], "bob")

    def test_get_friends_unauthenticated_returns_401(self):
        response = self.client.get("/api/friends/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_friends_respects_mutual_follow_not_one_way(self):
        # Bob follows Alice but Alice doesn't follow Bob
        self.bob.following.add(self.alice)

        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/friends/")

        # Alice should not see Bob as a friend
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_get_friends_does_not_include_self(self):
        # Alice follows herself (shouldn't happen in practice but let's be safe)
        self.alice.following.add(self.alice)

        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/friends/")

        # Self-follow should not appear in friends list
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)


class ListFriendsAPIViewTests(APITestCase):
    """Tests for GET /users/<id>/friends/ endpoint (public friends list)"""

    def setUp(self):
        self.alice = User.objects.create_user(
            email="alice@example.com",
            username="alice",
            password="password123",
        )
        self.bob = User.objects.create_user(
            email="bob@example.com",
            username="bob",
            password="password123",
        )
        self.charlie = User.objects.create_user(
            email="charlie@example.com",
            username="charlie",
            password="password123",
        )
        self.diana = User.objects.create_user(
            email="diana@example.com",
            username="diana",
            password="password123",
        )

    def test_list_friends_returns_mutual_follows_only(self):
        """Endpoint should only return mutual follows (both users follow each other)."""
        # Alice and Bob are mutual friends
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        # Alice follows Charlie but Charlie doesn't follow back
        self.alice.following.add(self.charlie)

        # Diana follows Alice but Alice doesn't follow back
        self.diana.following.add(self.alice)

        url = f"/users/{self.alice.id}/friends/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["username"], "bob")

    def test_list_friends_returns_empty_when_no_mutual_follows(self):
        """Endpoint should return empty list when user has no mutual follows."""
        # Alice follows Bob but Bob doesn't follow back
        self.alice.following.add(self.bob)

        url = f"/users/{self.alice.id}/friends/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_list_friends_with_multiple_mutual_follows(self):
        """Endpoint should return all mutual friends correctly."""
        # Set up multiple mutual friendships with Alice
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        self.alice.following.add(self.charlie)
        self.charlie.following.add(self.alice)

        self.alice.following.add(self.diana)
        self.diana.following.add(self.alice)

        url = f"/users/{self.alice.id}/friends/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

        usernames = {friend["username"] for friend in response.data}
        self.assertEqual(usernames, {"bob", "charlie", "diana"})

    def test_list_friends_includes_correct_user_fields(self):
        """Endpoint should return serialized user data with essential fields."""
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        url = f"/users/{self.alice.id}/friends/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        friend = response.data[0]
        self.assertIn("id", friend)
        self.assertIn("username", friend)
        self.assertIn("first_name", friend)
        self.assertIn("last_name", friend)
        self.assertEqual(friend["username"], "bob")

    def test_list_friends_is_public(self):
        """Endpoint should be publicly accessible (AllowAny permission)."""
        self.alice.following.add(self.bob)
        self.bob.following.add(self.alice)

        url = f"/users/{self.alice.id}/friends/"
        # No authentication needed
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_list_friends_respects_mutual_follow_not_one_way(self):
        """Endpoint should not return one-way follows (only mutual)."""
        # Bob follows Alice but Alice doesn't follow Bob
        self.bob.following.add(self.alice)

        url = f"/users/{self.alice.id}/friends/"
        response = self.client.get(url)

        # Alice should not see Bob as a friend since she doesn't follow back
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_list_friends_excludes_self(self):
        """Endpoint should exclude self-follows from friends list (defensive)."""
        # Alice follows herself (shouldn't happen but we defend against it)
        self.alice.following.add(self.alice)

        url = f"/users/{self.alice.id}/friends/"
        response = self.client.get(url)

        # Self-follow should not appear in friends list
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_list_friends_nonexistent_user_returns_404(self):
        """Endpoint should return 404 when user doesn't exist."""
        url = "/users/99999/friends/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_list_friends_contract_consistency(self):
        """Friends list should be consistent with is_friend API."""
        # Set up: Alice and Bob are mutual friends, Alice and Charlie are one-way
        self.alice.following.add(self.bob, self.charlie)
        self.bob.following.add(self.alice)

        url = f"/users/{self.alice.id}/friends/"
        response = self.client.get(url)

        # Get friends via endpoint
        friends_from_endpoint = {f["username"] for f in response.data}

        # Verify consistency: everyone in the endpoint response should also satisfy is_friend_with
        for friend in response.data:
            friend_obj = User.objects.get(pk=friend["id"])
            self.assertTrue(self.alice.is_friend_with(friend_obj),
                          f"{friend['username']} returned by endpoint but is_friend_with returned False")

        # Verify exclusions: if someone is not in the endpoint response, is_friend_with should be False
        if self.charlie in [User.objects.get(pk=f["id"]) for f in response.data]:
            self.fail("Charlie (one-way follow) should not be in friends list")
        self.assertFalse(self.alice.is_friend_with(self.charlie))
