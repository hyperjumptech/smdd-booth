export type EnvConfig = {
  adminPassword: string;
  sessionSecret: string;
  port: number;
};

export function getEnvErrors(env: NodeJS.ProcessEnv): string[] {
  const missing: string[] = [];
  if (!env.ADMIN_PASSWORD?.trim()) missing.push("ADMIN_PASSWORD");
  if (!env.SESSION_SECRET?.trim()) missing.push("SESSION_SECRET");
  return missing;
}

export function assertEnv(env: NodeJS.ProcessEnv): void {
  const missing = getEnvErrors(env);
  if (missing.length > 0) {
    console.error(
      `FATAL: Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }
}

export function readEnv(env: NodeJS.ProcessEnv): EnvConfig {
  assertEnv(env);
  return {
    adminPassword: env.ADMIN_PASSWORD!.trim(),
    sessionSecret: env.SESSION_SECRET!.trim(),
    port: Number(env.PORT) || 3000,
  };
}
