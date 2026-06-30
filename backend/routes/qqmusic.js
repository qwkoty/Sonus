const express = require('express');
const axios = require('axios');
const { buildQQMusicParams } = require('../utils/signature');
const router = express.Router();

const BASE_URL = 'https://openrpc.music.qq.com/rpc_proxy/fcgi-bin/music_open_api.fcg';

router.get('/qrcode', async (req, res) => {
  try {
    const params = buildQQMusicParams(process.env.APP_ID, process.env.APP_KEY, {
      opi_cmd: 'fcg_music_custom_sdk_get_qr_code.fcg',
      qqmusic_open_appid: process.env.APP_ID,
      qqmusic_package_name: 'com.sonus.app',
      qqmusic_dev_name: 'Sonus',
      qqmusic_qrcode_type: 'universal',
      qqmusic_encrypt_auth: JSON.stringify({ response_type: 'code', state: Date.now() }),
    });
    const { data } = await axios.get(BASE_URL, { params, timeout: 15000 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/qrcode/poll', async (req, res) => {
  try {
    const { authCode } = req.query;
    const params = buildQQMusicParams(process.env.APP_ID, process.env.APP_KEY, {
      opi_cmd: 'fcg_music_custom_qrcode_auth_poll.fcg',
      qqmusic_openid_appId: process.env.APP_ID,
      qqmusic_openid_authCode: authCode,
    });
    const { data } = await axios.get(BASE_URL, { params, timeout: 15000 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/token', async (req, res) => {
  try {
    const { code } = req.query;
    const params = buildQQMusicParams(process.env.APP_ID, process.env.APP_KEY, {
      opi_cmd: 'fcg_music_oauth_get_accesstoken.fcg',
      code,
      cmd: 'getToken',
    });
    const { data } = await axios.get(BASE_URL, { params, timeout: 15000 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/token/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.query;
    const params = buildQQMusicParams(process.env.APP_ID, process.env.APP_KEY, {
      opi_cmd: 'fcg_music_oauth_get_accesstoken.fcg',
      qqmusic_refresh_token: refreshToken,
      cmd: 'refreshToken',
    });
    const { data } = await axios.get(BASE_URL, { params, timeout: 15000 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/userinfo', async (req, res) => {
  try {
    const { openId, accessToken } = req.query;
    const params = buildQQMusicParams(process.env.APP_ID, process.env.APP_KEY, {
      opi_cmd: 'fcg_music_custom_get_userinfo.fcg',
      login_type: '6',
      qqmusic_open_appid: process.env.APP_ID,
      qqmusic_open_id: openId,
      qqmusic_access_token: accessToken,
    });
    const { data } = await axios.get(BASE_URL, { params, timeout: 15000 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { keyword, page = 1, num = 20 } = req.query;
    const params = buildQQMusicParams(process.env.APP_ID, process.env.APP_KEY, {
      opi_cmd: 'fcg_music_search.fcg',
      login_type: '6',
      keyword,
      page: String(page),
      num: String(num),
    });
    const { data } = await axios.get(BASE_URL, { params, timeout: 15000 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/playlist', async (req, res) => {
  try {
    const { id } = req.query;
    const params = buildQQMusicParams(process.env.APP_ID, process.env.APP_KEY, {
      opi_cmd: 'fcg_music_custom_get_songlist_detail.fcg',
      login_type: '6',
      songlist_id: id,
    });
    const { data } = await axios.get(BASE_URL, { params, timeout: 15000 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/rank', async (req, res) => {
  try {
    const { topId = 26 } = req.query;
    const params = buildQQMusicParams(process.env.APP_ID, process.env.APP_KEY, {
      opi_cmd: 'fcg_music_custom_get_rank_songlist.fcg',
      login_type: '6',
      topId: String(topId),
    });
    const { data } = await axios.get(BASE_URL, { params, timeout: 15000 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
