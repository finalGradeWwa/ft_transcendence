from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from gardens.models import Garden, GardenUser, GardenOwner
from plants.models import Plant
from gardens.services import create_garden

User = get_user_model()

# Key Integration Tests to Include:
# Creation Flow: Creating plants in owned/member gardens
# Permission Checks: Verifying garden membership affects plant permissions
# Cascade Operations: Garden deletion cascades to plants
# Cross-filtering: Filtering plants by garden, owner
# Moving Plants: Transferring plants between gardens
# Membership Changes: How removing garden members affects plant access
# Aggregate Data: Plant counts in gardens
# Complex Scenarios: Multiple users, gardens, and plants interacting

class GardenPlantIntegrationTests(APITestCase):
    """Integration tests for gardens and plants working together"""

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="testpass123"
        )
        self.user2 = User.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="testpass123"
        )

        self.garden1 = create_garden(
            creator=self.user1,
            data={"name": "Alice's Garden", "environment": "I"}
        )
        self.garden2 = create_garden(
            creator=self.user2,
            data={"name": "Bob's Garden", "environment": "O"}
        )

    def test_create_plant_in_owned_garden(self):
        """Test creating a plant in a garden the user owns"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.post('/api/plant/', {
            'nickname': 'Tomato',
            'species': 'Solanum lycopersicum',
            'garden': self.garden1.garden_id
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Plant.objects.filter(nickname='Tomato', garden=self.garden1).exists())

    def test_create_plant_via_garden_API(self):
        """Test creating a plant in a garden via garden API"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.post(f'/api/garden/{self.garden1.garden_id}/add_plant/', {
            'nickname': 'Rose',
            'species': 'Rosa rubiginosa'
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Plant.objects.filter(nickname='Rose', garden=self.garden1).exists())

    def test_cannot_create_plant_in_others_garden(self):
        """Test that user cannot create plant in someone else's garden"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.post('/api/plant/', {
            'nickname': 'Tomato',
            'species': 'Solanum lycopersicum',
            'garden': self.garden2.garden_id  # Bob's garden
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_garden_member_can_create_plant(self):
        """Test that garden members can add plants to shared garden. 
        The test uses full flow including permission checks"""
        # Add user1 to user2's garden using API
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(
            f'/api/garden/{self.garden2.garden_id}/add_user/',
            {"user_id": self.user1.id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Now user1 can create a plant in user2's garden
        self.client.force_authenticate(user=self.user1)
        response = self.client.post('/api/plant/', {
            'nickname': 'Basil',
            'species': 'Ocimum basilicum',
            'garden': self.garden2.garden_id
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_plants_by_garden(self):
        """Test filtering plants by garden"""
        Plant.objects.create(nickname='Plant1', species='Species1', garden=self.garden1, owner=self.user1)
        Plant.objects.create(nickname='Plant2', species='Species2', garden=self.garden1, owner=self.user1)
        Plant.objects.create(nickname='Plant3', species='Species3', garden=self.garden2, owner=self.user2)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/api/plant/?garden={self.garden1.garden_id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_deleting_garden_deletes_plants(self):
        """Test cascade deletion: deleting garden deletes its plants"""
        plant = Plant.objects.create(
            nickname='Tomato',
            species='Solanum lycopersicum',
            garden=self.garden1,
            owner=self.user1
        )
        
        plant_id = plant.plant_id
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f'/api/garden/{self.garden1.garden_id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Garden.objects.filter(garden_id=self.garden1.garden_id).exists())
        self.assertFalse(Plant.objects.filter(plant_id=plant_id).exists())

    def test_garden_plant_count_after_adding_plants(self):
        """Test that garden shows correct plant count"""
        Plant.objects.create(nickname='Plant1', species='S1', garden=self.garden1, owner=self.user1)
        Plant.objects.create(nickname='Plant2', species='S2', garden=self.garden1, owner=self.user1)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/api/garden/{self.garden1.garden_id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # You'll need to add plant_count to your garden serializer
        # self.assertEqual(response.data['plant_count'], 2)

    def test_update_plant_garden(self):
        """Test moving a plant to a different garden"""
        plant = Plant.objects.create(
            nickname='Tomato',
            species='Solanum lycopersicum',
            garden=self.garden1,
            owner=self.user1
        )
        
        # Create another garden for user1
        garden3 = create_garden(
            creator=self.user1,
            data={"name": "Alice's Second Garden"}
        )
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f'/api/plant/{plant.plant_id}/', {
            'garden': garden3.garden_id
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        plant.refresh_from_db()
        self.assertEqual(plant.garden, garden3)

    def test_cannot_move_plant_to_others_garden(self):
        """Test that user cannot move their plant to someone else's garden"""
        plant = Plant.objects.create(
            nickname='Tomato',
            species='Solanum lycopersicum',
            garden=self.garden1,
            owner=self.user1
        )
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f'/api/plant/{plant.plant_id}/', {
            'garden': self.garden2.garden_id  # Bob's garden
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        plant.refresh_from_db()
        self.assertEqual(plant.garden, self.garden1)  # Unchanged

    def test_removing_garden_member_affects_plant_modification(self):
        """Test that removing garden member prevents them from modifying plants"""
        # Add user1 to user2's garden
        garden_user = GardenUser.objects.create(organization=self.garden2, user=self.user1)
        
        # User1 creates a plant in shared garden
        plant = Plant.objects.create(
            nickname='Shared Plant',
            species='Species',
            garden=self.garden2,
            owner=self.user1
        )
        
        # User1 can update it
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f'/api/plant/{plant.plant_id}/', {'nickname': 'Updated Name'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Remove user1 from garden
        garden_user.delete()
        
        # User1 can no longer update the plant
        response = self.client.patch(f'/api/plant/{plant.plant_id}/', {'nickname': 'Another Update'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_garden_list_shows_plant_count(self):
        """Test that garden list endpoint shows how many plants each garden has"""
        Plant.objects.create(nickname='P1', species='S1', garden=self.garden1, owner=self.user1)
        Plant.objects.create(nickname='P2', species='S2', garden=self.garden1, owner=self.user1)
        Plant.objects.create(nickname='P3', species='S3', garden=self.garden2, owner=self.user2)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/garden/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Find Alice's garden in response
        alice_garden = next(g for g in response.data if g['garden_id'] == self.garden1.garden_id)
        # You'll need to add plant_count annotation to GardenListSerializer
        # self.assertEqual(alice_garden['plant_count'], 2)

    def test_multiple_users_multiple_gardens_plants_isolation(self):
        """Test complex scenario with multiple users, gardens, and plants"""
        # Create additional gardens
        garden3 = create_garden(creator=self.user1, data={"name": "Alice's Herb Garden"})
        
        # Create plants in different gardens
        Plant.objects.create(nickname='Tomato', species='S1', garden=self.garden1, owner=self.user1)
        Plant.objects.create(nickname='Basil', species='S2', garden=garden3, owner=self.user1)
        Plant.objects.create(nickname='Lettuce', species='S3', garden=self.garden2, owner=self.user2)
        
        # User1 should see their 2 plants
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/plant/?owner=me')
        self.assertEqual(len(response.data), 2)
        
        # User2 should see their 1 plant
        self.client.force_authenticate(user=self.user2)
        response = self.client.get('/api/plant/?owner=me')
        self.assertEqual(len(response.data), 1)
        
        # But both can see all plants
        response = self.client.get('/api/plant/')
        self.assertEqual(len(response.data), 3)