# ft_transcendence

*This project has been created as part of the 42 curriculum by zogorzeb, prutkows, phoehne, mwojtcza and mlibucha*
# Description

The Plant Portal is a full-stack social networking application for plant lovers to manage plants, organize collaborative gardens, share updates via social feeds, add other users to friends, and communicate through chat.

## Key features

### Core functionalities

- **Authentication:** Registration, login, JWT tokens, GitHub OAuth, password management (prutkows as backend dev & phoehne as frontend dev)

- **User Profiles:** Avatars, friends system, social connections (prutkows as backend dev, mwojtcza & phoehne as frontend dev)

- **Gardens:** Collaborative spaces (organizations) with multi-user access, auto-created default gardens (zogorzeb as backend dev & phoehne as frontend dev) 

- **Plants:** Create, read and delete operations with images, garden association, owner-based filtering (zogorzeb as backend dev & phoehne as frontend dev)

- **Social Feed (Pins):** Posts with images, personalized feeds from friends (zogorzeb as backend dev & phoehne as frontend dev)

- **Chat System:** Direct messaging with inbox, conversation history (mlibucha as backend dev & mwojtcza as frontend dev)

  

### Accessibility & i18n

- **WCAG 2.1 AA compliant** with skip links, keyboard navigation, screen reader support 

- **4 languages:** Polish, English, German, Arabic with RTL layout mirroring 

### Design System

- Custom component library (10+ reusable components)

- Typography system with variants

- Responsive, mobile-first design with custom color palette

## Architecture Highlights

- **Organization-based collaboration** using django-organizations for gardens

- **Django signals** for side effects (auto-create gardens)

- **Component-driven architecture**

- **HttpOnly cookies** for secure token storage
___
# instructions

  ## �� Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Make (optional)
- Git

**Ubuntu/Debian: Prerequisites instalation and configuration**
```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin build-essential git
sudo usermod -aG docker $USER  # Log out and back in after this
```

## �� Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/finalGradeWwa/ft_transcendence.git
cd ft_transcendence
```

### 2. Configure environment variables
Create a `.env` file in the project root:
```bash
cat > .env << EOF
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG_VALUE=True
COOKIE_SECURE=True
ALLOWED_HOSTS=localhost,127.0.0.1, backend
# Docker backend: REDIS_HOST=redis, REDIS_PORT=6379
# Local backend (outside Docker): REDIS_HOST=localhost, REDIS_PORT=6379
REDIS_HOST=redis
REDIS_PORT=6379
SOCIAL_AUTH_GITHUB_KEY=your-github-client-id
SOCIAL_AUTH_GITHUB_SECRET=your-github-client-secret
FRONTEND_URL=https://localhost:8443
FRONTEND_BASE_URL=https://localhost:8443
EOF
```
### 3. Build and start the application
```bash
make build
make up
```

Or using Docker Compose directly:
```bash
docker compose build
docker compose up -d
```

### 4. Verify services are running
```bash
make ps
# or
docker compose ps
```

You should see all services in "Up" state.

## �� Access the Application
- **Frontend (via HTTPS)**: https://localhost:3000
- **Backend API**: http://localhost:8000/api/
**Note**: Your browser will show a security warning for the self-signed certificate. This is normal for local development—click "Advanced" and proceed.

## ��️ Development Commands

### Using Makefile
```bash
make help           # Show all available commands
make build          # Build Docker images
make up             # Start all services
make down           # Stop all services
make restart        # Restart all services
make logs           # View all service logs
make ps             # List running containers
```

### View logs
```bash
# All services
make logs

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f nginx
```

### Restart a specific service
```bash
docker compose restart frontend
docker compose restart backend
docker compose restart nginx
```

## �� Uninstallation

### Stop and remove containers
```bash
make down
```

### Remove containers, volumes, and images
```bash
make clean
```

### Complete cleanup (including build cache)
```bash
make fclean
docker system prune -a --volumes
```

### Manual cleanup
```bash
# Stop and remove containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Remove images
docker compose down -v --rmi all

