/*
 * PBKDF2-HMAC-SHA256 en JavaScript puro.
 * Se usa cuando crypto.subtle no existe: los navegadores solo lo activan en páginas
 * seguras (https o localhost). Al abrir la app desde el celular por la IP del PC
 * (http://192.168.x.x:3000) o dentro de Expo Go, crypto.subtle es undefined.
 * Da exactamente el mismo resultado que crypto.subtle.deriveBits.
 */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);
const IV = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
const W = new Uint32Array(64);

/** Comprime un bloque de 16 palabras sobre el estado h (se modifica). */
function compress(h: Uint32Array, block: Uint32Array) {
  for (let i = 0; i < 16; i++) W[i] = block[i];
  for (let i = 16; i < 64; i++) {
    const a = W[i - 15], b = W[i - 2];
    const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
    const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
    W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
  }
  let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
  for (let i = 0; i < 64; i++) {
    const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
    const t1 = (hh + S1 + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
    const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
    const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
    hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
  }
  h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
  h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
}

/** SHA-256 de un mensaje arbitrario, continuando desde un estado y una longitud previos. */
function sha256From(state: Uint32Array, prevBytes: number, msg: Uint8Array): Uint32Array {
  const h = state.slice();
  const total = prevBytes + msg.length;
  const padLen = ((msg.length + 9 + 63) >> 6) << 6;
  const buf = new Uint8Array(padLen);
  buf.set(msg);
  buf[msg.length] = 0x80;
  const bits = total * 8;
  const view = new DataView(buf.buffer);
  view.setUint32(padLen - 8, Math.floor(bits / 0x100000000));
  view.setUint32(padLen - 4, bits >>> 0);
  const block = new Uint32Array(16);
  for (let off = 0; off < padLen; off += 64) {
    for (let i = 0; i < 16; i++) block[i] = view.getUint32(off + i * 4);
    compress(h, block);
  }
  return h;
}

function wordsToBytes(words: Uint32Array) {
  const out = new Uint8Array(words.length * 4);
  const v = new DataView(out.buffer);
  words.forEach((w, i) => v.setUint32(i * 4, w));
  return out;
}

export function pbkdf2Sha256(password: Uint8Array, salt: Uint8Array, iterations: number, lengthBytes = 32): Uint8Array {
  let key = password;
  if (key.length > 64) key = wordsToBytes(sha256From(new Uint32Array(IV), 0, key));
  const ipad = new Uint8Array(64), opad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) { ipad[i] = (key[i] ?? 0) ^ 0x36; opad[i] = (key[i] ?? 0) ^ 0x5c; }

  // Estados tras procesar ipad/opad (se reutilizan en cada iteración).
  const toBlock = (b: Uint8Array) => { const v = new DataView(b.buffer); return Uint32Array.from({ length: 16 }, (_, i) => v.getUint32(i * 4)); };
  const innerState = new Uint32Array(IV); compress(innerState, toBlock(ipad));
  const outerState = new Uint32Array(IV); compress(outerState, toBlock(opad));

  // Bloque de 64 bytes ya rellenado para un mensaje de 32 bytes tras los 64 del pad (total 96 bytes).
  const fixed = new Uint32Array(16);
  fixed[8] = 0x80000000; fixed[15] = 96 * 8;
  const hmac32 = (msgWords: Uint32Array, out: Uint32Array) => {
    const s = innerState.slice();
    for (let i = 0; i < 8; i++) fixed[i] = msgWords[i];
    compress(s, fixed);
    const o = outerState.slice();
    for (let i = 0; i < 8; i++) fixed[i] = s[i];
    compress(o, fixed);
    out.set(o);
  };

  const result = new Uint8Array(lengthBytes);
  const blocks = Math.ceil(lengthBytes / 32);
  for (let bi = 1; bi <= blocks; bi++) {
    const msg = new Uint8Array(salt.length + 4);
    msg.set(salt);
    new DataView(msg.buffer).setUint32(salt.length, bi);
    const inner = sha256From(innerState, 64, msg);
    let u = sha256From(outerState, 64, wordsToBytes(inner));
    const t = u.slice();
    const next = new Uint32Array(8);
    for (let it = 1; it < iterations; it++) {
      hmac32(u, next);
      u = next.slice();
      for (let i = 0; i < 8; i++) t[i] ^= u[i];
    }
    result.set(wordsToBytes(t).subarray(0, Math.min(32, lengthBytes - (bi - 1) * 32)), (bi - 1) * 32);
  }
  return result;
}
