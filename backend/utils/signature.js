const CryptoJS = require('crypto-js');

function buildSign(params, appKey) {
  const sortedKeys = Object.keys(params).sort();
  const pairs = sortedKeys.map(k => `${k}=${params[k]}`);
  const raw = pairs.join('&') + '&' + appKey;
  return CryptoJS.MD5(raw).toString();
}

function buildQQMusicParams(appId, appKey, extra = {}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const clientIp = '127.0.0.1';
  const base = {
    app_id: appId,
    app_key: appKey,
    client_ip: clientIp,
    timestamp: String(timestamp),
  };
  const sign = buildSign(base, appKey);
  return {
    ...base,
    sign,
    ...extra,
  };
}

module.exports = { buildSign, buildQQMusicParams };
