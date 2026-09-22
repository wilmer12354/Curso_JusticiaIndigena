import { randomBytes, scrypt, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

function hashPassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashUserPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await hashPassword(password, salt);
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyUserPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  if (salt.length === 0 || expected.length !== KEY_LENGTH) return false;

  const derivedKey = await hashPassword(password, salt);
  return timingSafeEqual(derivedKey, expected);
}
