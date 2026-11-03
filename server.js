// خادم مثال لإرسال الردود تلقائياً عبر واتساب (WhatsApp Cloud API) والبريد (SMTP).
// التشغيل: cd server && npm install && cp .env.example .env && npm start
require('dotenv').config();
const express = require('express'), cors = require('cors'), nodemailer = require('nodemailer');
const app = express();
app.use(express.json({ limit: '50kb' }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));   // رابط موقعك فقط

// المصادقة: يجب أن يرسل الموقع رمز موظف مسجّل (Bearer). لا تضع أي مفتاح سري في ملفات الواجهة.
// استبدل verifyStaff بالتحقق الحقيقي (JWT/جلسة) من صلاحية "تعديل" على طلبات الخدمات.
// DEV_TOKEN للتجربة المحلية فقط، اتركه فارغاً في الإنتاج.
const verifyStaff = (token) => !!token && !!process.env.DEV_TOKEN && token === process.env.DEV_TOKEN;
const auth = (req, res, next) =>
  verifyStaff((req.get('authorization') || '').replace(/^Bearer /, '')) ? next() : res.status(401).json({ error: 'unauthorized' });

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function sendWhatsApp(to, body) {
  // رسائل النص الحر لا تصل إلا خلال 24 ساعة من آخر رسالة للمواطن؛
  // خارج هذه النافذة يلزم قالب رسالة معتمد (template) من Meta.
  const r = await fetch(`https://graph.facebook.com/v20.0/${process.env.WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
  });
  if (!r.ok) throw new Error('whatsapp ' + r.status + ' ' + (await r.text()));
}

app.post('/api/requests/:id/reply', auth, async (req, res) => {
  const { channel, to, subject, message } = req.body || {};
  if (!['whatsapp', 'email'].includes(channel) || !to || !message || message.length > 4000)
    return res.status(400).json({ error: 'bad request' });
  try {
    if (channel === 'whatsapp') {
      if (!/^\d{11,15}$/.test(to)) return res.status(400).json({ error: 'bad phone' });
      await sendWhatsApp(to, message);
    } else {
      if (!/^\S+@\S+\.\S+$/.test(to)) return res.status(400).json({ error: 'bad email' });
      await mailer.sendMail({ from: process.env.MAIL_FROM, to, subject: subject || 'رد على طلبكم', text: message });
    }
    // TODO: حدّث حالة الطلب والرد في قاعدة البيانات هنا (contact/service_requests).
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(502).json({ error: 'send failed' }); }
});

app.listen(process.env.PORT || 3000, () => console.log('API up'));
