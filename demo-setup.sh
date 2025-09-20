#!/bin/bash

# Demo Setup Script for Face Detection Dashboard

echo "🎬 Setting up demo environment..."

# Create demo cameras with sample RTSP URLs
echo "📹 Creating demo cameras..."

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
until curl -s http://localhost:8000/health > /dev/null; do
  echo "Waiting for backend..."
  sleep 2
done

# Get JWT token
echo "🔑 Getting authentication token..."
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' | \
  jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Authentication successful"

# Create demo cameras
echo "📷 Creating demo cameras..."

# Camera 1: Front Door
curl -s -X POST http://localhost:8000/api/cameras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Front Door Camera",
    "rtspUrl": "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov",
    "location": "Main Entrance",
    "isEnabled": true
  }' > /dev/null

# Camera 2: Backyard
curl -s -X POST http://localhost:8000/api/cameras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Backyard Camera",
    "rtspUrl": "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov",
    "location": "Backyard",
    "isEnabled": true
  }' > /dev/null

# Camera 3: Office
curl -s -X POST http://localhost:8000/api/cameras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Office Camera",
    "rtspUrl": "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov",
    "location": "Office",
    "isEnabled": false
  }' > /dev/null

echo "✅ Demo cameras created successfully"

# Create some sample alerts
echo "🔔 Creating sample alerts..."

# Get camera IDs
CAMERA1_ID=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/cameras | jq -r '.[0].id')
CAMERA2_ID=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/cameras | jq -r '.[1].id')

# Create sample alerts
for i in {1..5}; do
  curl -s -X POST http://localhost:8000/api/alerts \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"cameraId\": \"$CAMERA1_ID\",
      \"confidence\": 0.$((85 + i)),
      \"boundingBox\": {
        \"x\": $((100 + i * 10)),
        \"y\": $((50 + i * 5)),
        \"width\": 80,
        \"height\": 100
      },
      \"imageUrl\": \"sample_alert_$i.jpg\"
    }" > /dev/null
done

for i in {1..3}; do
  curl -s -X POST http://localhost:8000/api/alerts \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"cameraId\": \"$CAMERA2_ID\",
      \"confidence\": 0.$((90 + i)),
      \"boundingBox\": {
        \"x\": $((200 + i * 15)),
        \"y\": $((75 + i * 8)),
        \"width\": 90,
        \"height\": 110
      },
      \"imageUrl\": \"sample_alert_backyard_$i.jpg\"
    }" > /dev/null
done

echo "✅ Sample alerts created successfully"

echo ""
echo "🎉 Demo setup complete!"
echo ""
echo "📱 Access the dashboard at: http://localhost:3000"
echo "🔑 Login credentials: admin / password"
echo ""
echo "📊 Demo features to showcase:"
echo "  • Camera management (add/edit/delete cameras)"
echo "  • Start/stop camera streams"
echo "  • Real-time alerts in sidebar"
echo "  • Responsive design (try mobile view)"
echo "  • WebSocket connection status"
echo ""
echo "🎬 Ready for demo recording!"
