## backend url map


GARDEN SYSTEM - based on Django-organizations package - new: Garden as organization, GardenUser as membership and GardenOwner as ownership, appropriate API endpoints (list user's gardens, get garden details, delete garden, create plant)
API endpoints for deleting GardenUser (owner only) and adding a GardenUser (owner only)

GET    /api/garden/                 → garden-list
POST   /api/garden/                 → garden-list
GET    /api/garden/{id}/            → garden-detail
DELETE /api/garden/{id}/            → garden-detail

POST   /api/garden/{id}/add-user/   → garden-add-user
DELETE /api/garden/{id}/users/{user_pk}/ → garden-remove-user
