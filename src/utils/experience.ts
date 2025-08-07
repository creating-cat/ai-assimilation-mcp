/**
 * Experience-related utility functions
 */

import { join } from 'path';
import { loadConfig } from '../config/index.js';
import { SecurityError } from './errors.js';

const config = loadConfig();

/**
 * Validates a session ID to prevent path traversal attacks.
 * @param sessionId The session ID to validate.
 * @throws {SecurityError} if the session ID is invalid.
 */
function validateSessionId(sessionId: string): void {
  if (!sessionId || sessionId.includes('/') || sessionId.includes('\\') || sessionId.includes('..')) {
    throw new SecurityError(`Invalid session_id provided. It cannot contain path characters: ${sessionId}`);
  }
}

/**
 * Generates the full path for an experience directory from a session ID.
 * @param sessionId The session ID.
 * @returns The full, sanitized directory path.
 */
export function getExperienceDirectoryPath(sessionId: string): string {
  validateSessionId(sessionId);
  const directoryName = `experience_${sessionId}`;
  return join(config.storage.baseDirectory, directoryName);
}

