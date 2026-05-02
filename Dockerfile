# Stage 1: Build the React Frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Python Backend
FROM python:3.11-slim
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets from the builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure the container listens on the port Railway provides
ENV PORT=8000
EXPOSE $PORT

# Start the FastAPI server
CMD sh -c "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
