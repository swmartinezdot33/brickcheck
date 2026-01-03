import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brickcheck.app',
  appName: 'BrickCheck',
  webDir: 'out',
  server: {
    // DEVELOPMENT: Use local server (default for local testing)
    // To switch to production, change the url below to: 'https://www.brickcheck.app'
    // and remove or set cleartext to false
    url: 'http://localhost:3000',
    cleartext: true,
    
    // PRODUCTION (commented out - uncomment for production builds):
    // url: 'https://www.brickcheck.app',
    // cleartext: false,
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'BrickCheck needs access to your camera to scan barcodes.',
        photos: 'BrickCheck needs access to your photos to save scanned images.',
      },
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
