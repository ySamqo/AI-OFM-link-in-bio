const { detectDevice } = require('./deviceDetect');
const { hashIp } = require('./security');

function trackClick(db, link, req) {
  const details = detectDevice(req.get('user-agent') || '');
  db.prepare(`INSERT INTO click_events
    (smart_link_id, referrer, user_agent, device_type, browser, os, in_app_browser, ip_hash,
     utm_source, utm_medium, utm_campaign, utm_content, utm_term)
    VALUES (@smart_link_id, @referrer, @user_agent, @device_type, @browser, @os, @in_app_browser, @ip_hash,
     @utm_source, @utm_medium, @utm_campaign, @utm_content, @utm_term)`).run({
    smart_link_id: link.id, referrer: req.get('referer') || 'Direct', user_agent: req.get('user-agent') || '',
    ...details, ip_hash: hashIp(req.ip), utm_source: req.query.utm_source || '', utm_medium: req.query.utm_medium || '',
    utm_campaign: req.query.utm_campaign || '', utm_content: req.query.utm_content || '', utm_term: req.query.utm_term || ''
  });
}
function grouped(db, field, limit = 10) {
  const allowed = ['source','title','device_type','browser','os','in_app_browser','referrer','utm_source','utm_medium','utm_campaign'];
  if (!allowed.includes(field)) throw new Error('Invalid analytics field');
  const join = ['source','title'].includes(field) ? 'JOIN smart_links s ON s.id=c.smart_link_id' : '';
  const col = ['source','title'].includes(field) ? `s.${field}` : `c.${field}`;
  return db.prepare(`SELECT COALESCE(NULLIF(${col}, ''), 'Not set') label, COUNT(*) value FROM click_events c ${join} GROUP BY label ORDER BY value DESC LIMIT ?`).all(limit);
}
function getAnalytics(db) {
  return {
    total: db.prepare('SELECT COUNT(*) n FROM click_events').get().n,
    unique: db.prepare('SELECT COUNT(DISTINCT ip_hash) n FROM click_events').get().n,
    byLink: grouped(db, 'title'), bySource: grouped(db, 'source'), devices: grouped(db, 'device_type'),
    browsers: grouped(db, 'browser'), systems: grouped(db, 'os'), inApps: grouped(db, 'in_app_browser'),
    referrers: grouped(db, 'referrer'), utmSource: grouped(db, 'utm_source'), utmMedium: grouped(db, 'utm_medium'),
    utmCampaign: grouped(db, 'utm_campaign'),
    days: db.prepare("SELECT date(timestamp) label, COUNT(*) value FROM click_events GROUP BY date(timestamp) ORDER BY label DESC LIMIT 30").all().reverse()
  };
}
module.exports = { trackClick, getAnalytics };
