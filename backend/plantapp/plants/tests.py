from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from .models import PlantRequirement

User = get_user_model()

class PlantRequirementTests(TestCase):
    
    def setUp(self):
        # Tworzymy użytkownika testowego
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpass123'
        )
        self.client = Client()
        self.client.force_login(self.user)  # ZMIEŃ tutaj - było login(), ma być force_login()
        
        # Tworzymy testową roślinę
        self.plant = PlantRequirement.objects.create(
            user=self.user,
            common_name='Test Plant',
            latin_name='Testus plantus',
            soil_type='loamy'
        )
    
    def test_plant_list_view(self):
        """Test czy lista roślin się wyświetla"""
        response = self.client.get('/plants/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Plant')
    
    def test_plant_detail_view(self):
        """Test czy szczegóły rośliny się wyświetlają"""
        response = self.client.get(f'/plants/{self.plant.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Plant')
    
    def test_plant_create(self):
        """Test czy można dodać roślinę"""
        response = self.client.post('/plants/add/', {
            'common_name': 'New Plant',
            'latin_name': 'Newus plantus',
            'soil_type': 'sandy'
        })
        self.assertEqual(response.status_code, 302)  # Redirect po utworzeniu
        self.assertTrue(PlantRequirement.objects.filter(common_name='New Plant').exists())
    
    def test_plant_update(self):
        """Test czy można edytować roślinę"""
        response = self.client.post(f'/plants/{self.plant.id}/edit/', {
            'common_name': 'Updated Plant',
            'latin_name': 'Testus plantus',
            'soil_type': 'loamy'
        })
        self.assertEqual(response.status_code, 302)
        self.plant.refresh_from_db()
        self.assertEqual(self.plant.common_name, 'Updated Plant')
    
    def test_plant_delete(self):
        """Test czy można usunąć roślinę"""
        plant_id = self.plant.id
        response = self.client.post(f'/plants/{plant_id}/delete/')
        self.assertEqual(response.status_code, 302)
        self.assertFalse(PlantRequirement.objects.filter(id=plant_id).exists())
    
    def test_login_required(self):
        """Test czy widoki wymagają logowania"""
        self.client.logout()
        response = self.client.get('/plants/')
        self.assertEqual(response.status_code, 302)  # Redirect do logowania
    
    def test_user_can_only_see_own_plants(self):
        """Test czy użytkownik widzi tylko swoje rośliny"""
        other_user = User.objects.create_user(
            username='otheruser',
            email='otheruser@example.com',  # DODAJ TO
            password='otherpass123'
        )
        other_plant = PlantRequirement.objects.create(
            user=other_user,
            common_name='Other Plant'
        )
        
        response = self.client.get('/plants/')
        self.assertContains(response, 'Test Plant')
        self.assertNotContains(response, 'Other Plant')