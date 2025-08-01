# --- Stage 1: Frontend Builder ---
FROM node:20.19-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY front/package*.json ./front/
WORKDIR /app/front
RUN npm install

# Copy frontend source and build
COPY front/ ./
RUN npm run build

# --- Stage 2: Backend Builder ---
FROM golang:1.24-alpine AS backend-builder

# Set working directory
WORKDIR /app

# Copy Go modules files for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build

# --- Stage 3: Runtime image ---
FROM alpine:latest

# Install a shell and CA certificates
RUN apk add --no-cache bash ca-certificates tzdata

# Set the timezone to Asia/Shanghai
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Set working directory inside container
WORKDIR /app

# Copy the built frontend from frontend-builder
COPY --from=frontend-builder /app/front/dist/public ./dist
# Copy the binary and config from backend-builder
COPY --from=backend-builder /app/journal .
COPY --from=backend-builder /app/config.prod.yaml config.yaml

# Expose your web server's port
EXPOSE 8765

# Default entrypoint: run the server
ENTRYPOINT ["./journal"]
