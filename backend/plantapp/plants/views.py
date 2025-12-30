from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import PlantRequirement

@login_required
def plant_list(request):
    plants = PlantRequirement.objects.filter(user=request.user)
    return render(request, "plants/plant_list.html", {"plants": plants})


@login_required
def plant_detail(request, plant_id):
    plant = get_object_or_404(
        PlantRequirement,
        id=plant_id,
        user=request.user
    )
    return render(request, "plants/plant_detail.html", {"plant": plant})


@login_required
def plant_create(request):
    if request.method == "POST":
        PlantRequirement.objects.create(
            user=request.user,
            common_name=request.POST.get("common_name"),
            latin_name=request.POST.get("latin_name") or None,
            soil_moisture_min=request.POST.get("soil_moisture_min") or None,
            soil_moisture_max=request.POST.get("soil_moisture_max") or None,
            soil_ph_min=request.POST.get("soil_ph_min") or None,
            soil_ph_max=request.POST.get("soil_ph_max") or None,
            soil_type=request.POST.get("soil_type") or None,
            light_min=request.POST.get("light_min") or None,
            light_max=request.POST.get("light_max") or None,
            temperature_min=request.POST.get("temperature_min") or None,
            temperature_max=request.POST.get("temperature_max") or None,
            air_humidity_min=request.POST.get("air_humidity_min") or None,
            air_humidity_max=request.POST.get("air_humidity_max") or None,
            nitrogen_min=request.POST.get("nitrogen_min") or None,
            nitrogen_max=request.POST.get("nitrogen_max") or None,
            phosphorus_min=request.POST.get("phosphorus_min") or None,
            phosphorus_max=request.POST.get("phosphorus_max") or None,
            potassium_min=request.POST.get("potassium_min") or None,
            potassium_max=request.POST.get("potassium_max") or None,
        )
        return redirect("plant_list")

    return render(request, "plants/plant_form.html")

@login_required
def plant_update(request, plant_id):
    plant = get_object_or_404(
        PlantRequirement,
        id=plant_id,
        user=request.user
    )

    if request.method == "POST":
        plant.common_name = request.POST.get("common_name")
        plant.latin_name = request.POST.get("latin_name") or None
        plant.soil_moisture_min = request.POST.get("soil_moisture_min") or None
        plant.soil_moisture_max = request.POST.get("soil_moisture_max") or None
        plant.soil_ph_min = request.POST.get("soil_ph_min") or None
        plant.soil_ph_max = request.POST.get("soil_ph_max") or None
        plant.soil_type = request.POST.get("soil_type") or None
        plant.light_min = request.POST.get("light_min") or None
        plant.light_max = request.POST.get("light_max") or None
        plant.temperature_min = request.POST.get("temperature_min") or None
        plant.temperature_max = request.POST.get("temperature_max") or None
        plant.air_humidity_min = request.POST.get("air_humidity_min") or None
        plant.air_humidity_max = request.POST.get("air_humidity_max") or None
        plant.nitrogen_min = request.POST.get("nitrogen_min") or None
        plant.nitrogen_max = request.POST.get("nitrogen_max") or None
        plant.phosphorus_min = request.POST.get("phosphorus_min") or None
        plant.phosphorus_max = request.POST.get("phosphorus_max") or None
        plant.potassium_min = request.POST.get("potassium_min") or None
        plant.potassium_max = request.POST.get("potassium_max") or None
        plant.save()
        return redirect("plant_detail", plant_id=plant.id)

    return render(request, "plants/plant_form.html", {"plant": plant})

@login_required
def plant_delete(request, plant_id):
    plant = get_object_or_404(PlantRequirement, id=plant_id, user=request.user)
    if request.method == "POST":
        plant.delete()
        return redirect("plant_list")
    return render(request, "plants/plant_confirm_delete.html", {"plant": plant})
