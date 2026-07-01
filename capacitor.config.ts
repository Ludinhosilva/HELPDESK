// Capacitor configuration for FlixSupport
// Install with: npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/push-notifications
// Then run: npx cap init && npx cap add android

const config = {
  appId: "com.flixsupport.app",
  appName: "Flix Support",
  webDir: "out",
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://helpdesklu-five.vercel.app",
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
