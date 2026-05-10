/** Client-side vCard download (replaces FastAPI /card-auth/download-vcard). */
export function triggerVCardDownload(user) {
  if (!user || typeof user !== 'object') return;
  const name = String(user.name || 'Contact').trim();
  const email = String(user.email || '').trim();
  const phone = String(user.phone1 || '').trim();
  const org = String(user.company || '').trim();
  const title = String(user.role || '').trim();
  const site = String(user.website || '').trim();
  const uid = String(user.id || '').trim();

  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeV(name)}`];
  if (title) lines.push(`TITLE:${escapeV(title)}`);
  if (org) lines.push(`ORG:${escapeV(org)}`);
  if (phone) lines.push(`TEL;TYPE=CELL:${escapeV(phone)}`);
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${escapeV(email)}`);
  if (site) lines.push(`URL:${escapeV(site)}`);
  if (uid) lines.push(`NOTE:Visithon Card ID ${escapeV(uid)}`);
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

function escapeV(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
