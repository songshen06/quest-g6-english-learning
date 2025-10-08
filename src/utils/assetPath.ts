/**
 * Asset path utilities for handling base path in development and production
 */

// Get the base path from Vite configuration
export const BASE_PATH = '/quest-g6-english-learning'

/**
 * Convert a relative asset path to include the base path
 * @param path - The relative path (e.g., '/audio/tts/word.mp3')
 * @returns The full path with base path included
 */
export function getAssetPath(path: string): string {
  if (!path) return path

  // If path already starts with BASE_PATH, return as-is
  if (path.startsWith(BASE_PATH)) {
    return path
  }

  // If path starts with '/', replace it with base path
  if (path.startsWith('/')) {
    return `${BASE_PATH}${path}`
  }

  // If path doesn't start with '/', add base path
  return `${BASE_PATH}/${path}`
}

/**
 * Get audio path with base path
 * @param audioPath - Audio file path
 * @returns Full audio path with base path
 */
export function getAudioPath(audioPath: string): string {
  return getAssetPath(audioPath)
}

/**
 * Get image path with base path
 * @param imagePath - Image file path
 * @returns Full image path with base path
 */
export function getImagePath(imagePath: string): string {
  return getAssetPath(imagePath)
}