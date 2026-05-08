import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bpqg.app',
  appName: 'BPQG',
  webDir: 'build',
  server: {
    // After deploying to Render, replace this URL with your actual Render URL
    // e.g. url: 'https://bpqg.onrender.com'
    // Leave commented out for local web builds
    url: 'https://business-proposal-tyul.onrender.com',
    cleartext: false,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: { launchShowDuration: 2000 }
  }
};

export default config;
