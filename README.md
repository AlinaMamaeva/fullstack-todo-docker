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

- **Frontend:** http://localhost:8082
- **Backend health check:** http://localhost:8082/health
- **TODO API:** http://localhost:8082/api/todos

Nginx routes incoming requests to the frontend and backend services.

### 5. Stop the application

```bash
docker compose down
```

MongoDB and uploaded-file data are stored in Docker volumes. Running `docker compose down` without `-v` preserves these volumes.

## Image Uploads

Images can be uploaded through the application or the upload API.

The upload endpoint is:

```http
POST /api/uploads
```

Send the image as multipart form data using the field name `file`.

Supported formats:
- JPEG
- PNG
- WebP

The backend validates the file content and enforces an upload size limit. Uploaded images are stored in a persistent Docker volume and referenced by their URL in TODO documents.

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
