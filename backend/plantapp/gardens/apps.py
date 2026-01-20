from django.apps import AppConfig


class GardensConfig(AppConfig):
    name = 'gardens'
    
    def ready(self):
        import gardens.signals
