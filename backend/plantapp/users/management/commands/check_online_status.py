from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = 'Debug user online status'

    def handle(self, *args, **options):
        all_users = User.objects.all()
        
        self.stdout.write(self.style.SUCCESS('\n📊 User Online Status Report'))
        self.stdout.write('=' * 60)
        
        for user in all_users:
            status = '🟢 Online' if user.is_online else '⚪ Offline'
            self.stdout.write(f'{status} - {user.username} (ID: {user.id})')
        
        online_count = User.objects.filter(is_online=True).count()
        offline_count = User.objects.filter(is_online=False).count()
        
        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS(f'Total: {all_users.count()} users'))
        self.stdout.write(self.style.SUCCESS(f'Online: {online_count}'))
        self.stdout.write(self.style.WARNING(f'Offline: {offline_count}'))
        
        self.stdout.write('\n💡 Note: Users are set online when they connect to WebSocket (chat page)')
        self.stdout.write('   For users to show as online, they must visit /chat page')
