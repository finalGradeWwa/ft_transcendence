# Gardens App

## Overview

The Gardens app provides a collaborative space management system where users can create and manage gardens, add members, and organize plants. All authenticated users can view all gardens, but only owners have administrative control over membership and settings.

## Purpose

- **Collaborative Plant Management**: Multiple users can share a single garden and manage plants together
- **User Organization**: Gardens serve as organizational units for grouping plants and users
- **Public Viewing**: All authenticated users can browse and view all gardens
- **Owner-based Control**: Owners have full control over membership and garden settings
- **Automatic Setup**: Every new user automatically gets a personal garden created via Django signals

## Models

### Garden

Extends `Organization` from django-organizations, providing the core garden entity.

#### Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `garden_id` | AutoField | Primary key | Auto-generated |
| `name` | CharField | Garden name (inherited) | Required |

| `environment` | CharField | Garden environment type | "I" (Indoor) |

#### Environment Choices

- **`I` (Indoor)**: Plants kept inside buildings
- **`O` (Outdoor)**: Plants in outdoor spaces
- **`G` (Greenhouse)**: Plants in greenhouse structures

### GardenUser

Links users to gardens (membership relationship).

| Field | Type | Description |
|-------|------|-------------|
| `organization` | ForeignKey | Reference to Garden |
| `user` | ForeignKey | Reference to User model |

**Related name**: `user.memberships` - Access all garden memberships for a user

### GardenOwner

Designates garden owners with full administrative privileges.

| Field | Type | Description |
|-------|------|-------------|
| `organization` | ForeignKey | Reference to Garden |
| `organization_user` | ForeignKey | Reference to GardenUser |

**Related name**: `gardenuser.ownerships` - Access ownership records

### GardenInvitation

Handles garden invitation system (extends django-organizations).

| Field | Type | Description |
|-------|------|-------------|
| `organization` | ForeignKey | Reference to Garden |

## API Endpoints

### Authentication

All endpoints require authentication (`IsAuthenticated` permission).

### List Gardens

**`GET /api/garden/`**

Returns all gardens (visible to all authenticated users).

**Query Parameters**:
- `owner` (optional): Filter by owner - use `me` for your own gardens or a user ID for specific user's gardens

**Examples**:
- `/api/garden/` - All gardens
- `/api/garden/?owner=me` - Only your gardens
- `/api/garden/?owner=42` - Gardens owned by user 42

**Response Fields**:
- `garden_id`: Garden identifier
- `name`: Garden name
- `environment`: Environment type (I/O/G)
- `user_count`: Number of members

**Access**: Any authenticated user

**Note**: By default, this returns **all gardens**. Use the `?owner=me` query parameter to see only your own gardens.

---

### Create Garden

**`POST /api/garden/`**

Creates a new garden with the authenticated user as owner.

**Request Body**:
```json
{
  "name": "My Garden",
  "environment": "I"  // Optional, defaults to "I"
}
```

**Response**:
```json
{
  "detail": "Your new My Garden garden has been created.",
  "garden_id": 123
}
```

**Access**: Any authenticated user

**Note**: User automatically becomes the garden owner

---

### Retrieve Garden Details

**`GET /api/garden/{id}/`**

Returns detailed information about a specific garden.

**Response Fields**:
- `garden_id`: Garden identifier
- `name`: Garden name
- `environment`: Environment type
- `plants`: Array of plants in the garden
- `owner`: Username of garden owner
- `user_count`: Number of members

**Access**: Any authenticated user

---

### Delete Garden

**`DELETE /api/garden/{id}/`**

Permanently deletes a garden and all associated data.

**Response**: 204 No Content

**Access**: Garden owners only (404 if not an owner)

---

### Add Garden Member

**`POST /api/garden/{id}/add_user/`**

Adds a new member to the garden.

**Request Body**:
```json
{
  "user_id": 456
}
```

**Response**:
```json
{
  "detail": "new garden member has been added.",
  "garden_id": 456
}
```

**Access**: Garden owners only (403 if not an owner)

**Note**: Operation is idempotent - adding an existing member succeeds without duplicates

---

### Remove Garden Member

**`DELETE /api/garden/{id}/users/{user_id}/`**

Removes a member from the garden.

**Response**: 204 No Content

**Access**: Garden owners only (403 if not an owner)

## User Access & Permissions

### Permission Levels

1. **All Users**: Can view all gardens and their details
2. **Members**: Can create and modify plants within the garden
3. **Owners**: Full control including:
   - Adding/removing members
   - Deleting the garden
   - All member privileges

### Access Matrix

| Action | Any User | Member | Owner |
|--------|----------|--------|-------|
| View garden details | ✅ | ✅ | ✅ |
| List all gardens | ✅ | ✅ | ✅ |
| Create new garden | ✅ | ✅ | ✅ |
| Modify plants in garden | ❌ | ✅ | ✅ |
| Delete garden | ❌ | ❌ | ✅ |
| Add members | ❌ | ❌ | ✅ |
| Remove members | ❌ | ❌ | ✅ |

## Automatic Garden Creation

When a new user registers, a Django signal automatically:
1. Creates a garden named `"{username}'s Garden"`
2. Sets environment to Indoor (`I`)
3. Adds user as a member
4. Makes user the owner
5. Garden is visible to all users, but only the owner can manage it

**Implementation**: See [signals.py](signals.py#L7-L30)

## Service Functions

### `create_garden(creator, data)`

Creates a new garden with proper ownership setup.

**Parameters**:
- `creator`: User instance who will own the garden
- `data`: Dictionary with `name` (required) and `environment` (optional)

**Returns**: Garden instance

---

### `add_garden_user(owner, garden, user_to_add)`

Adds a user to a garden with permission checking.

**Parameters**:
- `owner`: User instance requesting the action
- `garden`: Garden instance to add user to
- `user_to_add`: User instance to be added

**Raises**: `PermissionError` if owner is not a garden owner

**Returns**: GardenUser instance (or existing if already a member)

## Usage Examples

### Creating a Garden
```python
from gardens.services import create_garden

garden = create_garden(
    creator=request.user,
    data={"name": "Community Garden", "environment": "O"}
)
```

### Adding a Member
```python
from gardens.services import add_garden_user

garden_user = add_garden_user(
    owner=request.user,
    garden=garden_instance,
    user_to_add=user_to_add_instance
)
```

## Related Models

- **User**: Django authentication user model
- **Plant**: Plants belong to gardens (see plants app)
- **Organization**: Base model from django-organizations package

## Testing

Comprehensive test coverage in [tests.py](tests.py) includes:
- Authentication requirements
- Permission checks
- CRUD operations
- Member management
- Automatic garden creation
- Environment field handling

### print out debug
```	print("\n=== Response Data ===")
	print(f"Status Code: {response.status_code}")
	print(f"Number of gardens: {len(response.data)}")
	print(f"Response data: {response.data}")
	print("=====================\n")```