from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Garden, GardenUser, GardenOwner
from .services import create_garden

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

        self.garden = create_garden(
            creator=self.alice,
            data={"name": "Alice's Garden"}
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

    def test_list_all_gardens(self):
        """Test that all gardens are visible to authenticated users"""
        # Create a garden for Bob
        bob_garden = create_garden(
            creator=self.bob,
            data={"name": "Bob's Garden"}
        )

        # Alice can see all gardens (hers and Bob's)
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Alice has 2 gardens (auto-created "alice's Garden" + "Alice's Garden" from setUp)
        # Bob has 2 gardens (auto-created "bob's Garden" + "Bob's Garden" from test)
        # Total = 4 gardens
        self.assertEqual(len(response.data), 4)

    def test_list_gardens_filter_by_owner_me(self):
        """Test filtering gardens by ?owner=me"""
        # Create a garden for Bob
        bob_garden = create_garden(
            creator=self.bob,
            data={"name": "Bob's Garden"}
        )

        # Alice filters by ?owner=me - should only see her gardens
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(f'{self.list_url}?owner=me')

        print("\n=== Response Data ===")
        print(f"Status Code: {response.status_code}")
        print(f"Number of gardens: {len(response.data)}")
        print(f"Response data: {response.data}")
        print("=====================\n")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Alice should only see her 2 gardens
        self.assertEqual(len(response.data), 2)
        for garden in response.data:
            # Verify gardens belong to Alice (check name contains "Alice" or similar logic)
            self.assertNotEqual(garden["name"], "Bob's Garden")

    def test_list_gardens_filter_by_owner_id(self):
        """Test filtering gardens by ?owner=<user_id>"""
        # Create a garden for Bob
        bob_garden = create_garden(
            creator=self.bob,
            data={"name": "Bob's Garden"}
        )

        # Alice filters by Bob's user ID - should only see Bob's gardens
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(f'{self.list_url}?owner={self.bob.id}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should see Bob's 2 gardens (auto-created + manually created)
        self.assertEqual(len(response.data), 2)

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

    def test_owner_can_update_garden_name(self):
        """Test that garden owner can update garden name"""
        self.client.force_authenticate(user=self.alice)
        
        data = {
            "name": "Updated Garden Name",
            "environment": "I"
        }
        response = self.client.put(self.detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.garden.refresh_from_db()
        self.assertEqual(self.garden.name, "Updated Garden Name")

    def test_owner_can_update_garden_environment(self):
        """Test that garden owner can update garden environment"""
        self.client.force_authenticate(user=self.alice)
        
        data = {
            "name": "Alice's Garden",
            "environment": "O"
        }
        response = self.client.put(self.detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.garden.refresh_from_db()
        self.assertEqual(self.garden.environment, "O")

    def test_owner_can_partially_update_garden_name(self):
        """Test that garden owner can partially update just the name"""
        self.client.force_authenticate(user=self.alice)
        
        original_environment = self.garden.environment
        data = {"name": "New Name Only"}
        response = self.client.patch(self.detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.garden.refresh_from_db()
        self.assertEqual(self.garden.name, "New Name Only")
        self.assertEqual(self.garden.environment, original_environment)  # Unchanged

    def test_owner_can_partially_update_garden_environment(self):
        """Test that garden owner can partially update just the environment"""
        self.client.force_authenticate(user=self.alice)
        
        original_name = self.garden.name
        data = {"environment": "G"}  # Greenhouse
        response = self.client.patch(self.detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.garden.refresh_from_db()
        self.assertEqual(self.garden.environment, "G")
        self.assertEqual(self.garden.name, original_name)  # Unchanged

    def test_non_owner_cannot_update_garden(self):
        """Test that non-owner cannot update garden"""
        GardenUser.objects.create(
            organization=self.garden,
            user=self.bob
        )
        
        self.client.force_authenticate(user=self.bob)
        data = {"name": "Hacked Name", "environment": "O"}
        response = self.client.put(self.detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.garden.refresh_from_db()
        self.assertEqual(self.garden.name, "Alice's Garden")  # Unchanged

    def test_non_owner_cannot_partially_update_garden(self):
        """Test that non-owner cannot partially update garden"""
        GardenUser.objects.create(
            organization=self.garden,
            user=self.bob
        )
        
        self.client.force_authenticate(user=self.bob)
        data = {"environment": "O"}
        response = self.client.patch(self.detail_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.garden.refresh_from_db()
        self.assertEqual(self.garden.environment, "I")  # Unchanged

    def test_non_owner_cannot_delete_garden(self):
        GardenUser.objects.create(
            organization=self.garden,
            user=self.bob
        )

        self.client.force_authenticate(user=self.bob)
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

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