const crypto = require('crypto');

const dangerousSchemes = /^(javascript|data|file|vbscript):/i;
function isValidDestination(value) {
  if (!value || dangerousSchemes.test(value.trim())) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch { return false; }
}
function isValidSlug(value) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value || ''); }
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c]));
}
function hashIp(ip) {
  return crypto.createHmac('sha256', process.env.IP_HASH_SALT || 'development-only-salt').update(ip || 'unknown').digest('hex');
}
function requireAdmin(req, res, next) {
  if (!req.session.adminId) return res.redirect('/login');
  next();
}
module.exports = { isValidDestination, isValidSlug, escapeHtml, hashIp, requireAdmin };
