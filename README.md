# Full-Stack Real-Time TODO App

A full-stack collaborative TODO application built with React, Node.js, Express, TypeScript, MongoDB, Socket.IO, Redis, Docker, and Nginx.

The application allows users to manage tasks collaboratively, synchronize changes in real time, track online presence, and upload images for their tasks.

## Technologies Used

**Frontend**

- React
- Vite
- JavaScript
- Socket.IO Client
- CSS

**Backend**

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Socket.IO
- Redis
- Multer
- `file-type`

**Infrastructure**

- Docker
- Docker Compose
- Nginx

## Features

- Create, edit, and delete tasks
- Mark tasks as completed or active
- Filter tasks by status
- Clear completed tasks
- Real-time synchronization across browser tabs
- Online user presence tracking
- Shared workspace using Socket.IO rooms
- Redis caching for TODO queries
- Upload JPG, PNG, and WebP images
- Validate image file types using file content
- Enforce upload size limits
- Display uploaded images alongside tasks
- Persist MongoDB data and uploaded files using Docker volumes
- Route frontend, API, uploaded images, and Socket.IO traffic through Nginx

## Real-Time Events

The application uses Socket.IO to synchronize changes between connected clients.

- `workspace:join` — Join the shared workspace
- `workspace:leave` — Leave the shared workspace
- `todo:created` — Notify clients when a task is created
- `todo:updated` — Notify clients when a task is updated
- `todo:deleted` — Notify clients when a task is deleted
- `presence:update` — Update online user presence

## Getting Started with Docker

### Prerequisites

- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/AlinaMamaeva/fullstack-todo-docker.git
cd fullstack-todo-docker
```

### 2. Configure environment variables

Configure the environment variables required by the backend. For local development, use the appropriate `.env` file and your MongoDB connection string.

The Docker Compose configuration uses the MongoDB service available inside the Compose network.

Do not commit real passwords, API keys, or other secrets.

### 3. Build and start the application

From the project root, run:

```bash
docker compose up -d --build
```

Check the running containers:

```bash
docker compose ps
```

### 4. Open the application

- **Frontend:** http://localhost
- **Backend health check:** http://localhost/health
- **TODO API:** http://localhost/api/todos
- **Analytics API:** http://localhost/api/analytics
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001

Nginx routes incoming requests to the frontend and backend services.

### 5. Stop the application

```bash
docker compose down
```

MongoDB and uploaded-file data are stored in Docker volumes. Running `docker compose down` without `-v` preserves these volumes.

## Image Uploads

Images can be uploaded when creating a TODO.

**Endpoint:** `POST /api/todos`

Send data as `multipart/form-data`:

- `title` — task title
- `attachments` — image file (optional)

Supported formats:
- JPEG
- PNG
- WebP

Maximum file size: 5 MB.

Uploaded images are stored in `backend/uploads` and served through `/uploads/<filename>`.

Example:

```bash
curl -X POST http://localhost/api/todos \
  -F "title=Test task" \
  -F "attachments=@image.jpg"
```
## Testing Real-Time Features

1. Open the application in two browser tabs.
2. Create a task in the first tab.
3. Verify that the task appears automatically in the second tab.
4. Update or delete a task and verify that both tabs synchronize.
5. Open another tab and verify that presence updates correctly.
6. Upload an image and verify that it appears with the task.
7. Restart the Docker containers and verify that tasks and uploaded images remain available.

## Useful Docker Commands

Rebuild the backend:

```bash
docker compose up -d --build backend
```

Rebuild the frontend:

```bash
docker compose up -d --build frontend
```

View backend logs:

```bash
docker compose logs -f backend
```

View all container statuses:

```bash
docker compose ps
```

## Project Repository

GitHub: https://github.com/AlinaMamaeva/fullstack-todo-docker

## Project Status

The application has been containerized with Docker Compose and tested locally, including real-time task synchronization, image uploads, upload validation, and persistence across container restarts.

## Health Checks

Run the health-check script:

```bash
./scripts/health-check.sh
```

The script checks:
- Docker container status
- Frontend availability
- Backend health and database connections
- Nginx status

## Production Configuration

Production settings are defined in `docker-compose.prod.yml`.

They include:
- HTTPS through Nginx
- MongoDB authentication using Docker secrets
- CPU and memory limits
- Docker log rotation
- Automatic container restart

### Environment Variables

See `.env.example` for the available environment variables.

Production environment values can be configured in `.env.production`.

Never commit passwords, private keys, or production secrets to Git.

### MongoDB Secret

MongoDB credentials are stored in:

`secrets/mongo_password.txt`

Generate a password with:

```bash
mkdir -p secrets
openssl rand -hex 32 > secrets/mongo_password.txt
chmod 600 secrets/mongo_password.txt
```

### Production Deployment

Review and configure production environment variables, MongoDB credentials, and SSL certificates before deployment.

Validate the configuration:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml config --quiet
```

For a new production deployment with properly initialized MongoDB credentials, start the services with:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Do not apply this configuration directly to an existing development MongoDB volume without planning the database authentication migration.

The included localhost SSL certificates are intended for local testing only. A real deployment requires valid certificates for its domain.