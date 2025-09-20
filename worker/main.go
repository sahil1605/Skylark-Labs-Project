package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/Kagami/go-face"
	"gocv.io/x/gocv"
)

type Camera struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	RTSPURL     string `json:"rtspUrl"`
	Location    string `json:"location"`
	IsEnabled   bool   `json:"isEnabled"`
	IsStreaming bool   `json:"isStreaming"`
}

type Alert struct {
	CameraID    string                 `json:"cameraId"`
	Confidence  float64                `json:"confidence"`
	BoundingBox map[string]interface{} `json:"boundingBox"`
	ImageURL    string                 `json:"imageUrl,omitempty"`
}

type CameraProcessor struct {
	Camera      Camera
	VideoCapture *gocv.VideoCapture
	FaceDetector *face.Detector
	IsRunning   bool
	Mutex       sync.RWMutex
	FPS         int
	FrameSkip   int
	FrameCount  int
}

type Worker struct {
	processors map[string]*CameraProcessor
	mutex      sync.RWMutex
	httpClient *http.Client
	backendURL string
}

func NewWorker(backendURL string) *Worker {
	return &Worker{
		processors: make(map[string]*CameraProcessor),
		httpClient: &http.Client{Timeout: 10 * time.Second},
		backendURL: backendURL,
	}
}

func (w *Worker) StartCamera(camera Camera) error {
	w.mutex.Lock()
	defer w.mutex.Unlock()

	// Check if camera is already being processed
	if _, exists := w.processors[camera.ID]; exists {
		return fmt.Errorf("camera %s is already being processed", camera.ID)
	}

	// Initialize face detector
	detector, err := face.NewDetector("models/haarcascade_frontalface_default.xml")
	if err != nil {
		return fmt.Errorf("failed to initialize face detector: %v", err)
	}

	// Initialize video capture
	cap, err := gocv.OpenVideoCapture(camera.RTSPURL)
	if err != nil {
		return fmt.Errorf("failed to open video capture: %v", err)
	}

	processor := &CameraProcessor{
		Camera:       camera,
		VideoCapture: cap,
		FaceDetector: detector,
		IsRunning:    false,
		FPS:          30,
		FrameSkip:    1, // Process every frame initially
		FrameCount:   0,
	}

	w.processors[camera.ID] = processor

	// Start processing in goroutine
	go w.processCamera(processor)

	return nil
}

func (w *Worker) StopCamera(cameraID string) error {
	w.mutex.Lock()
	defer w.mutex.Unlock()

	processor, exists := w.processors[cameraID]
	if !exists {
		return fmt.Errorf("camera %s is not being processed", cameraID)
	}

	processor.Mutex.Lock()
	processor.IsRunning = false
	processor.Mutex.Unlock()

	// Clean up resources
	processor.VideoCapture.Close()
	processor.FaceDetector.Close()

	delete(w.processors, cameraID)

	return nil
}

func (w *Worker) processCamera(processor *CameraProcessor) {
	processor.Mutex.Lock()
	processor.IsRunning = true
	processor.Mutex.Unlock()

	defer func() {
		processor.Mutex.Lock()
		processor.IsRunning = false
		processor.Mutex.Unlock()
	}()

	mat := gocv.NewMat()
	defer mat.Close()

	frameInterval := time.Duration(1000/processor.FPS) * time.Millisecond
	lastFrameTime := time.Now()

	for {
		processor.Mutex.RLock()
		running := processor.IsRunning
		processor.Mutex.RUnlock()

		if !running {
			break
		}

		// Read frame
		if ok := processor.VideoCapture.Read(&mat); !ok {
			log.Printf("Failed to read frame from camera %s", processor.Camera.ID)
			time.Sleep(1 * time.Second)
			continue
		}

		if mat.Empty() {
			continue
		}

		processor.FrameCount++

		// Skip frames if needed to maintain real-time performance
		if processor.FrameCount%processor.FrameSkip != 0 {
			continue
		}

		// Convert to Go image for face detection
		img, err := mat.ToImage()
		if err != nil {
			log.Printf("Failed to convert frame to image: %v", err)
			continue
		}

		// Detect faces
		faces, err := processor.FaceDetector.Detect(img)
		if err != nil {
			log.Printf("Face detection failed: %v", err)
			continue
		}

		// Process detected faces
		if len(faces) > 0 {
			for _, face := range faces {
				// Draw bounding box on frame
				rect := image.Rect(
					face.Rect.Min.X,
					face.Rect.Min.Y,
					face.Rect.Max.X,
					face.Rect.Max.Y,
				)

				// Draw rectangle on the frame
				gocv.Rectangle(&mat, rect, color, 2)

				// Add text overlay
				text := fmt.Sprintf("Camera: %s, FPS: %d", processor.Camera.ID, processor.FPS)
				gocv.PutText(&mat, text, image.Pt(10, 30), gocv.FontHersheyPlain, 1.2, color, 2)

				// Create alert
				alert := Alert{
					CameraID:   processor.Camera.ID,
					Confidence: face.Confidence,
					BoundingBox: map[string]interface{}{
						"x":      face.Rect.Min.X,
						"y":      face.Rect.Min.Y,
						"width":  face.Rect.Dx(),
						"height": face.Rect.Dy(),
					},
				}

				// Save snapshot if needed
				if processor.FrameCount%30 == 0 { // Save every 30 frames
					snapshot, err := w.createSnapshot(mat)
					if err == nil {
						alert.ImageURL = snapshot
					}
				}

				// Send alert to backend
				go w.sendAlert(alert)
			}
		}

		// TODO: Send processed frame to MediaMTX for WebRTC streaming
		// This would involve encoding the frame and sending it to the MediaMTX server

		// Maintain frame rate
		elapsed := time.Since(lastFrameTime)
		if elapsed < frameInterval {
			time.Sleep(frameInterval - elapsed)
		}
		lastFrameTime = time.Now()
	}
}

