import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brickcheck.app',
  appName: 'BrickCheck',
  webDir: 'out',
  server: {
    // For production: Load web app from Vercel (API routes work via server)
    // For development: Uncomment the url below to use local server
    // url: 'http://localhost:3000',
    // cleartext: true,
    
    // Production URL - mobile app loads from here
    url: 'https://www.brickcheck.app',
    androidScheme: 'https',
    iosScheme: 'https',
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
