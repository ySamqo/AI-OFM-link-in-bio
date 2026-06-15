process.env.DATABASE_PATH = process.env.DATABASE_PATH || './data/preview.db';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'preview-session-secret-not-for-production';
process.env.IP_HASH_SALT = process.env.IP_HASH_SALT || 'preview-ip-salt-not-for-production';
process.env.PREVIEW_MODE = 'true';

const bcrypt = require('bcrypt');
const { openDatabase } = require('../src/db');
const { createApp } = require('../src/server');

(async () => {
  const db = openDatabase();
  const hash = await bcrypt.hash('preview123', 10);
  db.prepare('INSERT INTO admin_users(email,password_hash) VALUES(?,?) ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash').run('preview@example.com', hash);
  const addLink = db.prepare('INSERT OR IGNORE INTO smart_links(title,slug,destination_url,source,is_active) VALUES(?,?,?,?,?)');
  addLink.run('Instagram', 'instagram', 'https://www.instagram.com', 'Instagram bio', 1);
  addLink.run('TikTok', 'tiktok', 'https://www.tiktok.com', 'TikTok bio', 1);
  addLink.run('VIP Community', 'vip', 'https://example.com/vip', 'Campaign', 0);
  if (!db.prepare('SELECT COUNT(*) n FROM click_events').get().n) {
    const links = db.prepare('SELECT id FROM smart_links').all();
    const add = db.prepare("INSERT INTO click_events(smart_link_id,timestamp,referrer,user_agent,device_type,browser,os,in_app_browser,ip_hash,utm_source,utm_medium,utm_campaign) VALUES(?,datetime('now',?),?,?,?,?,?,?,?,?,?,?)");
    for (let i=0;i<24;i++) add.run(links[i%links.length].id,`-${i%7} days`,i%3?'https://instagram.com':'Direct','Preview browser',i%4?'mobile':'desktop',i%2?'Mobile Safari':'Chrome',i%2?'iOS':'Android',i%3?'Instagram':'None',`visitor-${i%9}`,['instagram','tiktok','newsletter'][i%3],'social','preview-launch');
  }
  const port=Number(process.env.PORT||3000);
  createApp(db).listen(port,()=>console.log(`\nPreview ready: http://localhost:${port}\nEmail: preview@example.com\nPassword: preview123\n\nPress Ctrl+C to stop.\n`));
})().catch(error=>{console.error(error);process.exit(1)});
