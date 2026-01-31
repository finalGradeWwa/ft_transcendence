## plants - objects that belong to gardens and (optionally) users
to create a plant we need to choose a garden, add a photo, nickname, species

### BACKEND REQUEST MAP
GET    /api/plant/
-> list all plants user has access to

GET    /api/plant/?garden=3
-> list plants only from garden 3

GET    /api/plant/5/
-> get details for plant with id 5

POST   /api/plant/
-> create a new plant
  body: { nickname, species, garden, image }

DELETE /api/plant/5/
-> delete plant 5

PUT /api/plant/5/ 
-> updates object's properties

PATCH /api/plant/5/
-> updates object's properties (partially)