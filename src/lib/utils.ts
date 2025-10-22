import { urlPattern, mediaUrlPattern } from "@lib/constant"

export const objectToFormData = (
  object: Record<string, any>
): FormData | null => {
  if (!object) return object;
  const formData = new FormData();
  Object.keys(object).forEach((key) => {
    if (key === "files" && Array.isArray(object.files) && object.files.length)
      object.files.forEach((file) => formData.append("files", file));
    else formData.append(key, JSON.stringify(object[key]));
  });
  return formData;
};

export const formDataToObject = (formData: FormData) => {
  const formDataObject: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "files") {
      const prevFiles = formDataObject.files ?? [];
      formDataObject.files =
        value instanceof File
          ? [...prevFiles, value]
          : formDataObject.files ?? [];
    } else formDataObject[key] = JSON.parse(value as string);
  }
  return formDataObject;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const btoa = (s: string) => Buffer.from(s).toString("base64");
const atob = (s: string) => Buffer.from(s, "base64").toString();

async function generateKeyFromPassword(password: string): Promise<CryptoKey> {
  const salt = encoder.encode("static-salt"); // You can change to dynamic salt if needed
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData<T>(
  data: T,
  password: string
): Promise<string> {
  const key = await generateKeyFromPassword(password);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const jsonString = JSON.stringify(data);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(jsonString)
  );

  // Combine IV and ciphertext in one string (base64)
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined)); // Return as base64
}

export async function decryptData<T>(
  encryptedData: string,
  password: string
): Promise<T> {
  const data = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const iv = data.slice(0, 12); // Extract IV
  const ciphertext = data.slice(12);
  const key = await generateKeyFromPassword(password);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    ciphertext
  );

  return JSON.parse(decoder.decode(decrypted)) as T;
}

export const isCorrectURL = (url: string, allowLocalHost: boolean) => {
  if (!url) return false;
  else if (urlPattern.test(url)) return true;
  else if (mediaUrlPattern.test(url)) return true;
  else if (allowLocalHost && /^http:\/\/localhost(:\d+)?(\/[^\s]*)?$/.test(url)) return true;
  return false;
}