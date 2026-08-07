import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "booth_admin";

export function signAdminSession(secret: string): string {
  return createHmac("sha256", secret).update("admin").digest("hex");
}

export function verifyAdminSession(token: string, secret: string): boolean {
  const expected = signAdminSession(secret);
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
