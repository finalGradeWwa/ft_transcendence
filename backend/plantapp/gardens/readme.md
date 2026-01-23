## backend url map
GET    api/gardens/                 → garden-list
POST   api/gardens/                 → garden-list
GET    api/gardens/{id}/            → garden-detail
DELETE api/gardens/{id}/            → garden-detail

POST   api/gardens/{id}/add-user/   → garden-add-user
DELETE api/gardens/{id}/users/{user_pk}/ → garden-remove-user