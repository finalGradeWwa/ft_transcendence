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
            garden_name="Alice's Garden",
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
        self.assertEqual(response.data["garden_name"], "Alice's Garden")

    def test_owner_and_user_count_in_detail(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(self.detail_url)

        self.assertEqual(response.data["owner"], "alice")
        self.assertEqual(response.data["user_count"], 1)

    def test_user_cannot_access_foreign_garden(self):
        self.client.force_authenticate(user=self.bob)
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_only_my_gardens(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(self.list_url)

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["garden_name"], "Alice's Garden")

    def test_create_garden(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            self.create_url,
            {"garden_name": "New Garden"}
        )

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

    def test_owner_can_add_new_garden_user(self):
        self.client.force_authenticate(user=self.alice)

        response = self.client.post(
            self.add_user_url,
            {"user_id": self.bob.pk}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
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

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
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
