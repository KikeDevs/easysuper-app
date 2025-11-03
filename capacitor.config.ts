import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.easysuper.app',
  appName: 'EasySuper',
  webDir: 'dist',
  server: {
      androidScheme: 'http',
  }
};

export default config;
