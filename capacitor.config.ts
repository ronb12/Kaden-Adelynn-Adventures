import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bradleyvirtualsolutions.spaceadventures',
  appName: 'Kaden & Adelynn Space Adventures',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: true,
    backgroundColor: '#000033',
    scheme: 'spaceadventures',
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000033',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#00FFFF',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#000033',
      overlaysWebView: false
    }
  }
};

export default config;
