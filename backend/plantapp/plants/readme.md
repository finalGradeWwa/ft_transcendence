# Plants App

## Overview

The Plants app manages individual plant records within gardens. All authenticated users can view all plants, but only garden members can modify plants in their gardens. Each plant tracks its owner, species, nickname, and other metadata.

## Purpose

- **Plant Management**: Track individual plants with nicknames, species, and images
- **Garden Integration**: All plants must belong to a garden for modification access control
- **Auto-assignment**: Plants automatically assign to user's default garden if not specified
- **Public Viewing**: All authenticated users can view all plants
- **Member-only Modifications**: Only garden members can create, update, or delete plants in that garden

## Model

### Plant

#### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `plant_id` | AutoField | Primary key | Auto-generated |
| `owner` | ForeignKey(User) | Plant creator/owner | Required, CASCADE delete |
| `garden` | ForeignKey(Garden) | Garden containing the plant | Optional, CASCADE delete, auto-assigned |
| `nickname` | CharField | Plant's nickname | Required, max 25 chars, **unique** |
| `species` | CharField | Plant species name | Optional, max 25 chars |
| `image` | ImageField | Plant photo | Optional, stored in `plant-images/` |
| `created_at` | DateTimeField | Creation timestamp | Auto-set to current time |

#### Related Names

- `user.plants` - Access all plants owned by a user
- `garden.plants` - Access all plants in a garden

#### Key Features

