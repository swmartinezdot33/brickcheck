import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brickcheck.app',
  appName: 'BrickCheck',
  webDir: 'out',
  server: {
    // DEVELOPMENT: Use 10.0.2.2 for Android emulator (maps to host's localhost)
    // PRODUCTION: Change to 'https://www.brickcheck.app' (or remove for bundled assets)
    url: 'http://10.0.2.2:3000',
    cleartext: true,
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
