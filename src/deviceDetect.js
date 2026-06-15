const { UAParser } = require('ua-parser-js');

function detectDevice(userAgent = '') {
  const parsed = UAParser(userAgent);
  const type = parsed.device.type || 'desktop';
  const ua = userAgent.toLowerCase();
  let inApp = 'None';
  if (/instagram/.test(ua)) inApp = 'Instagram';
  else if (/fbav|fban/.test(ua)) inApp = 'Facebook';
  else if (/tiktok/.test(ua)) inApp = 'TikTok';
  else if (/twitter|x-client/.test(ua)) inApp = 'X';
  else if (/snapchat/.test(ua)) inApp = 'Snapchat';
  return { device_type: type, browser: parsed.browser.name || 'Unknown', os: parsed.os.name || 'Unknown', in_app_browser: inApp };
}
module.exports = { detectDevice };