**Auto-assignment to Default Garden**:
- If no garden is specified when creating a plant, the `save()` method automatically assigns it to the user's first garden
- This ensures every plant belongs to a garden for proper access control
- Implementation in [models.py](models.py#L22-L27)

**Unique Nicknames**:
- Plant nicknames must be globally unique across all plants
- Prevents confusion and enables easy plant identification

## Access Control

### Permission Model

Plants have a public read, member-only write permission model:
- **View Access**: All authenticated users can view all plants
- **Modification Access**: Only garden members can create, update, or delete plants in their gardens
- **Garden-based Permissions**: Write permissions are determined by garden membership

### Access Rules

| Action | Requirement |
|--------|-------------|
| View plant | Any authenticated user |
| List plants | Any authenticated user (can filter by owner or garden) |
| Create plant | Must be member of target garden |
| Update plant | Must be member of plant's garden |
| Delete plant | Must be member of plant's garden |

**Key Points**:
- Anyone can browse and view all plants across all gardens
- Only garden members can modify plants in their respective gardens
- Plant owners without garden membership cannot modify their own plants

## API Endpoints

### Authentication

All endpoints require authentication (`IsAuthenticated` permission).

---

### List Plants

**`GET /api/plant/`**

Returns all plants (visible to all authenticated users).

**Query Parameters**:
- `garden` (optional): Filter by garden ID
- `owner` (optional): Filter by owner - use `me` for your own plants or a user ID for specific user's plants

**Examples**:
- `/api/plant/` - All plants
- `/api/plant/?owner=me` - Only your plants
- `/api/plant/?owner=42` - Plants owned by user 42
- `/api/plant/?garden=3` - Only plants in garden 3
- `/api/plant/?garden=3&owner=me` - Your plants in garden 3

**Response Fields**:
- `plant_id`: Plant identifier
- `nickname`: Plant nickname
- `species`: Plant species (or null)
- `image`: Image URL (or null)
- `garden`: Garden ID
- `created_at`: Creation timestamp

**Access**: Any authenticated user

**Note**: By default, this returns **all plants**. Use the `?owner=me` query parameter to see only your own plants.

---

### Retrieve Plant

**`GET /api/plant/{id}/`**

Returns detailed information about a specific plant.

**Response Fields**:
- `plant_id`: Plant identifier
- `nickname`: Plant nickname
- `species`: Plant species
- `image`: Image URL
- `garden`: Garden ID
- `owner`: Owner user ID
- `created_at`: Creation timestamp

**Access**: Any authenticated user

---

### Create Plant

**`POST /api/plant/`**

Creates a new plant.

**Request Body**:
```json
{
  "nickname": "Freddy",
  "species": "Fern",
  "garden": 5,
  "image": "<file>"
}
```

**Fields**:
- `nickname` (required): Unique plant nickname
- `species` (optional): Plant species name
- `garden` (optional): Garden ID - defaults to user's first garden if omitted
- `image` (optional): Image file upload

**Response**:
```json
{
  "detail": "Your plant 123 has been added.",
  "plant": {
    "plant_id": 123,
    "nickname": "Freddy",
    "species": "Fern",
    "garden": 5,
    "owner": 42,
    "image": "/media/plant-images/photo.jpg",
    "created_at": "2026-01-30T10:30:00Z"
  }
}
```

**Access**: User must be a member of the target garden

**Validation**:
- Nickname must be unique
- Garden must exist
- User must be a garden member

---

### Update Plant (Full)

**`PUT /api/plant/{id}/`**

Completely updates a plant (all fields required).

**Request Body**: Same as create, all fields required

**Response**: Updated plant data

**Access**: Garden members only

---

### Update Plant (Partial)

**`PATCH /api/plant/{id}/`**

Partially updates a plant (only specified fields).

**Request Body**: Any subset of plant fields

**Example**:
```json
{
  "species": "Boston Fern"
}
```

**Response**: Updated plant data

**Access**: Garden members only

---

### Delete Plant

**`DELETE /api/plant/{id}/`**

Permanently deletes a plant.

**Response**: 204 No Content

**Access**: Garden members only

## Relationships

### Garden Integration

- **Required Relationship**: Every plant must belong to a garden
- **Cascade Deletion**: When a garden is deleted, all its plants are deleted
- **Access Inheritance**: Plants can only be accessed by garden members
- **Default Assignment**: Plants auto-assign to user's first garden if not specified

### User Ownership

- **Owner Field**: Tracks who created the plant
- **No Special Privileges**: Owner has no extra permissions beyond garden membership
- **Cascade Deletion**: When user is deleted, their plants are deleted

## Service Functions

### `create_plant(creator, data)`

Creates a new plant with permission validation.

**Parameters**:
- `creator`: User instance who is creating the plant
- `data`: Dictionary with plant fields

**Allowed Fields**:
- `nickname` (required)
- `species` (optional)
- `garden` (optional)
- `image` (optional)

**Validation**:
- Checks if user is a member of the specified garden
- Raises `ValidationError` if user lacks permission

**Returns**: Plant instance

**Example**:
```python
from plants.services import create_plant

plant = create_plant(
    creator=request.user,
    data={
        "nickname": "Monstera",
        "species": "Monstera deliciosa",
        "garden": garden_instance
    }
)
```

## Data Validation

### Nickname Uniqueness

Plant nicknames must be unique across the entire database:
- Prevents duplicate plant names
- Database-level constraint enforces uniqueness
- Creation/update fails if nickname already exists

### Garden Membership

The `create_plant` service function validates:
```python
if not garden_obj.gardenuser_set.filter(user=creator).exists():
    raise ValidationError("You don't have permission to create plants in this garden.")
```

### Auto-assignment Logic

From [models.py](models.py#L22-L27):
```python
def save(self, *args, **kwargs):
    if not self.garden:
        from gardens.models import Garden
        self.garden = Garden.objects.filter(gardenuser__user=self.owner).first()
    super().save(*args, **kwargs)
```

## Usage Examples

### Creating a Plant in Specific Garden

```python
from plants.services import create_plant
from gardens.models import Garden

garden = Garden.objects.get(pk=5)
plant = create_plant(
    creator=request.user,
    data={
        "nickname": "Basil",
        "species": "Ocimum basilicum",
        "garden": garden
    }
)
```

### Creating a Plant in Default Garden

```python
# Garden will be auto-assigned
plant = create_plant(
    creator=request.user,
    data={
        "nickname": "Mystery Plant",
        "species": "Unknown"
        # No garden specified - uses default
    }
)
```

### Querying Plants by Garden

```python
# Get all plants in a specific garden (visible to all users)
garden_plants = Plant.objects.filter(garden_id=3)

# Get all plants (visible to all users)
all_plants = Plant.objects.all()

# Get user's own plants
my_plants = Plant.objects.filter(owner=request.user)

# Get plants owned by a specific user
user_plants = Plant.objects.filter(owner_id=42)

# Get plants in gardens the user is a member of (for modification purposes)
modifiable_plants = Plant.objects.filter(garden__gardenuser__user=request.user)
```

## Image Handling

- **Upload Path**: Images stored in `media/plant-images/`
- **Optional Field**: Images are not required
- **Field Type**: `ImageField` (requires Pillow library)
- **Usage**: Send as multipart/form-data when uploading

## Related Models

- **User**: Plant owner (from `settings.AUTH_USER_MODEL`)
- **Garden**: Container for plants, provides access control
- **GardenUser**: Determines who can access plants via garden membership

## Testing

See [tests.py](tests.py) for comprehensive test coverage including:
- CRUD operations
- Access control validation
- Garden membership checks
- Auto-assignment to default garden
- Nickname uniqueness constraints
