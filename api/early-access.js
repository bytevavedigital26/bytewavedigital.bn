const crypto = require('crypto');

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const DEFAULT_TO_EMAIL = 'Aziq.bytewavedigital@gmail.com';
const DEFAULT_FROM_EMAIL = 'ByteWave Digital <onboarding@resend.dev>';
const MAX_BODY_BYTES = 32 * 1024;

const PRODUCTS = {
  bn: 'SideQuest.BN',
  tourism: 'SideQuest Tourism'
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function clean(value, maxLength) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getRecipients() {
  return String(process.env.RESEND_TO_EMAIL || DEFAULT_TO_EMAIL)
    .split(',')
    .map(function(email) { return email.trim(); })
    .filter(Boolean);
}

function readRequestBody(req) {
  return new Promise(function(resolve, reject) {
    var chunks = [];
    var size = 0;

    req.on('data', function(chunk) {
      size += chunk.length;
      if(size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body is too large.'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on('end', function() {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', reject);
  });
}

async function parsePayload(req) {
  if(req.body && typeof req.body === 'object') {
    return req.body;
  }

  var raw = typeof req.body === 'string' ? req.body : await readRequestBody(req);
  if(!raw) return {};

  var contentType = String(req.headers['content-type'] || '').toLowerCase();
  if(contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
    return Object.fromEntries(new URLSearchParams(raw));
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw Object.assign(new Error('Invalid request payload.'), { statusCode: 400 });
  }
}

function buildEmailContent(submission) {
  var rows = [
    ['Product', submission.productName],
    ['Name', submission.name],
    ['Email', submission.email],
    ['Audience', submission.role],
    ['Submitted', new Date().toISOString()]
  ];

  var htmlRows = rows.map(function(row) {
    return '<tr><th align="left" style="padding:8px 12px;background:#f7f5f1;color:#0B2A43;width:130px;">' +
      escapeHtml(row[0]) +
      '</th><td style="padding:8px 12px;color:#123A5C;">' +
      escapeHtml(row[1]) +
      '</td></tr>';
  }).join('');

  var text = rows.map(function(row) {
    return row[0] + ': ' + row[1];
  }).join('\n');

  return {
    html: '<div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0B2A43;">' +
      '<h1 style="font-size:20px;margin:0 0 16px;">New ByteWave early access signup</h1>' +
      '<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e6e2dc;">' +
      htmlRows +
      '</table>' +
      '</div>',
    text: 'New ByteWave early access signup\n\n' + text
  };
}

async function sendWithResend(submission) {
  if(typeof fetch !== 'function') {
    throw Object.assign(new Error('This runtime needs Node 18 or newer for fetch().'), { statusCode: 500 });
  }

  var apiKey = process.env.RESEND_API_KEY;
  if(!apiKey) {
    throw Object.assign(new Error('Email service is not configured yet.'), { statusCode: 500 });
  }

  var content = buildEmailContent(submission);
  var idempotencyKey = crypto
    .createHash('sha256')
    .update(submission.product + ':' + submission.email + ':' + Date.now())
    .digest('hex');

  var response = await fetch(RESEND_EMAILS_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: getRecipients(),
      subject: 'New ' + submission.productName + ' early access signup',
      html: content.html,
      text: content.text,
      reply_to: submission.email,
      tags: [
        { name: 'source', value: 'bytewave_landing' },
        { name: 'product', value: submission.product }
      ]
    })
  });

  var data = await response.json().catch(function() { return {}; });
  if(!response.ok) {
    console.error('Resend email failed:', response.status, data);
    throw Object.assign(new Error('Email delivery failed. Please use the email or phone link instead.'), { statusCode: 502 });
  }

  return data;
}

module.exports = async function handler(req, res) {
  if(req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return sendJson(res, 200, {});
  }

  if(req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return sendJson(res, 405, { message: 'Method not allowed.' });
  }

  try {
    var payload = await parsePayload(req);

    if(clean(payload.company, 80)) {
      return sendJson(res, 200, { message: 'Thanks - you are on the early access list.' });
    }

    var product = clean(payload.product, 30).toLowerCase();
    var productName = PRODUCTS[product];
    var name = clean(payload.name, 120);
    var email = clean(payload.email, 254).toLowerCase();
    var role = clean(payload.role, 120);

    if(!productName) {
      return sendJson(res, 400, { message: 'Choose a valid ByteWave product.' });
    }

    if(name.length < 2) {
      return sendJson(res, 400, { message: 'Enter your name.' });
    }

    if(!isValidEmail(email)) {
      return sendJson(res, 400, { message: 'Enter a valid email address.' });
    }

    if(!role) {
      return sendJson(res, 400, { message: 'Choose the option that best describes you.' });
    }

    await sendWithResend({ product: product, productName: productName, name: name, email: email, role: role });

    return sendJson(res, 200, { message: 'Thanks - you are on the early access list.' });
  } catch (error) {
    var statusCode = error.statusCode || 500;
    if(statusCode >= 500) {
      console.error(error);
    }
    return sendJson(res, statusCode, {
      message: error.message || 'Something went wrong. Please try again shortly.'
    });
  }
};
