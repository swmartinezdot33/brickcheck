// Quick test to see what Capacitor detects
const { Capacitor } = require('@capacitor/core');
console.log('Platform:', Capacitor.getPlatform());
console.log('Is Native:', Capacitor.isNativePlatform());
console.log('Is Hybrid:', Capacitor.isPluginAvailable('App'));
