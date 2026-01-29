# Plants App

A Django REST Framework application for managing plants within gardens. Plants represent individual plants that belong to a garden and are owned by a user. Each plant can have metadata like species, nickname, and an optional image.

## Overview

The Plants app enables users to:
- **Create and Manage Plants**: Add plants to their gardens with species information
- **Track Plant Metadata**: Store plant nickname, species, creation date, and optional images
- **Organize by Garden**: Plants are organized within gardens and inherit garden membership permissions
- **Upload Images**: Support for plant photos with automatic upload handling
- **Access Control**: Only garden members can view or modify plants in their garden

## Models

### Plant

Represents an individual plant in a garden.

**Fields:**
- `plant_id` (AutoField): Primary key, auto-generated
- `owner` (ForeignKey): Reference to User who owns the plant
- `image` (ImageField): Optional plant photo, uploaded to `plant-images/`
- `species` (CharField): Plant species, max 25 characters (optional)
- `garden` (ForeignKey): Reference to Garden the plant belongs to
- `nickname` (CharField): Unique name for the plant, max 25 characters
- `created_at` (DateTimeField): Timestamp of plant creation

**Methods:**
- `save()`: Auto-assigns plant to owner's default garden if no garden is specified

**Relationships:**
- Belongs to one User (owner)
- Belongs to one Garden
- One garden has many plants

## API Endpoints

| Method | Endpoint | Name | Permission | Description |
|--------|----------|------|-----------|-------------|
| GET | `/api/plant/` | plant-list | Authenticated | List all accessible plants |
| GET | `/api/plant/?garden={id}` | plant-list | Authenticated | List plants in specific garden |
| GET | `/api/plant/{id}/` | plant-detail | Authenticated | Get plant details |
| POST | `/api/plant/` | plant-list | Authenticated | Create new plant |
| PUT | `/api/plant/{id}/` | plant-detail | Authenticated | Update plant (full) |
| PATCH | `/api/plant/{id}/` | plant-detail | Authenticated | Update plant (partial) |
| DELETE | `/api/plant/{id}/` | plant-detail | Authenticated | Delete plant |

## Permissions

- **List Plants**: Authenticated users can only see plants in gardens they are members of
- **View Plant**: Users can only view plants in gardens they have access to
- **Create Plant**: Authenticated users can create plants in gardens they are members of
- **Update Plant**: Users can only update plants they own in accessible gardens
- **Delete Plant**: Users can only delete plants they own

## Usage

### Create a Plant

**Request:**
```
POST /api/plant/
Content-Type: application/json

{
  "nickname": "Monstera Deliciosa",
  "species": "Monstera",
  "garden": 1
}
```

**Response:**
```json
{
  "detail": "Your plant 42 has been added.",
  "plant": {
    "plant_id": 42,
    "nickname": "Monstera Deliciosa",
    "species": "Monstera",
    "garden": 1,
    "owner": 1,
    "created_at": "2026-01-29T10:30:00Z",
    "image": null
  }
}
```

### Create a Plant with Image

**Request:**
```
POST /api/plant/
Content-Type: multipart/form-data

nickname=Pothos&species=Epipremnum&garden=1&image=<file>
```

### List All Accessible Plants

**Request:**
```
GET /api/plant/
```

**Response:**
```json
[
  {
    "plant_id": 42,
    "nickname": "Monstera Deliciosa",
    "species": "Monstera",
    "garden": 1,
    "created_at": "2026-01-29T10:30:00Z"
  },
  {
    "plant_id": 43,
    "nickname": "Snake Plant",
    "species": "Sansevieria",
    "garden": 1,
    "created_at": "2026-01-29T11:00:00Z"
  }
]
```

### List Plants in Specific Garden

**Request:**
```
GET /api/plant/?garden=1
```

**Response:**
```json
[
  {
    "plant_id": 42,
    "nickname": "Monstera Deliciosa",
    "species": "Monstera",
    "garden": 1,
    "created_at": "2026-01-29T10:30:00Z"
  }
]
```

### Get Plant Details

**Request:**
```
GET /api/plant/42/
```

**Response:**
```json
{
  "plant_id": 42,
  "nickname": "Monstera Deliciosa",
  "species": "Monstera",
  "garden": 1,
  "owner": 1,
  "image": "https://example.com/media/plant-images/monstera.jpg",
  "created_at": "2026-01-29T10:30:00Z"
}
```

### Update Plant (Full Update - PUT)

**Request:**
```
PUT /api/plant/42/
Content-Type: application/json

{
  "nickname": "Big Monstera",
  "species": "Monstera Deliciosa",
  "garden": 1
}
```

**Response:** Returns updated plant object with status 200 OK

### Update Plant (Partial Update - PATCH)

**Request:**
```
PATCH /api/plant/42/
Content-Type: application/json

{
  "nickname": "Monstera (Repotted)"
}
```

**Response:** Returns updated plant object with status 200 OK (other fields unchanged)

### Delete Plant

**Request:**
```
DELETE /api/plant/42/
```

**Response:** Status 204 No Content

## Features

### Automatic Garden Assignment
When creating a plant without specifying a garden, the plant is automatically assigned to the user's default garden (created automatically when the user registers).

### Access Control
- Plants are only visible to members of their garden
- Non-members attempting to access a plant receive a 404 Not Found response
- Only the plant owner can modify or delete a plant

### Image Upload
- Optional plant images are uploaded to `media/plant-images/`
- Images are stored with unique filenames
- Image URL is included in API responses

### Filtering by Garden
Use the `?garden={garden_id}` query parameter to filter plants by garden.

## Serializers

### PlantSerializer
Used for detailed plant responses (GET detail, create responses).

### PlantListSerializer
Used for list responses (GET list) with minimal information.

### PlantCreateSerializer
Used for POST, PUT, and PATCH operations with validation.

## Testing

Run tests with:
```bash
python manage.py test plantapp.plants
```

Test coverage includes:
- Authentication requirements
- Access control for garden members
- Full CRUD operations (Create, Read, Update, Delete)
- Partial and full updates (PATCH vs PUT)
- Image upload
- Plant retrieval with garden filtering
- Permission checks for non-members