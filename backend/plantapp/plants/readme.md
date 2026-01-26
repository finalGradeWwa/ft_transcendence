## plants - Django application 

GARDEN SYSTEM - based on Django-organizations package - new: Garden as organization, GardenUser as membership and GardenOwner as ownership, appropriate API endpoints (list user's gardens, get garden details, delete garden, create plant)
API endpoints for deleting GardenUser (owner only) and adding a GardenUser (owner only)
updated PLANTS system - plants belong to owner and garden (optionally), appropriate views (list plants, get specific plant, delete a plant, create a plant)


### BACKEND REQUEST MAP
GET    /api/plant/
-> list all plants user has access to

GET    /api/plant/?garden=3
-> list plants only from garden 3

GET    /api/plant/5/
-> get details for plant with id 5

POST   /api/plant/
-> create a new plant
  body: { name, garden, image, ... }

DELETE /api/plant/5/
-> delete plant 5

PUT /api/plant/5/ 
-> updates object's properties

PATCH /api/plant/5/
-> updates object's properties (partially)