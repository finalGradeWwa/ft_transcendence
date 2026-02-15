# GitHub Actions Workflows

This directory contains CI/CD workflows for the ft_transcendence project.

## Overview

| Workflow | File | Trigger | Jobs |
|----------|------|---------|------|
| Frontend CI | `ci-frontend.yml` | PR + push to main | lint, test-unit, test-e2e, build |
| Backend CI | `ci-backend.yml` | PR + push to main | lint, test |

---

## ci-frontend.yml

### Purpose
Runs continuous integration checks for the Next.js frontend application.

### Jobs

#### 1. lint
- **Purpose**: Run ESLint to check for code quality issues
- **Command**: `npm run lint`

#### 2. test-unit
- **Purpose**: Run Jest unit tests
- **Command**: `npm run test`

#### 3. test-e2e
- **Purpose**: Run Playwright end-to-end tests
- **Browsers**: Chromium, Firefox, Microsoft Edge
- **Command**: `npx playwright test`
- **Note**: Requires Docker for Playwright browsers

#### 4. build
- **Purpose**: Build the Next.js application
- **Command**: `npm run build`

---

## ci-backend.yml

### Purpose
Runs continuous integration checks for the Django backend application.

### Jobs

#### 1. lint
- **Purpose**: Run ruff linter on Python code
- **Command**: `ruff check backend/plantapp/`

#### 2. test
- **Purpose**: Run Django unit/integration tests with coverage
- **Command**: `python backend/plantapp/manage.py test backend/plantapp/`
- **Coverage**: Generates `coverage.xml` and uploads to Codecov

---

## Running Locally

### Using act

[act](https://github.com/nektos/act) runs GitHub Actions locally using Docker.

#### Installation

```bash
# Download act
curl -L "https://github.com/nektos/act/releases/download/v0.2.84/act_Linux_x86_64.tar.gz" -o act.tar.gz
tar -xzf act.tar.gz
mv act ~/.local/bin/act

# Add to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### Usage

```bash
# List available workflows/jobs
act -l

# Run specific workflow
act -W .github/workflows/ci-frontend.yml
act -W .github/workflows/ci-backend.yml

# Run specific job
act -j lint
act -j test-unit
act -j test-e2e

# Dry run (preview only)
act -n

# Run with specific container
act --container-runtime docker
```

---

## Environment Variables

### Frontend (ci-frontend.yml)
- `CI=true` - Enables CI mode for Playwright

### Backend (ci-backend.yml)
- `DJANGO_SETTINGS_MODULE=mysite.settings`
- `PYTHONPATH=backend/plantapp`

---

## Dependencies

### Frontend
- Node.js 20
- npm dependencies (installed via `npm ci`)

### Backend
- Python 3.12
- Django 6.0
- coverage.py (for test coverage)

---

## Troubleshooting

### act requires Docker
If you see errors about Docker, ensure Docker is running:
```bash
docker ps
```

### Slow first run
On first run, `act` pulls Docker images for the jobs. This can take time. Use `-P` to pull images:
```bash
act -P
```

### Skip specific jobs
Run only specific jobs to speed up testing:
```bash
act -j lint
```
