export const config = {
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/face_detection?schema=public",
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  port: parseInt(process.env.PORT || "8000"),
};
