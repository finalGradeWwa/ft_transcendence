from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from gardens.models import Garden, GardenUser
from .models import Plant


class PlantAPITests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="user@example.com",
            username="user",
            password="password123",
        )
        self.other_user = get_user_model().objects.create_user(
            email="other@example.com",
            username="other",
            password="password123",
        )

        self.garden = Garden.objects.create(
            name="My Garden",
            slug="my-garden",
        )
        GardenUser.objects.create(organization=self.garden, user=self.user)

        self.plant = Plant.objects.create(
            owner=self.user,
            garden=self.garden,
            nickname="Fern",
            species="Fern",
        )

    def test_get_requires_authentication(self):
        url = reverse("plant-detail", args=[self.plant.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_returns_owned_plant(self):
        url = reverse("plant-detail", args=[self.plant.pk])
        self.client.force_authenticate(self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("plant_id"), self.plant.plant_id)
        self.assertEqual(response.data.get("nickname"), self.plant.nickname)

    def test_get_returns_404_for_non_member(self):
        url = reverse("plant-list", args=[self.plant.pk])
        self.client.force_authenticate(self.other_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_plant_succeeds_for_authenticated_user(self):
        self.client.force_authenticate(self.user)

        garden = Garden.objects.create(
            name="My Garden",
            slug="my-garden"
        )

        GardenUser.objects.create(
            organization=garden,
            user=self.user
        )

        url = reverse("plant-list")

        payload = {
            "nickname": "NewFern",
            "species": "Fern",
            "garden": garden.pk,
        }
        response = self.client.post(url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Plant.objects.filter(nickname="NewFern", garden=garden).exists()
        )

    def test_delete_removes_owned_plant(self):
        url = reverse("plant-detail", args=[self.plant.pk])
        self.client.force_authenticate(self.user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Plant.objects.filter(pk=self.plant.pk).exists())

    def test_patch_updates_plant_partial(self):
        """Test PATCH update with partial data"""
        url = reverse("plant-detail", args=[self.plant.pk])
        self.client.force_authenticate(self.user)
        payload = {"nickname": "Updated Fern"}
        response = self.client.patch(url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.plant.refresh_from_db()
        self.assertEqual(self.plant.nickname, "Updated Fern")
        self.assertEqual(self.plant.species, "Fern")  # unchanged

    def test_put_updates_plant_full(self):
        """Test PUT update with all required data"""
        url = reverse("plant-detail", args=[self.plant.pk])
        self.client.force_authenticate(self.user)
        payload = {
            "nickname": "New Fern Name",
            "species": "Fern Updated",
            "garden": self.garden.pk,
        }
        response = self.client.put(url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.plant.refresh_from_db()
        self.assertEqual(self.plant.nickname, "New Fern Name")
        self.assertEqual(self.plant.species, "Fern Updated")

    def test_patch_requires_authentication(self):
        """Test that unauthenticated users cannot update"""
        url = reverse("plant-detail", args=[self.plant.pk])
        payload = {"nickname": "Hacked"}
        response = self.client.patch(url, payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_requires_authentication(self):
        """Test that unauthenticated users cannot update"""
        url = reverse("plant-detail", args=[self.plant.pk])
        payload = {"nickname": "Hacked"}
        response = self.client.put(url, payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_denies_non_garden_member(self):
        """Test that users not in garden cannot update plant"""
        url = reverse("plant-detail", args=[self.plant.pk])
        self.client.force_authenticate(self.other_user)
        payload = {"nickname": "Hacked"}
        response = self.client.patch(url, payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_put_denies_non_garden_member(self):
        """Test that users not in garden cannot update plant"""
        url = reverse("plant-detail", args=[self.plant.pk])
        self.client.force_authenticate(self.other_user)
        payload = {"nickname": "Hacked"}
        response = self.client.put(url, payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
