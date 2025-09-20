FROM golang:1.21-alpine AS builder

# Install system dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    pkgconfig \
    opencv-dev \
    ffmpeg-dev

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache \
    opencv \
    ffmpeg \
    ca-certificates

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Create models directory
RUN mkdir -p models

# Download face detection model
RUN wget -O models/haarcascade_frontalface_default.xml \
    https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml

# Expose port
EXPOSE 8080

# Run the application
CMD ["./main"]
