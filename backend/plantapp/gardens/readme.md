## backend url map
GET    /gardens/                 → garden-list
POST   /gardens/                 → garden-list
GET    /gardens/{id}/            → garden-detail
DELETE /gardens/{id}/            → garden-detail

POST   /gardens/{id}/add_user/   → garden-add-user
DELETE /gardens/{id}/users/{uid}/ → garden-remove-user