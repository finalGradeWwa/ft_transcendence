# Gardens App

A Django REST Framework application for managing gardens with multi-user collaboration. Users can create and manage gardens, invite other users, and organize their plants by environment type (indoor, outdoor, greenhouse).

## Overview

The Gardens app is built on top of the Django-organizations package, providing:
- **Garden Management**: Create, retrieve, update, and delete gardens
- **Multi-user Collaboration**: Add and manage garden members
- **Ownership Model**: Track garden owners separately from members
- **Environment Types**: Categorize gardens by location (indoor, outdoor, greenhouse)
- **Access Control**: Automatic garden creation on user registration, permission-based operations

## Models

### Garden
The main model representing a garden organization.

**Fields:**
- `garden_id` (AutoField): Primary key, auto-generated
- `name` (CharField): Garden name (inherited from Organization)
- `environment` (CharField): Garden environment type
  - `"I"` - Indoor (default)
  - `"O"` - Outdoor
  - `"G"` - Greenhouse

**QuerySet Methods:**
- `visible_to(user)`: Returns gardens that are public or where the user is a member

### GardenUser
Represents membership of a user in a garden.

**Fields:**
- `organization` (ForeignKey): Reference to Garden
- `user` (ForeignKey): Reference to User
- `created_at` (DateTimeField): When the user joined

### GardenOwner
Represents ownership relationship of a user in a garden.

**Fields:**
- `organization` (ForeignKey): Reference to Garden
- `organization_user` (ForeignKey): Reference to GardenUser

### GardenInvitation
Handles invitation system for gardens (optional feature).

**Fields:**
- `organization` (ForeignKey): Reference to Garden

## API Endpoints

### CRUD Operations

| Method | Endpoint | Name | Permission | Description |
|--------|----------|------|-----------|-------------|
| GET | `/api/garden/` | garden-list | Authenticated | List all user's gardens |
| POST | `/api/garden/` | garden-list | Authenticated | Create new garden |
| GET | `/api/garden/{id}/` | garden-detail | Authenticated | Get garden details |
| DELETE | `/api/garden/{id}/` | garden-detail | Owner | Delete garden |

### Custom Actions

| Method | Endpoint | Name | Permission | Description |
|--------|----------|------|-----------|-------------|
| POST | `/api/garden/{id}/add-user/` | garden-add-user | Owner | Add user to garden |
| DELETE | `/api/garden/{id}/users/{user_pk}/` | garden-remove-user | Owner | Remove user from garden |

## Permissions

- **Garden List**: Only authenticated users can view their own gardens
- **Garden Detail**: Users can only view gardens they are members of
- **Create Garden**: Authenticated users can create gardens
- **Delete Garden**: Only garden owner can delete
- **Add User**: Only garden owner can add users to the garden
- **Remove User**: Only garden owner can remove users from the garden

## Usage

### Create a Garden

**Request:**
```
POST /api/garden/
Content-Type: application/json

{
  "name": "Outdoor Garden",
  "environment": "O"
}
```

**Response:**
```json
{
  "detail": "Your new Outdoor Garden garden has been created.",
  "garden_id": 1
}
```

### List User's Gardens

**Request:**
```
GET /api/garden/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Outdoor Garden",
    "environment": "O",
    "user_count": 2
  }
]
```

### Get Garden Details

**Request:**
```
GET /api/garden/1/
```

**Response:**
```json
{
  "id": 1,
  "name": "Outdoor Garden",
  "environment": "O",
  "owner": "alice",
  "user_count": 2
}
```

### Add User to Garden

**Request:**
```
POST /api/garden/1/add-user/
Content-Type: application/json

{
  "user_id": 2
}
```

**Response:** Status 201 Created

### Remove User from Garden

**Request:**
```
DELETE /api/garden/1/users/1/
```

**Response:** Status 204 No Content

## Features

### Automatic Garden Creation
When a new user registers, a default garden is automatically created:
- Garden name: `"{username}'s Garden"`
- Environment: Indoor (default)
- User is automatically added as member and owner

### Idempotent User Addition
Adding an existing member to a garden returns 201 Created without creating duplicates.

### Visibility Control
The `visible_to()` queryset method allows filtering gardens based on:
- Public gardens (anyone can see)
- Private gardens (only members can see)

## Testing

Run tests with:
```bash
python manage.py test plantapp.gardens
```

Test coverage includes:
- Authentication requirements
- CRUD operations
- Permission checks
- Automatic garden creation on user registration
- Multi-user garden management
- Environment type verification