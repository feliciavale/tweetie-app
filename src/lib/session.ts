import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE } from "./auth";

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.sub ?? null;
}
