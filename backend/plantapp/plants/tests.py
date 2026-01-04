from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Plant, SoilType, LightType
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your tests here.

class PlantModelTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="alice@a.com",
            username="alice",
            password="password123",
		)
    def test_create_plant_successfully(self):

        plant = Plant.objects.create(
            owner=self.user,
            nickname="Test Plant",
            soil_type_used=SoilType.LOAM,
            current_ph=6.5,
            current_temp_c=21,
            current_moisture=50,
            current_humidity=55,
            current_light=LightType.MEDIUM_LIGHT,
        )

        self.assertEqual(plant.nickname, "Test Plant")
        self.assertEqual(plant.soil_type_used, SoilType.LOAM)
   
   
    def test_defaults_are_set(self):

        plant = Plant.objects.create(
            owner=self.user,
            nickname="Lazy Plant",
            current_ph=7.0,
            current_temp_c=20,
            current_moisture=40,
            current_humidity=45,
        )

        self.assertEqual(plant.soil_type_used, SoilType.DEFAULT)
        self.assertEqual(plant.current_light, LightType.MEDIUM_LIGHT)
        self.assertIsNotNone(plant.created_at)
   
   
    def test_invalid_soil_type_rejected(self):
        plant = Plant(
            owner=self.user,
            nickname="Rebel Plant",
            soil_type_used="XX",
            current_ph=6.0,
            current_temp_c=22,
            current_moisture=60,
            current_humidity=65,
        )

        with self.assertRaises(ValidationError):
            plant.full_clean()
    def test_ph_out_of_range_fails(self):
        plant = Plant(
            owner=self.user,
            nickname="Acid Lord",
            current_ph=20,
            current_temp_c=25,
            current_moisture=50,
            current_humidity=50,
        )

        with self.assertRaises(ValidationError):
            plant.full_clean()
   
   
    def test_created_at_is_recent(self):
        plant = Plant.objects.create(
            owner=self.user,
            nickname="Time Plant",
            current_ph=6.8,
            current_temp_c=23,
            current_moisture=55,
            current_humidity=60,
        )

        self.assertLess(
            (timezone.now() - plant.created_at).total_seconds(),
            5
        )

