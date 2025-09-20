import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('password', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', admin.username);

  // Create sample cameras
  const cameras = [
    {
      name: 'Front Door Camera',
      rtspUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
      location: 'Main Entrance',
      isEnabled: true,
    },
    {
      name: 'Backyard Camera',
      rtspUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
      location: 'Backyard',
      isEnabled: true,
    },
    {
      name: 'Office Camera',
      rtspUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
      location: 'Office',
      isEnabled: false,
    },
  ];

  for (const cameraData of cameras) {
    const camera = await prisma.camera.upsert({
      where: { name: cameraData.name },
      update: {},
      create: cameraData,
    });
    console.log('✅ Camera created:', camera.name);
  }

  // Create sample alerts
  const sampleAlerts = [
    {
      cameraId: (await prisma.camera.findFirst({ where: { name: 'Front Door Camera' } }))?.id || '',
      confidence: 0.95,
      boundingBox: { x: 100, y: 50, width: 80, height: 100 },
      imageUrl: 'sample_alert_1.jpg',
    },
    {
      cameraId: (await prisma.camera.findFirst({ where: { name: 'Backyard Camera' } }))?.id || '',
      confidence: 0.87,
      boundingBox: { x: 200, y: 75, width: 90, height: 110 },
      imageUrl: 'sample_alert_2.jpg',
    },
  ];

  for (const alertData of sampleAlerts) {
    if (alertData.cameraId) {
      const alert = await prisma.alert.create({
        data: alertData,
      });
      console.log('✅ Alert created for camera:', alert.cameraId);
    }
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
