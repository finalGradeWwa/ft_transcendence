# Social Feed App - Pin Model

## Overview

The Social Feed app provides a social media-style posting system where users can share updates (pins) about their plants and gardens. Pins are public and visible to all authenticated users, with optional filtering for personalized feeds based on following relationships.

## Purpose

- **Social Sharing**: Users can post text updates with optional images about plants or gardens
- **Public Visibility**: All pins are publicly visible to authenticated users
- **Feed Personalization**: Users can view a personalized feed of pins from users they follow
- **Plant/Garden Association**: Pins can optionally reference specific plants or gardens

## Model

### Pin

#### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | AutoField | Primary key | Auto-generated |
| `content` | TextField | Pin text content | Required, max 150 characters |
| `image` | ImageField | Optional image | Optional, stored in `media/` |
| `created_at` | DateTimeField | Creation timestamp | Auto-set on creation |
| `creator` | ForeignKey(User) | Pin author | Required, CASCADE delete |
| `plant` | ForeignKey(Plant) | Associated plant | Optional, CASCADE delete |
| `garden` | ForeignKey(Garden) | Associated garden | Optional, CASCADE delete |

#### Related Names

- `user.pins` - Access all pins created by a user
- `plant.pins` - Access all pins referencing a plant
- `garden.pins` - Access all pins referencing a garden

#### Key Features

**Public by Default**:
- All pins are visible to all authenticated users
- No privacy settings or restrictions

**Optional Associations**:
- Pins can stand alone with just text/image
- Can optionally reference a plant, garden, or both
- References are validated - user must be a member of referenced gardens

**Content Limits**:
- Text content limited to 150 characters
- Keeps posts concise and social-media-like

## API Endpoints

### Authentication

All endpoints require authentication (`IsAuthenticated` permission).

---

### Create Pin

**`POST /api/pins/`**

Creates a new pin.

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | **Yes** | Pin text content (max 150 chars) |
| `image` | file | No | Image file upload |
| `plant` | integer | No | Plant ID to associate with pin |
| `garden` | integer | No | Garden ID to associate with pin |

**Example Request**:
```json
{
  "content": "My fern is thriving today!",
  "garden": 5,
  "plant": 12
}
```

**Response**:

| Field | Type | Description |
|-------|------|-------------|
| `detail` | string | Success message |
| `pin` | object | Created pin details |

**Pin Object**:

| Field | Type | Description |
|-------|------|-------------|
| `content` | string | Pin text content |
| `image` | string | Image URL (or null) |
| `creator` | string | Creator's username |
| `garden` | string | Garden name (or null) |
| `plant` | string | Plant nickname (or null) |
| `created_at` | datetime | Creation timestamp |

**Example Response**:
```json
{
  "detail": "added new pin!",
  "pin": {
    "content": "My fern is thriving today!",
    "image": null,
    "creator": "alice",
    "garden": "Alice's Garden",
    "plant": "Freddy",
    "created_at": "2026-02-06T10:30:00Z"
  }
}
```

**Access**: Any authenticated user

**Validation**:
- Content is required and cannot exceed 150 characters
- If plant is specified, user must have access to that plant
- If garden is specified, user must be a member of that garden
- Plant queryset is filtered to only plants in user's gardens

---

### List All Pins

**`GET /api/pins/`**

Returns all pins, ordered by most recent first.

**Query Parameters**:
- `owner` (optional): Filter by creator
  - `?owner=me` - Your own pins
  - `?owner=<user_id>` - Specific user's pins

**Response**: Array of pin objects (list format)

**List Pin Object**:

| Field | Type | Description |
|-------|------|-------------|
| `content` | string | Pin text content |
| `image` | string | Image URL (or null) |
| `creator` | string | Creator's username |
| `created_at` | datetime | Creation timestamp |

**Example**:
```json
[
  {
    "content": "Look at my new succulent!",
    "image": "/media/pin-image.jpg",
    "creator": "bob",
    "created_at": "2026-02-06T12:00:00Z"
  },
  {
    "content": "Garden update: Everything is blooming!",
    "image": null,
    "creator": "alice",
    "created_at": "2026-02-06T11:30:00Z"
  }
]
```

