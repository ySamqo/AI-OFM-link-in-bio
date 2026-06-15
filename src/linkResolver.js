function resolveLink(db, slug) {
  // Future deeplink and browser-opening decisions belong here, after the link is found.
  return db.prepare('SELECT * FROM smart_links WHERE slug = ?').get(slug);
}
module.exports = { resolveLink };
