/**
 * vCard download + optional PHOTO (JPEG base64).
 *
 * Profile images are loaded with `fetch(..., { mode: 'cors', credentials: 'omit' })`, then drawn
 * to a canvas from a `blob:` URL (same-origin to the page), so the canvas is not tainted.
 *
 * If the image URL is on another host (e.g. FastAPI :8000 while the card runs on :3000 or
 * production domain), that host must respond with CORS headers (see FastAPI `CORS_ALLOWED_ORIGINS`
 * in `main.py`). Supabase Storage already sends permissive CORS for public objects.
 *
 * Mongo `/static/` on the API: ensure avatar URLs the client uses are absolute to the API
 * origin when the card app is not co-hosted, so the browser can apply the API's CORS policy.
 */
export async function fetchProfileImageAsBase64Jpeg(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const trimmed = imageUrl.trim();
  if (!trimmed || /^data:/i.test(trimmed)) return null;

  try {
    const res = await fetch(trimmed, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob || blob.size === 0) return null;
    return await imageBlobToJpegBase64(blob);
  } catch {
    return null;
  }
}

function imageBlobToJpegBase64(blob) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    /* blob: URLs are same-origin; attribute is harmless and documents intent if URL type changes */
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (!w || !h) {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
          return;
        }
        const maxSide = 512;
        if (Math.max(w, h) > maxSide) {
          const scale = maxSide / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        URL.revokeObjectURL(objectUrl);
        const comma = dataUrl.indexOf(',');
        resolve(comma >= 0 ? dataUrl.slice(comma + 1) : null);
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    img.src = objectUrl;
  });
}

function normalizeUrlKey(u) {
  return String(u || '')
    .trim()
    .replace(/\/+$/, '')
    .toLowerCase();
}

/** RFC 2426 folding: max 75 octets per line; continuation lines start with one space. */
function foldVCardLine(line) {
  const max = 75;
  if (line.length <= max) return line;
  const parts = [line.slice(0, max)];
  let i = max;
  while (i < line.length) {
    parts.push(` ${line.slice(i, i + max - 1)}`);
    i += max - 1;
  }
  return parts.join('\r\n');
}

function escapeV(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/**
 * @param {object} user
 * @param {object} [options]
 * @param {string} [options.cardUrl] Full public card URL (e.g. https://visithon.com/card/view/ID)
 * @param {string} [options.profileImageUrl] HTTP(S) URL to fetch and embed as JPEG PHOTO
 */
export async function triggerVCardDownload(user, options = {}) {
  if (!user || typeof user !== 'object') return;
  const name = String(user.name || 'Contact').trim();
  const email = String(user.email || '').trim();
  const phone = String(user.phone1 || '').trim();
  const org = String(user.company || '').trim();
  const title = String(user.role || '').trim();
  const site = String(user.website || '').trim();
  const uid = String(user.id || user._id || '').trim();
  const cardUrl = String(options.cardUrl || '').trim();
  const profileImageUrl = String(options.profileImageUrl || '').trim();

  let photoB64 = null;
  if (profileImageUrl) {
    photoB64 = await fetchProfileImageAsBase64Jpeg(profileImageUrl);
  }

  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeV(name)}`];
  if (title) lines.push(`TITLE:${escapeV(title)}`);
  if (org) lines.push(`ORG:${escapeV(org)}`);
  if (phone) lines.push(`TEL;TYPE=CELL:${escapeV(phone)}`);
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${escapeV(email)}`);

  if (cardUrl) {
    lines.push(`URL;WORK:${escapeV(cardUrl)}`);
    lines.push(`NOTE:${escapeV(`Digital Card Link: ${cardUrl}`)}`);
  }

  if (site && normalizeUrlKey(site) !== normalizeUrlKey(cardUrl)) {
    lines.push(`URL;HOME:${escapeV(site)}`);
  }

  if (uid) {
    lines.push(`NOTE:${escapeV(`Visithon Card ID ${uid}`)}`);
  }

  if (photoB64) {
    lines.push(foldVCardLine(`PHOTO;ENCODING=b;TYPE=JPEG:${photoB64}`));
  }

  lines.push('END:VCARD');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_') || 'visithon'}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
