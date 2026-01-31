from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Garden, GardenUser, GardenOwner

User = get_user_model()


class GardenAPITests(APITestCase):

    def setUp(self):
        self.alice = User.objects.create_user(
            username="alice",
            email="alice@a.com",
            password="password123"
        )

        self.bob = User.objects.create_user(
            username="bob",
            email="bob@b.com",
            password="password123"
        )

        self.garden = Garden.objects.create(
            name="Alice's Garden",
        )

        self.alice_membership = GardenUser.objects.create(
            organization=self.garden,
            user=self.alice
        )

        self.owner = GardenOwner.objects.create(
            organization=self.garden,
            organization_user=self.alice_membership
        )

        self.detail_url = reverse("garden-detail", args=[self.garden.pk])
        self.list_url = reverse("garden-list")
        self.create_url = reverse("garden-list")
        self.add_user_url = reverse("garden-add-user", args=[self.garden.pk])

    def test_authentication_required(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_get_own_garden(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Alice's Garden")
        self.assertEqual(response.data["environment"], "I")  # Default is indoor

    def test_owner_and_user_count_in_detail(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(self.detail_url)

        self.assertEqual(response.data["owner"], "alice")
        self.assertEqual(response.data["user_count"], 1)
        self.assertEqual(response.data["environment"], "I")  # Default is indoor

    def test_user_cannot_access_foreign_garden(self):
        self.client.force_authenticate(user=self.bob)
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_only_my_gardens(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(self.list_url)

        self.assertEqual(len(response.data), 2)
        for garden in response.data:
            self.assertEqual(garden["environment"], "I")  # Default is indoor

    def test_create_garden(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            self.create_url,
            {"name": "New Garden"}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Garden.objects.filter(name="New Garden").exists()
        )
        garden = Garden.objects.get(name="New Garden")
        self.assertEqual(garden.environment, "I")  # Default is indoor

    def test_create_garden_with_outdoor_environment(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            self.create_url,
            {"name": "Outdoor Garden", "environment": "O"}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Garden.objects.filter(name="Outdoor Garden").exists()
        )
        garden = Garden.objects.get(name="Outdoor Garden")
        self.assertEqual(garden.environment, "O")  # Outdoor environment

    def test_owner_can_delete_garden(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Garden.objects.filter(pk=self.garden.pk).exists())

    def test_non_owner_cannot_delete_garden(self):
        GardenUser.objects.create(
            organization=self.garden,
            user=self.bob
        )

        self.client.force_authenticate(user=self.bob)
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_owner_can_add_new_garden_user(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            self.add_user_url,
            {"user_id": self.bob.pk}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            GardenUser.objects.filter(
                organization=self.garden,
                user=self.bob
            ).exists()
        )

    def test_add_existing_garden_user_is_idempotent(self):
        GardenUser.objects.create(
            organization=self.garden,
            user=self.bob,
        )

        self.client.force_authenticate(user=self.alice)
        response = self.client.post(
            self.add_user_url,
            {"user_id": self.bob.pk}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            GardenUser.objects.filter(
                organization=self.garden,
                user=self.bob,
            ).count(),
            1
        )

    def test_owner_can_remove_garden_user(self):
        garden_user = GardenUser.objects.create(
            organization=self.garden,
            user=self.bob,
        )

        self.client.force_authenticate(user=self.alice)
        url = reverse(
            "garden-remove-user",
            args=[self.garden.pk, garden_user.pk]
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            GardenUser.objects.filter(pk=garden_user.pk).exists()
        )
        
    def test_non_owner_cannot_remove_garden_user(self):
        garden_user = GardenUser.objects.create(
            organization=self.garden,
            user=self.bob,
        )

        self.client.force_authenticate(user=self.bob)
        url = reverse(
            "garden-remove-user",
            args=[self.garden.pk, garden_user.pk]
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class AutomaticGardenCreationTests(APITestCase):
    """Test that a garden is automatically created when a user is registered."""

    def test_garden_created_on_user_creation(self):
        """Test that a garden is automatically created when a new user is created."""
        user = User.objects.create_user(
            username="newuser",
            email="newuser@example.com",
            password="password123"
        )

        # Check that a garden was created
        garden = Garden.objects.filter(gardenuser__user=user).first()
        self.assertIsNotNone(garden)
        self.assertEqual(garden.name, f"{user.username}'s Garden")

    def test_user_is_member_of_default_garden(self):
        """Test that the user is added as a member of the default garden."""
        user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="password123"
        )

        # Check that a GardenUser entry exists
        garden_user = GardenUser.objects.filter(user=user).first()
        self.assertIsNotNone(garden_user)

    def test_user_is_owner_of_default_garden(self):
        """Test that the user becomes the owner of the default garden."""
        user = User.objects.create_user(
            username="owneruser",
            email="owneruser@example.com",
            password="password123"
        )

        # Check that a GardenOwner entry exists
        garden_owner = GardenOwner.objects.filter(
            organization_user__user=user
        ).first()
        self.assertIsNotNone(garden_owner)

    def test_default_garden_settings(self):
        """Test that the default garden has correct settings."""
        user = User.objects.create_user(
            username="settingsuser",
            email="settingsuser@example.com",
            password="password123"
        )

        garden = Garden.objects.get(gardenuser__user=user)
        self.assertEqual(garden.environment, 'I')  # Indoor

    def test_multiple_users_have_separate_gardens(self):
        """Test that each user gets their own garden."""
        user1 = User.objects.create_user(
            username="user1",
            email="user1@example.com",
            password="password123"
        )
        user2 = User.objects.create_user(
            username="user2",
            email="user2@example.com",
            password="password123"
        )

        garden1 = Garden.objects.get(gardenuser__user=user1)
        garden2 = Garden.objects.get(gardenuser__user=user2)

        self.assertNotEqual(garden1.pk, garden2.pk)
        self.assertEqual(garden1.name, "user1's Garden")
        self.assertEqual(garden2.name, "user2's Garden")