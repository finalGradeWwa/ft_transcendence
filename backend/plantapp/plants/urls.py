from django.urls import path
from . import views

urlpatterns = [
    path("", views.plant_list, name="plant_list"),
    path("add/", views.plant_create, name="plant_create"),
    path("<int:plant_id>/", views.plant_detail, name="plant_detail"),
    path("<int:plant_id>/edit/", views.plant_update, name="plant_update"),
    path("<int:plant_id>/delete/", views.plant_delete, name="plant_delete"),
]
