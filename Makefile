.PHONY: help build up down logs restart clean ps fclean backend frontend logs-backend logs-frontend dev-up dev-down

# Docker Compose file
COMPOSE_FILE = docker-compose.yml

help:
	@echo "ft_transcendence Commands"
	@echo "=================================="
	@echo ""
	@echo "Docker Commands:"
	@echo "  make build       - Build Docker images"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make logs        - View service logs"
	@echo "  make restart     - Restart all services"
	@echo "  make ps          - List running containers"
	@echo "  make clean       - Remove containers, images, volumes"
	@echo "  make fclean      - Remove containers, images, volumes, Build cache"
	@echo "  make backend     - Build and start backend only"
	@echo "  make frontend    - Build and start frontend only"
	@echo ""
# 	@echo "NPM Commands:"
# 	@echo "  make install     - Install frontend dependencies"
# 	@echo "  make npm-remove  - Remove a frontend dependency"
# 	@echo "  make npm-clean   - Clean and reinstall frontend dependencies"
# 	@echo ""

build:
	docker-compose -f $(COMPOSE_FILE) build

up:
	docker-compose -f $(COMPOSE_FILE) up -d

down:
	docker-compose -f $(COMPOSE_FILE) down

logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

restart:
	docker-compose -f $(COMPOSE_FILE) restart

ps:
	docker-compose -f $(COMPOSE_FILE) ps

clean:
	docker-compose -f $(COMPOSE_FILE) down -v --rmi local

fclean:
	docker-compose -f $(COMPOSE_FILE) down -v
	docker system prune -af --volumes

backend:
	docker-compose -f $(COMPOSE_FILE) up -d --build backend

frontend:
	docker-compose -f $(COMPOSE_FILE) up -d --build frontend


# install:
# 	cd frontend && npm install

# npm-remove:
# 	cd frontend && npm uninstall

# npm-clean:
# 	cd frontend && rm -rf node_modules package-lock.json && npm install

# Logs
logs-backend:
	docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend:
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

# Development
dev-up: build up logs

dev-down: down clean
