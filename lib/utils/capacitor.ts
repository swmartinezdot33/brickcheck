/**
 * Capacitor utilities
 * Helper functions to detect Capacitor environment and use native features
 */

import { Capacitor } from '@capacitor/core'

/**
 * Check if the app is running in a Capacitor native environment
 * This works even when loading from a remote URL (server.url config)
 */
export function isCapacitorNative(): boolean {
  const platform = Capacitor.getPlatform()
  // If platform is 'ios' or 'android', we're in the native app
  // (even if loading from a remote URL via server.url)
  return platform === 'ios' || platform === 'android'
}

/**
 * Check if the app is running on iOS
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios'
}

/**
 * Check if the app is running on Android
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android'
}

/**
 * Get the current platform (web, ios, android)
 */
export function getPlatform(): 'web' | 'ios' | 'android' {
  return Capacitor.getPlatform() as 'web' | 'ios' | 'android'
}


