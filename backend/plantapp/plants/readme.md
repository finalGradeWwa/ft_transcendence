## plants - Django application 

GARDEN SYSTEM - based on Django-organizations package - new: Garden as organization, GardenUser as membership and GardenOwner as ownership, appropriate API endpoints (list user's gardens, get garden details, delete garden, create plant)
API endpoints for deleting GardenUser (owner only) and adding a GardenUser (owner only)
updated PLANTS system - plants belong to owner and garden (optionally), appropriate views (list plants, get specific plant, delete a plant, create a plant)


### BACKEND REQUEST MAP
GET    /plants/
→ list all plants user has access to

GET    /plants/?garden=3
→ list plants only from garden 3

GET    /plants/5/
→ get details for plant with id 5

POST   /plants/
→ create a new plant
  body: { name, garden, image, ... }

DELETE /plants/5/
→ delete plant 5

PUT /plants/5/ & PATCH /plants/5/
-> updates object's properties