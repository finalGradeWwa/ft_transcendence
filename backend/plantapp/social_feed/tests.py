from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from plants.models import Plant
from gardens.models import Garden, GardenUser
from .models import Pin

User = get_user_model()


class PinViewSetTestCase(APITestCase):
    def setUp(self):
        """Set up test users, gardens, and plants"""
        # Create users
        self.user1 = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='testpass123'
        )
        
        # Create gardens for user1 via API
        self.client.force_authenticate(user=self.user1)
        response1 = self.client.post('/api/garden/', {
            'name': "Alice's Main Garden",
            'environment': 'I'
        }, format='json')
        self.garden1_default = Garden.objects.get(pk=response1.data['garden_id'])
        
        response2 = self.client.post('/api/garden/', {
            'name': "Alice's Herb Garden",
            'environment': 'O'
        }, format='json')
        self.garden1_secondary = Garden.objects.get(pk=response2.data['garden_id'])
        
        # Create garden for user2 via API
        self.client.force_authenticate(user=self.user2)
        response3 = self.client.post('/api/garden/', {
            'name': "Bob's Garden",
            'environment': 'I'
        }, format='json')
        self.garden2 = Garden.objects.get(pk=response3.data['garden_id'])
        
        # Create plants
        self.plant1 = Plant.objects.create(
            nickname="Tomato",
            species="Solanum lycopersicum",
            garden=self.garden1_default,
            owner=self.user1
        )
        self.plant2 = Plant.objects.create(
            nickname="Basil",
            species="Ocimum basilicum",
            garden=self.garden1_secondary,
            owner=self.user1
        )
        self.plant3 = Plant.objects.create(
            nickname="Lettuce",
            species="Lactuca sativa",
            garden=self.garden2,
            owner=self.user2
        )

    def test_create_pin_with_default_garden(self):
        """Test creating a pin associated with user's default garden"""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'content': 'My tomato plant is growing well!',
            'garden': self.garden1_default.garden_id,
            'plant': self.plant1.plant_id
        }
        
        response = self.client.post('/api/pins/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Pin.objects.count(), 1)
        
        pin = Pin.objects.first()
        self.assertEqual(pin.content, 'My tomato plant is growing well!')
        self.assertEqual(pin.creator, self.user1)
        self.assertEqual(pin.garden, self.garden1_default)
        self.assertEqual(pin.plant, self.plant1)

    def test_create_pin_with_non_default_garden(self):
        """Test creating a pin with a non-default garden"""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'content': 'Fresh basil harvest today!',
            'garden': self.garden1_secondary.garden_id,
            'plant': self.plant2.plant_id
        }
        
        response = self.client.post('/api/pins/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Pin.objects.count(), 1)
        
        pin = Pin.objects.first()
        self.assertEqual(pin.garden, self.garden1_secondary)
        self.assertEqual(pin.plant, self.plant2)

    def test_create_pin_with_someone_elses_garden(self):
        """Test that user cannot create pin with another user's garden"""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'content': 'Trying to post to Bobs garden',
            'garden': self.garden2.garden_id,  # Bob's garden
            'plant': self.plant3.plant_id  # Bob's plant
        }
        
        response = self.client.post('/api/pins/', data)
        
        # Should fail - user1 cannot post to user2's garden
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Pin.objects.count(), 0)

    def test_create_pin_content_only(self):
        """Test creating a pin with only content (no garden, no plant, no photo)"""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'content': 'Just a general gardening thought for today!'
        }
        
        response = self.client.post('/api/pins/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Pin.objects.count(), 1)
        
        pin = Pin.objects.first()
        self.assertEqual(pin.content, 'Just a general gardening thought for today!')
        self.assertEqual(pin.creator, self.user1)
        self.assertIsNone(pin.garden)
        self.assertIsNone(pin.plant)
        self.assertFalse(pin.image)

    def test_create_multiple_pins(self):
        """Test creating multiple pins by the same user"""
        self.client.force_authenticate(user=self.user1)
        
        pins_data = [
            {'content': 'First pin about gardening'},
            {'content': 'Second pin with my tomato', 'plant': self.plant1.plant_id},
            {'content': 'Third pin in herb garden', 'garden': self.garden1_secondary.garden_id}
        ]
        
        for data in pins_data:
            response = self.client.post('/api/pins/', data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.assertEqual(Pin.objects.count(), 3)
        self.assertEqual(Pin.objects.filter(creator=self.user1).count(), 3)

    def test_list_all_pins(self):
        """Test listing all pins"""
        # Create pins from both users
        Pin.objects.create(content='Alice pin 1', creator=self.user1)
        Pin.objects.create(content='Bob pin 1', creator=self.user2)
        Pin.objects.create(content='Alice pin 2', creator=self.user1, garden=self.garden1_default)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/pins/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_list_pins_filter_by_owner_me(self):
        """Test filtering pins by current user using ?owner=me"""
        Pin.objects.create(content='Alice pin', creator=self.user1)
        Pin.objects.create(content='Bob pin', creator=self.user2)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/pins/?owner=me')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['content'], 'Alice pin')

    def test_list_pins_filter_by_owner_id(self):
        """Test filtering pins by specific user ID"""
        Pin.objects.create(content='Alice pin', creator=self.user1)
        Pin.objects.create(content='Bob pin', creator=self.user2)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/api/pins/?owner={self.user2.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['content'], 'Bob pin')

    def test_retrieve_pin(self):
        """Test retrieving a single pin"""
        pin = Pin.objects.create(
            content='Test pin',
            creator=self.user1,
            garden=self.garden1_default
        )
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(f'/api/pins/{pin.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], 'Test pin')

    def test_delete_own_pin(self):
        """Test that user can delete their own pin"""
        pin = Pin.objects.create(content='My pin', creator=self.user1)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f'/api/pins/{pin.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Pin.objects.count(), 0)

    def test_delete_someone_elses_pin(self):
        """Test that user cannot delete another user's pin"""
        pin = Pin.objects.create(content='Bobs pin', creator=self.user2)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f'/api/pins/{pin.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Pin.objects.count(), 1)

    def test_update_own_pin(self):
        """Test updating own pin"""
        pin = Pin.objects.create(
            content='Original content',
            creator=self.user1,
            garden=self.garden1_default
        )
        
        self.client.force_authenticate(user=self.user1)
        data = {
            'content': 'Updated content',
            'garden': self.garden1_secondary.garden_id
        }
        response = self.client.put(f'/api/pins/{pin.id}/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pin.refresh_from_db()
        self.assertEqual(pin.content, 'Updated content')
        self.assertEqual(pin.garden, self.garden1_secondary)

    def test_update_someone_elses_pin(self):
        """Test that user cannot update another user's pin"""
        pin = Pin.objects.create(content='Bobs pin', creator=self.user2)
        
        self.client.force_authenticate(user=self.user1)
        data = {'content': 'Trying to change Bobs pin'}
        response = self.client.put(f'/api/pins/{pin.id}/', data)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update_own_pin(self):
        """Test partially updating own pin"""
        pin = Pin.objects.create(
            content='Original',
            creator=self.user1,
            garden=self.garden1_default
        )
        
        self.client.force_authenticate(user=self.user1)
        data = {'content': 'Partially updated'}
        response = self.client.patch(f'/api/pins/{pin.id}/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pin.refresh_from_db()
        self.assertEqual(pin.content, 'Partially updated')
        self.assertEqual(pin.garden, self.garden1_default)  # Garden unchanged

    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access pins"""
        # Clear any existing authentication
        self.client.force_authenticate(user=None)
        
        response = self.client.get('/api/pins/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.post('/api/pins/', {'content': 'Test'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_pin_ordering(self):
        """Test that pins are ordered by created_at (newest first)"""
        pin1 = Pin.objects.create(content='First pin', creator=self.user1)
        pin2 = Pin.objects.create(content='Second pin', creator=self.user1)
        pin3 = Pin.objects.create(content='Third pin', creator=self.user1)
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/pins/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Newest first
        self.assertEqual(response.data[0]['content'], 'Third pin')
        self.assertEqual(response.data[1]['content'], 'Second pin')
        self.assertEqual(response.data[2]['content'], 'First pin')