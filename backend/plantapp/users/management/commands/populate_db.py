from django.core.management.base import BaseCommand
from users.models import User
from gardens.models import Garden, GardenUser, GardenOwner
from plants.models import Plant
from django.db import transaction


class Command(BaseCommand):
    help = 'Populate database with sample users, gardens, and plants'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting database population...'))
        
        with transaction.atomic():
            # Create users
            users_data = [
                {
                    'username': 'alice_green',
                    'email': 'alice@example.com',
                    'first_name': 'Alice',
                    'last_name': 'Green',
                    'password': 'password123'
                },
                {
                    'username': 'bob_gardener',
                    'email': 'bob@example.com',
                    'first_name': 'Bob',
                    'last_name': 'Gardener',
                    'password': 'password123'
                },
                {
                    'username': 'charlie_plant',
                    'email': 'charlie@example.com',
                    'first_name': 'Charlie',
                    'last_name': 'Plant',
                    'password': 'password123'
                },
                {
                    'username': 'diana_bloom',
                    'email': 'diana@example.com',
                    'first_name': 'Diana',
                    'last_name': 'Bloom',
                    'password': 'password123'
                },
                {
                    'username': 'eve_flower',
                    'email': 'eve@example.com',
                    'first_name': 'Eve',
                    'last_name': 'Flower',
                    'password': 'password123'
                },
            ]

            created_users = []
            for user_data in users_data:
                user, created = User.objects.get_or_create(
                    email=user_data['email'],
                    defaults={
                        'username': user_data['username'],
                        'first_name': user_data['first_name'],
                        'last_name': user_data['last_name'],
                    }
                )
                if created:
                    user.set_password(user_data['password'])
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f'✓ Created user: {user.username}'))
                else:
                    self.stdout.write(self.style.WARNING(f'⚠ User already exists: {user.username}'))
                created_users.append(user)

            # Create friendships (mutual following)
            friendships = [
                (0, 1),  # Alice <-> Bob
                (0, 2),  # Alice <-> Charlie
                (1, 2),  # Bob <-> Charlie
                (1, 3),  # Bob <-> Diana
                (2, 3),  # Charlie <-> Diana
                (3, 4),  # Diana <-> Eve
            ]

            self.stdout.write(self.style.SUCCESS('\nCreating friendships...'))
            for user1_idx, user2_idx in friendships:
                user1 = created_users[user1_idx]
                user2 = created_users[user2_idx]
                
                # Create mutual friendship
                if not user1.following.filter(pk=user2.pk).exists():
                    user1.following.add(user2)
                if not user2.following.filter(pk=user1.pk).exists():
                    user2.following.add(user1)
                
                self.stdout.write(self.style.SUCCESS(
                    f'✓ {user1.username} <-> {user2.username}'
                ))

            # Create gardens
            self.stdout.write(self.style.SUCCESS('\nCreating gardens...'))
            gardens_data = [
                {
                    'name': 'Alice\'s Indoor Garden',
                    'owner': created_users[0],
                    'environment': 'I',
                },
                {
                    'name': 'Bob\'s Outdoor Paradise',
                    'owner': created_users[1],
                    'environment': 'O',
                },
                {
                    'name': 'Charlie\'s Greenhouse',
                    'owner': created_users[2],
                    'environment': 'G',
                },
                {
                    'name': 'Diana\'s Rooftop Garden',
                    'owner': created_users[3],
                    'environment': 'O',
                },
                {
                    'name': 'Eve\'s Herb Collection',
                    'owner': created_users[4],
                    'environment': 'I',
                },
            ]

            created_gardens = []
            for garden_data in gardens_data:
                garden, created = Garden.objects.get_or_create(
                    name=garden_data['name'],
                    defaults={
                        'environment': garden_data['environment'],
                    }
                )
                
                if created:
                    # Create GardenUser
                    garden_user, _ = GardenUser.objects.get_or_create(
                        organization=garden,
                        user=garden_data['owner']
                    )
                    
                    # Create GardenOwner
                    GardenOwner.objects.get_or_create(
                        organization=garden,
                        organization_user=garden_user
                    )
                    
                    self.stdout.write(self.style.SUCCESS(
                        f'✓ Created garden: {garden.name}'
                    ))
                else:
                    self.stdout.write(self.style.WARNING(
                        f'⚠ Garden already exists: {garden.name}'
                    ))
                
                created_gardens.append(garden)

            # Create plants
            self.stdout.write(self.style.SUCCESS('\nCreating plants...'))
            plants_data = [
                # Alice's plants
                {'owner': created_users[0], 'garden': created_gardens[0], 'nickname': 'Sunny_Monstera', 'species': 'Monstera deliciosa'},
                {'owner': created_users[0], 'garden': created_gardens[0], 'nickname': 'Lucky_Bamboo', 'species': 'Dracaena sanderiana'},
                
                # Bob's plants
                {'owner': created_users[1], 'garden': created_gardens[1], 'nickname': 'Tomato_King', 'species': 'Solanum lycopersicum'},
                {'owner': created_users[1], 'garden': created_gardens[1], 'nickname': 'Rose_Queen', 'species': 'Rosa'},
                {'owner': created_users[1], 'garden': created_gardens[1], 'nickname': 'Lavender_Dream', 'species': 'Lavandula'},
                
                # Charlie's plants
                {'owner': created_users[2], 'garden': created_gardens[2], 'nickname': 'Orchid_Beauty', 'species': 'Phalaenopsis'},
                {'owner': created_users[2], 'garden': created_gardens[2], 'nickname': 'Fern_Friend', 'species': 'Nephrolepis'},
                
                # Diana's plants
                {'owner': created_users[3], 'garden': created_gardens[3], 'nickname': 'Basil_Boss', 'species': 'Ocimum basilicum'},
                {'owner': created_users[3], 'garden': created_gardens[3], 'nickname': 'Mint_Magic', 'species': 'Mentha'},
                
                # Eve's plants
                {'owner': created_users[4], 'garden': created_gardens[4], 'nickname': 'Rosemary_Joy', 'species': 'Rosmarinus'},
                {'owner': created_users[4], 'garden': created_gardens[4], 'nickname': 'Thyme_Traveler', 'species': 'Thymus vulgaris'},
                {'owner': created_users[4], 'garden': created_gardens[4], 'nickname': 'Sage_Wisdom', 'species': 'Salvia officinalis'},
            ]

            for plant_data in plants_data:
                plant, created = Plant.objects.get_or_create(
                    nickname=plant_data['nickname'],
                    defaults={
                        'owner': plant_data['owner'],
                        'garden': plant_data['garden'],
                        'species': plant_data['species'],
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(
                        f'✓ Created plant: {plant.nickname} ({plant.species}) in {plant.garden.name}'
                    ))
                else:
                    self.stdout.write(self.style.WARNING(
                        f'⚠ Plant already exists: {plant.nickname}'
                    ))

        # Print summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('DATABASE POPULATION COMPLETE!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(self.style.SUCCESS(f'\n📊 Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  • Users created: 5'))
        self.stdout.write(self.style.SUCCESS(f'  • Friendships: 6'))
        self.stdout.write(self.style.SUCCESS(f'  • Gardens created: 5'))
        self.stdout.write(self.style.SUCCESS(f'  • Plants created: 12'))
        
        self.stdout.write(self.style.SUCCESS('\n👥 Friend Connections:'))
        for user in created_users:
            friends = user.get_friends()
            friend_names = ', '.join([f.username for f in friends])
            self.stdout.write(self.style.SUCCESS(
                f'  • {user.username}: {friends.count()} friends ({friend_names})'
            ))
        
        self.stdout.write(self.style.SUCCESS('\n🔐  plantappLogin credentials (all users):'))
        self.stdout.write(self.style.SUCCESS('  Email: alice@example.com, bob@example.com, etc.'))
        self.stdout.write(self.style.SUCCESS('  Password: password123'))
