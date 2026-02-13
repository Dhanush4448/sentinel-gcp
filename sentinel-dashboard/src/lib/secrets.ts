/**
 * GCP Secret Manager Integration
 * Automatically uses Secret Manager in production, falls back to env vars in development
 */

import { SecretManagerServiceClient } from "@google-cloud/secret-manager"
import { logger } from "./logger"

let secretClient: SecretManagerServiceClient | null = null

/**
 * Initialize Secret Manager client (only in production)
 */
function getSecretClient(): SecretManagerServiceClient | null {
  if (process.env.NODE_ENV !== "production") {
    return null
  }

  if (!secretClient) {
    try {
      secretClient = new SecretManagerServiceClient()
      logger.info("Secret Manager client initialized")
    } catch (error) {
      logger.error("Failed to initialize Secret Manager client", error)
      return null
    }
  }

  return secretClient
}

/**
 * Get secret from GCP Secret Manager or environment variable
 * @param secretName - Name of the secret (e.g., "AUTH_SECRET")
 * @param projectId - GCP Project ID (defaults to env var)
 * @returns Secret value or null if not found
 */
export async function getSecret(
  secretName: string,
  projectId?: string
): Promise<string | null> {
  const client = getSecretClient()

  // In development, use environment variables
  if (!client) {
    const envValue = process.env[secretName]
    if (envValue) {
      logger.debug(`Retrieved secret from env: ${secretName}`)
      return envValue
    }
    logger.warn(`Secret not found in environment: ${secretName}`)
    return null
  }

  // In production, fetch from Secret Manager
  try {
    const project = projectId || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID
    if (!project) {
      logger.error("GCP Project ID not configured")
      return null
    }

    const name = `projects/${project}/secrets/${secretName}/versions/latest`
    const [version] = await client.accessSecretVersion({ name })

    if (!version.payload?.data) {
      logger.warn(`Secret not found: ${secretName}`)
      return null
    }

    const secretValue = version.payload.data.toString()
    logger.debug(`Retrieved secret from Secret Manager: ${secretName}`)
    return secretValue
  } catch (error) {
    logger.error(`Failed to retrieve secret: ${secretName}`, error)
    return null
  }
}

/**
 * Get multiple secrets at once
 */
export async function getSecrets(
  secretNames: string[],
  projectId?: string
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {}

  await Promise.all(
    secretNames.map(async (name) => {
      results[name] = await getSecret(name, projectId)
    })
  )

  return results
}

/**
 * Preload secrets into environment (useful for startup)
 */
export async function loadSecretsIntoEnv(
  secretNames: string[],
  projectId?: string
): Promise<void> {
  const secrets = await getSecrets(secretNames, projectId)

  for (const [name, value] of Object.entries(secrets)) {
    if (value) {
      process.env[name] = value
      logger.debug(`Loaded secret into env: ${name}`)
    } else {
      logger.warn(`Failed to load secret: ${name}`)
    }
  }
}