func (w *Worker) createSnapshot(mat gocv.Mat) (string, error) {
	// Convert mat to JPEG
	img, err := mat.ToImage()
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: 80})
	if err != nil {
		return "", err
	}

	// TODO: Upload to storage service and return URL
	// For now, return a placeholder
	return fmt.Sprintf("snapshot_%d.jpg", time.Now().Unix()), nil
}

func (w *Worker) sendAlert(alert Alert) {
	alertData, err := json.Marshal(alert)
	if err != nil {
		log.Printf("Failed to marshal alert: %v", err)
		return
	}

	resp, err := w.httpClient.Post(
		w.backendURL+"/api/alerts",
		"application/json",
		bytes.NewBuffer(alertData),
	)
	if err != nil {
		log.Printf("Failed to send alert: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		log.Printf("Failed to send alert, status: %d", resp.StatusCode)
	}
}

func (w *Worker) GetCameras() ([]Camera, error) {
	resp, err := w.httpClient.Get(w.backendURL + "/api/cameras")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var cameras []Camera
	err = json.NewDecoder(resp.Body).Decode(&cameras)
	return cameras, err
}

func (w *Worker) StartStreamingCamera(cameraID string) error {
	cameras, err := w.GetCameras()
	if err != nil {
		return err
	}

	var camera Camera
	for _, c := range cameras {
		if c.ID == cameraID {
			camera = c
			break
		}
	}

	if camera.ID == "" {
		return fmt.Errorf("camera %s not found", cameraID)
	}

	return w.StartCamera(camera)
}

func (w *Worker) StopStreamingCamera(cameraID string) error {
	return w.StopCamera(cameraID)
}

func (w *Worker) GetStatus() map[string]interface{} {
	w.mutex.RLock()
	defer w.mutex.RUnlock()

	status := make(map[string]interface{})
	for id, processor := range w.processors {
		processor.Mutex.RLock()
		status[id] = map[string]interface{}{
			"isRunning":   processor.IsRunning,
			"fps":         processor.FPS,
			"frameCount":  processor.FrameCount,
			"frameSkip":   processor.FrameSkip,
		}
		processor.Mutex.RUnlock()
	}

	return status
}

var color = gocv.Scalar{Val1: 0, Val2: 255, Val3: 0, Val4: 0} // Green color

func main() {
	// Get configuration from environment
	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:8000"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize worker
	worker := NewWorker(backendURL)

	// Set up Gin router
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// Get worker status
	r.GET("/status", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": worker.GetStatus(),
			"active_cameras": len(worker.processors),
		})
	})

	// Start camera streaming
	r.POST("/cameras/:id/start", func(c *gin.Context) {
		cameraID := c.Param("id")
		
		if err := worker.StartStreamingCamera(cameraID); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"message": "Camera streaming started"})
	})

	// Stop camera streaming
	r.POST("/cameras/:id/stop", func(c *gin.Context) {
		cameraID := c.Param("id")
		
		if err := worker.StopStreamingCamera(cameraID); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"message": "Camera streaming stopped"})
	})

	// Start all enabled cameras
	r.POST("/cameras/start-all", func(c *gin.Context) {
		cameras, err := worker.GetCameras()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		started := 0
		for _, camera := range cameras {
			if camera.IsEnabled && !camera.IsStreaming {
				if err := worker.StartCamera(camera); err != nil {
					log.Printf("Failed to start camera %s: %v", camera.ID, err)
					continue
				}
				started++
			}
		}

		c.JSON(200, gin.H{
			"message": fmt.Sprintf("Started %d cameras", started),
			"started": started,
		})
	})

	// Stop all cameras
	r.POST("/cameras/stop-all", func(c *gin.Context) {
		worker.mutex.Lock()
		stopped := 0
		for id := range worker.processors {
			if err := worker.StopCamera(id); err != nil {
				log.Printf("Failed to stop camera %s: %v", id, err)
				continue
			}
			stopped++
		}
		worker.mutex.Unlock()

		c.JSON(200, gin.H{
			"message": fmt.Sprintf("Stopped %d cameras", stopped),
			"stopped": stopped,
		})
	})

	// Start server
	log.Printf("Worker starting on port %s", port)
	
	// Graceful shutdown
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := r.Run(":" + port); err != nil {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// Wait for shutdown signal
	<-ctx.Done()
	log.Println("Shutting down worker...")

	// Stop all cameras
	worker.mutex.Lock()
	for id := range worker.processors {
		worker.StopCamera(id)
	}
	worker.mutex.Unlock()

	log.Println("Worker stopped")
}
