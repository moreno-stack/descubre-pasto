const ACCOUNTS_KEY = "descubre-pasto-demo-accounts-v1";
const SESSION_KEY = "descubre-pasto-demo-session-v1";
const HASH_ITERATIONS = 310_000;

type DemoAccount = {
  email: string;
  displayName: string;
  salt: string;
  passwordHash: string;
};

export type DemoSession = {
  email: string;
  displayName: string;
  local: true;
};

function readAccounts(): DemoAccount[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
    return Array.isArray(value) ? value as DemoAccount[] : [];
  } catch {
    return [];
  }
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function derivePasswordHash(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations: HASH_ITERATIONS }, key, 256);
  return toHex(new Uint8Array(bits));
}

function announceSession(session: DemoSession | null) {
  window.dispatchEvent(new CustomEvent("descubre-pasto-demo-auth", { detail: session }));
}

export function readDemoSession(): DemoSession | null {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as DemoSession | null;
    return session?.local === true && typeof session.email === "string" ? session : null;
  } catch {
    return null;
  }
}

export async function registerDemoAccount(email: string, displayName: string, password: string) {
  const normalizedEmail = email.trim().toLocaleLowerCase("en-US");
  const accounts = readAccounts();
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("Ya existe una cuenta local con este correo. Inicia sesión.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  accounts.push({
    email: normalizedEmail,
    displayName: displayName.trim(),
    salt: toHex(salt),
    passwordHash: await derivePasswordHash(password, salt),
  });
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  const session: DemoSession = { email: normalizedEmail, displayName: displayName.trim(), local: true };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  announceSession(session);
  return session;
}

export async function signInDemoAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLocaleLowerCase("en-US");
  const account = readAccounts().find((item) => item.email === normalizedEmail);
  if (!account) throw new Error("No encontramos una cuenta local con este correo. Regístrate primero.");

  const salt = Uint8Array.from(account.salt.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
  const passwordHash = await derivePasswordHash(password, salt);
  if (passwordHash !== account.passwordHash) throw new Error("La contraseña no es correcta.");

  const session: DemoSession = { email: account.email, displayName: account.displayName, local: true };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  announceSession(session);
  return session;
}

export function signOutDemoAccount() {
  localStorage.removeItem(SESSION_KEY);
  announceSession(null);
}