import app from './app';
import { config } from './config';
import os from 'os';

const getLocalIpAddress = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

const server = app.listen(config.port, () => {
  const localIp = getLocalIpAddress();
  console.log('========================================================');
  console.log(`🚀 Project Management API is running!`);
  console.log(`📡 Local URL:          http://localhost:${config.port}`);
  console.log(`📱 Mobile/LAN URL:     http://${localIp}:${config.port}`);
  console.log(`📖 Swagger API Docs:   http://localhost:${config.port}/api/docs`);
  console.log(`🏥 Health Check:       http://localhost:${config.port}/health`);
  console.log(`🌍 Environment:        ${config.nodeEnv}`);
  console.log('========================================================');
});

// Graceful shutdown
const shutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
