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
            garden_name="Alice's Garden"
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
        self.list_url = reverse("my-gardens")
        self.create_url = reverse("garden-create")
        self.garden_user_create_url = reverse(
            "garden-user-create",
            args=[self.garden.pk],
        )
        self.garden_user_detail_url = reverse("garden-user-detail", args=[self.garden.pk])

    def test_authentication_required(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_get_own_garden(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["garden_name"], "Alice's Garden")

    def test_owner_and_user_count_in_detail(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["owner"], "alice")
        self.assertEqual(response.data["user_count"], 1)

    def test_user_cannot_access_foreign_garden(self):
        self.client.force_authenticate(user=self.bob)

        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_only_my_gardens(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["garden_name"], "Alice's Garden")
        self.assertEqual(response.data[0]["user_count"], 1)

    def test_create_garden(self):
        self.client.force_authenticate(user=self.alice)

        data = {
            "garden_name": "New Garden"
        }

        response = self.client.post(self.create_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Garden.objects.filter(garden_name="New Garden").exists()
        )

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
        self.assertTrue(Garden.objects.filter(pk=self.garden.pk).exists())
    
    def test_owner_can_add_new_garden_user(self):
        self.client.force_authenticate(user=self.alice)

        data = {
            "garden": self.garden.pk,
            "user_id": self.bob.pk,
        }

        response = self.client.post(self.garden_user_create_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            GardenUser.objects.filter(
                organization=self.garden,
                user=self.bob,
            ).exists()
        )
    def test_add_existing_garden_user_is_idempotent(self):
        GardenUser.objects.create(
            organization=self.garden,
            user=self.bob,
        )

        self.client.force_authenticate(user=self.alice)

        data = {
            "garden": self.garden.pk,
            "user_id": self.bob.pk,
        }

        response = self.client.post(self.garden_user_create_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            GardenUser.objects.filter(
                organization=self.garden,
                user=self.bob,
            ).count(),
            1,
        )

    def test_owner_can_delete_garden_user(self):
        garden_user = GardenUser.objects.create(
            organization=self.garden,
            user=self.bob,
        )

        self.client.force_authenticate(user=self.alice)

        url = reverse("garden-user-detail", args=[garden_user.pk])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            GardenUser.objects.filter(pk=garden_user.pk).exists()
        )

    def test_non_owner_cannot_delete_garden_user(self):
        garden_user = GardenUser.objects.create(
            organization=self.garden,
            user=self.bob,
        )

        self.client.force_authenticate(user=self.bob)

        url = reverse("garden-user-detail", args=[garden_user.pk])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(
            GardenUser.objects.filter(pk=garden_user.pk).exists()
        )

    def test_delete_nonexistent_garden_user_returns_404(self):
        self.client.force_authenticate(user=self.alice)

        url = reverse("garden-user-detail", args=[9999])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