**Access**: Any authenticated user (all pins visible)

---

### Get Personalized Feed

**`GET /api/pins/feed/`**

Returns pins from users you follow, plus your own pins, ordered by most recent first.

**Response**: Array of pin objects (list format)

**Example**:
- If you follow users A and B
- Returns pins from A, B, and yourself
- Excludes pins from users you don't follow

**Access**: Any authenticated user

---

### Get Profile Feed

**`GET /api/pins/profile_feed/`**

Returns only the authenticated user's own pins, ordered by most recent first.

**Response**: Array of pin objects (list format)

**Example**:
```json
[
  {
    "content": "My latest garden update!",
    "image": "/media/my-garden.jpg",
    "creator": "alice",
    "created_at": "2026-02-06T14:00:00Z"
  },
  {
    "content": "Started a new plant today",
    "image": null,
    "creator": "alice",
    "created_at": "2026-02-06T10:00:00Z"
  }
]
```

**Use Case**: Display user's own pins on their profile page

**Difference from Feed**:
- `feed` - Shows pins from followed users + your own
- `profile_feed` - Shows only your own pins

**Access**: Any authenticated user (returns only their pins)

---

### Retrieve Pin Details

**`GET /api/pins/{id}/`**

Returns detailed information about a specific pin.

**Response**: Pin object (detail format)

**Detail Pin Object**:

| Field | Type | Description |
|-------|------|-------------|
| `content` | string | Pin text content |
| `image` | string | Image URL (or null) |
| `creator` | string | Creator's username |
| `garden` | string | Garden name (or null) |
| `plant` | string | Plant nickname (or null) |
| `created_at` | datetime | Creation timestamp |

**Example**:
```json
{
  "content": "My fern is thriving today!",
  "image": "/media/fern-photo.jpg",
  "creator": "alice",
  "garden": "Alice's Garden",
  "plant": "Freddy",
  "created_at": "2026-02-06T10:30:00Z"
}
```

**Access**: Any authenticated user

---

### Update Pin (Full)

**`PUT /api/pins/{id}/`**

Completely updates a pin (all fields required).

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | **Yes** | Pin text content |
| `image` | file | No | Image file |
| `plant` | integer | No | Plant ID |
| `garden` | integer | No | Garden ID |

**Response**: Updated pin object (detail format)

**Access**: Pin creator only (404 if not found, 403 if not creator)

---

### Update Pin (Partial)

**`PATCH /api/pins/{id}/`**

Partially updates a pin (only specified fields).

**Request Body**: Any subset of pin fields

**Example**:
```json
{
  "content": "Updated text!"
}
```

**Response**: Updated pin object (detail format)

**Access**: Pin creator only (404 if not found, 403 if not creator)

---

### Delete Pin

**`DELETE /api/pins/{id}/`**

Permanently deletes a pin.

**Response**: 204 No Content

**Access**: Pin creator only (404 if not found or not creator)

## Request/Response Field Summary

### Write Operations (Create/Update)

**Mandatory Fields**:
- `content` (string, max 150 chars)

**Optional Fields**:
- `image` (file upload)
- `plant` (integer, plant ID)
- `garden` (integer, garden ID)

### Read Operations

**List Format** (GET /api/pins/):
- `content`
- `image`
- `creator` (username string)
- `created_at`

**Detail Format** (GET /api/pins/{id}/):
- `content`
- `image`
- `creator` (username string)
- `garden` (garden name string or null)
- `plant` (plant nickname string or null)
- `created_at`

## Access Control

### Permission Model

- **Public Visibility**: All pins are visible to all authenticated users
- **Creator-Only Modification**: Only the pin creator can update or delete their pins
- **No Garden/Plant Restrictions**: Users can view pins referencing gardens/plants they're not members of

### Access Rules

| Action | Requirement |
|--------|-------------|
| View any pin | Any authenticated user |
| List all pins | Any authenticated user |
| View personalized feed | Any authenticated user (filtered to followed users) |
| View profile feed | Any authenticated user (only own pins) |
| Create pin | Any authenticated user |
| Update pin | Pin creator only |
| Delete pin | Pin creator only |