# Remove everything including build cache
docker compose down -v --rmi all
docker builder prune -a
```

### Remove project directory
```bash
cd ..
rm -rf ft_transcendence
```
___

to check if Redis is working:

- build (if something is failing use build --no-cache) and start Docker containers (make up)
- go to /backend/plantapp
- run ./manage test_redis
- this should be the output:
`Using: RedisChannelLayer ✓ Redis working!`

# Individual Contributions

## prutkows (Paweł Rutkowski) - tech lead & backend developer
- Major backend apps: authentication (auth, registration, JWT management), users (user profiles)
- Responsible for setting up OAuth 2.0
- GitHub CodeOwner, reviewing every pull request on GitHub
- Making major decisions on the collaboration rules, ensuring the technical quality of the application
- Setting up website security (SSL certificates)

## zogorzeb (Zofia Gorzęba) - project manager & backend developer
- Major backend apps: gardens (collaborative plant organization), plants (individual plant management), social_feed (pin posting system), chat_app (redis service)
- Reviewing backend pull requests
- GitHub issues management
- Ensuring the communication in the group, distribution of tasks, ensuring coverage of the project's requirements
- Responsible for the technical (redis description) and whole non-technical part of Readme file
- Responsible for the organizations system backend mechanism (Gardens)

## phoehne (Przemysław Hoehne) - main frontend developer
- Major frontend functionalities: main page, profile page, footer, all the forms and user inputs validation, gardens view, plants view
- Integrating frontend modules together
- Reviewing frontend pull requests
- Responsible for custom design system with reusable components, support for multiple languages, RTL language support, support for additional browsers

## mlibucha (Mateusz Libucha) - backend developer
- Major backend apps: users (friends system), chat_app (messaging with WebSocket infrastructure)
- Infrastructure set up: Docker Compose, Daphne ASGI server, Nginx service
- Setting up website security (SSL certificate for backend)
- Providing Makefile and technical part of Readme (prerequisites, instructions)

## mwojtcza (Mateusz Wojtczak) - product owner & frontend developer
- Ensuring the application's quality, making decisions on the key business features, providing ideas visualization
- Major frontend functionalities: search bar, chat (WebSockets and visual side), online presence status, friend system
- Supporting the communication between teammembers and easing conflicts
- Implementation of data fixtures for the testing purposes
- Reviewing frontend + backend pull requests
___
# Chosen modules
## Minor modules
### **Usage of a frontend framework**
The frontend framework used in this project is Next.js, a React-based framework for building web applications. The project also uses TypeScript, Tailwind CSS for styling, and internationalization with next-intl.
### **Usage of a backend framework**
The backend framework used in this project is Django, a high-level Python web framework.
### **Support for multiple languages (at least 3 languages).**
This project supports multiple languages, primarily through the frontend using Next.js with next-intl for internationalization. The supported locales are: Polish, English, German and Arabic.
### **Right-to-left (RTL) language support.**
The supported right-to-left language is Arabic.
### **Support for additional browsers.**
The supported browsers are Google Chrome
### **Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components)**
The project exceeds the requirement with 15+ reusable components, a complete custom color palette (9 brand colors), a typography system with 4 variants, and a professional icon library integration.
### **Implementation of remote authentication with OAuth 2.0 (GitHub)**
GitHub OAuth2 authentication with custom pipeline functions for email extraction and JWT token generation. Backend configuration includes environment-validated credentials, user email scope access, and HTTPS redirect enforcement. JWT tokens stored in httpOnly cookies with CSRF protection and sanitized redirects. Frontend provides GitHub login button with locale preservation and callback handling.
### **ORM for Database**
Django ORM with SQLite3 database managing 9 core models: User, Garden, Plant, Pin, Message, UserProfile, GardenUser, GardenOwner, and GardenInvitation. Implements foreign keys with CASCADE deletion, self-referential many-to-many relationships for user following, one-to-one relationships, automatic timestamps, and custom model methods. Full migration history with schema version control and automatic indexing on primary keys, foreign keys, and unique fields.
# Major modules
###  **WCAG 2.1 AA Accessibility Compliance**
Skip links allow bypassing navigation. All interactive elements have visible focus indicators with escape key handlers and proper tab order. Screen reader support includes 13+ localized ARIA labels across 4 languages, semantic HTML landmarks, and proper alt text. High contrast colors achieve 7.2:1 ratio for primary elements and 16.8:1 for text. Touch targets meet 32px minimum with responsive text scaling supporting 200% zoom. Dynamic language attributes with RTL support for Arabic and proper error message associations.
### **Allow users to interact with other users.**
- Real-time messaging with Message model, UserProfile for online status tracking, inbox view with last message preview, conversation endpoint for message history with pagination, and send message functionality.
- User model with profile fields (username, email, name, avatar, date joined). MeView for GET/PATCH of own profile, UserProfileView for viewing any user by username, with validation preventing duplicate credentials.
- ManyToMany following field with mutual connections as friends, one-way as pending requests. Complete API: send/accept/reject/cancel friend requests, unfriend, list friends/incoming/outgoing requests. Model methods: get_friends(), get_pending_requests(), get_outgoing_requests(), is_friend_with(), unfriend().
### **Standard user management and authentication.**
User model includes authentication with email/password, JWT tokens stored in httpOnly cookies for security, and GitHub OAuth2 integration. Profile updates supported through PATCH endpoint with validation preventing duplicate usernames/emails. Avatar upload functionality via ImageField with multipart form parser support, stored in avatars directory. Friend system uses ManyToMany relationship with mutual connections representing friendships and one-way connections as pending requests, complete with send/accept/reject/cancel request endpoints and unfriend functionality. UserProfile model tracks online status and last seen timestamp. Profile viewing available through dedicated endpoint accepting username parameter, displaying user information including avatar, name, email and join date. Profile serializers expose appropriate data with privacy controls distinguishing between own profile and public profiles.
### **An organization system**
Garden model extends django-organizations Organization with CRUD endpoints for create, read, update, and delete operations. GardenUser junction table manages membership with endpoints to add and remove users from gardens. GardenOwner tracks ownership relationships. Gardens include environment type field, member/owner management, and plant association. Full CRUD functionality implemented through ViewSet with permission-based access control restricting operations to garden members and owners. Auto-creation of default garden for new users via Django signals.
### **Implement real-time features using WebSockets or similar technology.**
Django Channels with Daphne ASGI server. ChatConsumer handles WebSocket connections at ws/chat/ with JWT authentication middleware. Connection handling includes accept for authenticated users, automatic online status updates on connect, and graceful cleanup on disconnect with status updates and group removal. Message broadcasting uses channel layers with personal user rooms, supporting chat messages, typing indicators, and read receipts. Real-time features include instant message delivery to recipient rooms, typing notifications, read receipt confirmations, and online/offline status tracking via UserProfile model. Database operations wrapped with database_sync_to_async for message persistence, user lookups, and read status updates. Error handling includes JSON validation, message length limits (10000 chars), recipient verification, and proper exception logging. ASGI application configured with ProtocolTypeRouter and JWT authentication stack for secure WebSocket connections.
## modules points summary 
9 minor modules (8 x 1) + 5 major modules (5 x 2) = 18 points 
___
# Project Management
The project manager (zogorzeb) was responsible for distributing the tasks. These were distributed during online meetings or via GitHub Issues. Zosia added tasks to GitHub Issues, and the rest of the team assigned tasks to themselves. In most of the cases, the tasks were talked about and assigned to the team member during the meeting. Slack and Google Meet were used for communication. The whole team actively communicated on Slack, reporting blockers and preparing pull requests for review. We held video calls every Monday and Thursday to discuss availability and progress.

___
# Technical Stack
## Backend technologies and frameworks used.

- Django framework for the main backend implementation
- Django Rest Framework for the API endpoints
- Django Channels for the real-time chat implementation
- Simple JWT for the authentication tokens
# Frontend technologies and frameworks used
- Framework: Next.js 16 - Using App Router for modern routing, image optimization, and Server Components
- UI Library: React 19 - Latest version with Actions support and native metadata handling
- Styling: Tailwind CSS v3.4 - Utility-first CSS with `@tailwindcss/typography` plugin for markdown content
-  Language: TypeScript v5*- Type safety and auto-completion throughout the codebase
- Internationalization: Next-Intl v4.6 - Multi-language support with server and client-side translations
**Key Helper Libraries:**
- Lucide-react - Lightweight icon library
- React-markdown - Renders formatted Markdown content (chat messages, instructions)
- Js-cookie - Cookie management for session tokens and language preferences
___
# Database System & Schema
The Django web framework includes a default object-relational mapping layer (ORM) that can be used to interact with application data from various relational databases such as SQLite. Django's ORM makes database work easier by letting developers use Python classes instead of writing SQL.

<img width="1070" height="768" alt="Screenshot from 2026-03-08 15-39-49" src="https://github.com/user-attachments/assets/28983b52-62af-4d09-a2a8-6feb0678062c" />
<img width="1065" height="753" alt="Screenshot from 2026-03-08 15-40-05" src="https://github.com/user-attachments/assets/b0840e1c-202b-4b8b-9057-36b29e703051" />
<img width="1061" height="703" alt="Screenshot from 2026-03-08 15-40-14" src="https://github.com/user-attachments/assets/6027597b-b2a2-436c-8a84-1104da63d2bf" />
<img width="1087" height="827" alt="Screenshot from 2026-03-08 15-40-24" src="https://github.com/user-attachments/assets/f2ec7f89-4ee9-4540-acd1-137c8b3f2df8" />

___
# resources (+ AI usage)
- 📘 Canva Visualisation: [canva](https://www.canva.com/design/DAG97aUDBss/Z4gOAUNjw9QdsX-HSqcBqA/edit) (created by mwojtcza)
## frontend
- https://www.geeksforgeeks.org/css/tailwind-css/
- https://tailwindcss.com
- https://pl.legacy.reactjs.org/tutorial/tutorial.html
- https://nextjs.org/learn
- https://www.youtube.com/watch?v=ZVnjOPwW4ZA
## backend
- https://docs.djangoproject.com/en/6.0/
- https://django-organizations.readthedocs.io/en/latest/
- https://channels.readthedocs.io/en/latest/
- https://tutorial.djangogirls.org/en/django/?q=
- https://django-rest-framework-simplejwt.readthedocs.io/en/latest/#
- https://python-social-auth.readthedocs.io/en/latest/configuration/django.html
- https://www.django-rest-framework.org/
## AI help
- Copilot code review on GitHub
- Debugging code
- Writing tests & CI workflow configuration
- Playwright tests
- Database schema text representation
- Translations, especially for the Arabic language

