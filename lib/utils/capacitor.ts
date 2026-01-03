/**
 * Capacitor utilities
 * Helper functions to detect Capacitor environment and use native features
 */

import { Capacitor } from '@capacitor/core'

/**
 * Check if the app is running in a Capacitor native environment
 */
export function isCapacitorNative(): boolean {
  return Capacitor.isNativePlatform()
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

