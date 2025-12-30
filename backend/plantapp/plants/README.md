
Django application for managing plant requirements and care information.

## Features

- User-specific plant database
- Track plant requirements (soil, light, temperature, humidity, nutrients)
- Full CRUD operations (Create, Read, Update, Delete)
- Login required for all operations
- Admin panel integration

## URLs

1. **plant_list.html** - Lista wszystkich roślin użytkownika
   - URL: `/plants/`
   - View: `plant_list`
   - Wyświetla listę roślin z linkami do szczegółów i opcją dodania nowej

2. **plant_detail.html** - Szczegóły pojedynczej rośliny
   - URL: `/plants/<id>/`
   - View: `plant_detail`
   - Wyświetla wszystkie informacje o roślinie, linki do edycji i usuwania

3. **plant_form.html** - Formularz (dodawanie + edycja)
   - URL dodawania: `/plants/add/`
   - URL edycji: `/plants/<id>/edit/`
   - Views: `plant_create` i `plant_update`
   - Jeden szablon obsługuje oba przypadki - sprawdza czy plant istnieje

4. **plant_confirm_delete.html** - Potwierdzenie usunięcia
   - URL: `/plants/<id>/delete/`
   - View: `plant_delete`
   - Wymaga potwierdzenia POST przed usunięciem

## Models

### PlantRequirement

**Required fields:**
- `user` - ForeignKey to User (auto-assigned)
- `common_name` - Common plant name (required)

**Optional fields:**
- `latin_name` - Latin/scientific name
- `soil_moisture_min/max` - Soil moisture range (%)
- `soil_ph_min/max` - Soil pH range
- `soil_type` - Choice field (sandy, loamy, clayey, silty, peaty, chalky, saline)
- `light_min/max` - Light requirements (lux)
- `temperature_min/max` - Temperature range (°C)
- `air_humidity_min/max` - Air humidity range (%)
- `nitrogen_min/max` - Nitrogen requirements
- `phosphorus_min/max` - Phosphorus requirements
- `potassium_min/max` - Potassium requirements

## Installation

1. Create virtual environment and activate it:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Add `'plants'` to `INSTALLED_APPS` in `settings.py`

4. Add URL routing to main `urls.py`:
```python
path('plants/', include('plants.urls')),
```

5. Create `.env` file with SECRET_KEY:
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost,*
```

6. Run migrations:
```bash
python manage.py makemigrations plants
python manage.py migrate
```

7. Create superuser:
```bash
python manage.py createsuperuser
```

8. Run server:
```bash
python manage.py runserver
```

## Usage

1. Login at `/admin/login/`
2. Navigate to `/plants/` to view your plants
3. Click "Add New Plant" to create a plant entry
4. Click on plant name to view details
5. Click "Edit" to modify plant information
6. Click "Delete" to remove a plant (requires confirmation)

## Admin Panel

Access Django admin at `/admin/` to:
- Manage plants for all users
- Filter by soil type and user
- Search by common or latin name
- Bulk operations

## Dependencies

- Django 6.0+
- djangorestframework
- djangorestframework-simplejwt
- django-cors-headers
- python-dotenv 1.2.1
- pillow 10.4.0
- django-extensions (optional, for `show_urls`)

## Project Structure

```
plants/
├── __init__.py
├── admin.py              # Admin panel configuration
├── models.py             # PlantRequirement model
├── views.py              # CRUD views with get_float_or_none helper
├── urls.py               # URL routing
├── templates/plants/
│   ├── plant_list.html
│   ├── plant_detail.html
│   ├── plant_form.html
│   └── plant_confirm_delete.html
├── migrations/           # Database migrations
└── README.md
```

## Notes

- All plant data is user-specific (only owner can view/edit/delete)
- All numeric fields are optional (can be left blank)
- Uses custom `get_float_or_none()` helper for safe numeric conversions
- Empty strings in numeric fields are automatically converted to NULL
- Plant deletion requires POST confirmation for safety

## Development

Always activate virtual environment before working:
```bash
cd /nfs/homes/agorski/42_core/ft_transcendence/backend/plantapp
source venv/bin/activate
python manage.py runserver
```

To deactivate:
```bash
deactivate
```