### Validation Rules

**When Creating Pins**:
- If `plant` is specified:
  - Plant must exist
  - User must have access to that plant (via garden membership)
- If `garden` is specified:
  - Garden must exist
  - User must be a member of that garden

**When Updating Pins**:
- Same validation as creation
- User can change which plant/garden the pin references
- User can remove plant/garden references

## Relationships

### User Integration

- **Creator**: Every pin belongs to a user
- **Cascade Deletion**: When user is deleted, their pins are deleted
- **Following System**: Feed endpoint uses user following relationships

### Garden/Plant Integration

- **Optional References**: Pins can reference gardens and plants
- **No Access Restriction**: Referenced items don't restrict pin visibility
- **Cascade Deletion**: When garden/plant is deleted, pins referencing them are deleted
- **Name Display**: Serializers show garden/plant names (not IDs) in responses

## Service Functions

### `create_pin(creator, data)`

Creates a new pin with validation.

**Parameters**:
- `creator`: User instance creating the pin
- `data`: Dictionary with pin fields

**Fields**:
- `content` (required)
- `image` (optional)
- `garden` (optional)
- `plant` (optional)

**Returns**: Pin instance

**Example**:
```python
from social_feed.services import create_pin

pin = create_pin(
    creator=request.user,
    data={
        "content": "My plant is growing!",
        "garden": garden_instance,
        "plant": plant_instance
    }
)
```

## Serializers

### PinWriteModeSerializer

Used for create and update operations.

**Features**:
- Validates plant/garden references
- Filters querysets based on user's garden memberships
- Ensures user can only reference gardens they're members of
- Ensures user can only reference plants from their gardens

### PinDetailReadModeSerializer

Used for detailed pin views.

**Features**:
- Shows garden/plant names (not IDs)
- Shows creator username
- Includes all pin metadata

### PinListReadModeSerializer

Used for list views and feeds.

**Features**:
- Simplified format for list views
- Excludes garden/plant details to reduce response size
- Shows only creator username

## Image Handling

- **Upload Path**: Images stored in `media/`
- **Optional Field**: Images are not required
- **Field Type**: `ImageField` (requires Pillow library)
- **Usage**: Send as multipart/form-data when uploading
s

### Personalized Feed

The personalized feed (`GET /api/pins/feed/`) shows:
1. All pins from users you follow
2. Your own pins
3. Ordered by creation time (most recent first)

**Implementation**:
```python
following_ids = request.user.following.values_list('id', flat=True)
pins = Pin.objects.filter(
    Q(creator__in=following_ids) | Q(creator=request.user)
).order_by('-created_at')
```

### Profile Feed

The profile feed (`GET /api/pins/profile_feed/`) shows:
1. Only pins created by the authenticated user
2. Ordered by creation time (most recent first)

**Implementation**:
```python
pins = Pin.objects.filter(creator=request.user).order_by('-created_at')
```

**Use Cases**:
- User profile page showing their activity
- "My Posts" section in user dashboard
- Personal pin historyrder_by('-created_at')
```

## Usage Examples

### Creating a Pin with Plant Reference

```python
from social_feed.services import create_pin
from plants.models import Plant

plant = Plant.objects.get(pk=5)
pin = create_pin(
    creator=request.user,
    data={
        "content": "Look at my beautiful fern!",
        "plant": plant
    }
)
```

### Creating a Standalone Pin

```python
pin = create_pin(
    creator=request.user,
    data={
        "content": "General gardening tip: water in the morning!"
    }
)
```

### Querying User's Pins

```python
# Get all pins by a user
user_pins = Pin.objects.filter(creator=user)

# Get recent pins
recent_pins = Pin.objects.all().order_by('-created_at')[:10]

# Get pins about a specific plant
plant_pins = Pin.objects.filter(plant=plant_instance)
```

## Testing

See [tests.py](tests.py) for comprehensive test coverage including:
- CRUD operations
- Access control validation
- Feed filtering
- Query parameter filtering
- Creator-only modification
- Garden/plant reference validation