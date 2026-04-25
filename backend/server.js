require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { Storage } = require('@google-cloud/storage');
const nodemailer = require('nodemailer');

const app = express();

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. DYNAMIC CORS FOR NETLIFY AND LOCALHOST
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL // Make sure to add this variable in Render (e.g., https://smrithi-atelier.netlify.app)
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => res.send('Smrithi Engine is live'));

// 2. DYNAMIC GOOGLE CLOUD AUTHENTICATION
let storageOptions = {};

if (process.env.GOOGLE_CREDENTIALS_JSON) {
  // Production (Render): Parse the JSON string from the environment variable
  try {
    storageOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  } catch (error) {
    console.error("Error parsing GOOGLE_CREDENTIALS_JSON:", error);
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Local: Fallback to the file path defined in your local .env
  storageOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
} else {
  console.warn("No Google Cloud credentials found. Uploads will fail.");
}

const storage = new Storage(storageOptions);
const bucketName = process.env.GCS_BUCKET_NAME || 'smrithi_archive';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendNotificationEmail(orderId, metadata) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not set. Skipping notification.');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'yuvanreddy789@gmail.com',
    subject: `New Smrithi Order: ${metadata.dest || 'Untitled'}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h1 style="color: #4e3420;">New Smrithi Order</h1>
        <p>A new edition has been crafted through the engine.</p>
        <div style="background: #fdfaf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> <code style="background: #eee; padding: 2px 5px;">${orderId}</code></p>
          <p><strong>Destination:</strong> ${metadata.dest || 'N/A'}</p>
          <p><strong>Dates:</strong> ${metadata.dates || 'N/A'}</p>
          <p><strong>Mobile:</strong> ${metadata.mobile || 'N/A'}</p>
          <p><strong>Meaning:</strong> ${metadata.meaning || 'N/A'}</p>
        </div>
        <p>Go to the Ops Engine and paste the Order ID to begin layout curation.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent for order ${orderId}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Generate a new Order ID
app.post('/api/orders', (req, res) => {
  const orderId = crypto.randomUUID(); // <--- CHANGE TO THIS
  console.log(`Generated Order ID: ${orderId}`);
  res.json({ orderId });
});

// Generate signed URLs for multiple files
app.post('/api/upload-urls', async (req, res) => {
  const { orderId, files } = req.body;

  if (!orderId || !files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'Invalid request: requires orderId and files array.' });
  }

  console.log(`Generating URLs for Order: ${orderId}, Files: ${files.length}`);

  try {
    const urls = await Promise.all(files.map(async (f) => {
      const safeFilename = f.filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const gcsFileName = `orders/${orderId}/${f.stepId}/${f.id}_${safeFilename}`;

      const file = storage.bucket(bucketName).file(gcsFileName);
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour expiration
        contentType: f.contentType,
      });

      return { id: f.id, url, path: gcsFileName };
    }));

    res.json({ urls });
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    res.status(500).json({ error: 'Failed to generate signed URLs' });
  }
});

// --- RAZORPAY INTEGRATION ---

// 1. Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const options = {
      amount: 499000, // e.g., ₹4,999 in paise (multiply by 100). Adjust as needed.
      currency: "INR",
      receipt: `receipt_${uuidv4()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// 2. Verify Payment Signature
app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    console.log(`Payment Verified for Order: ${razorpay_order_id}`);
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    console.error("Payment Verification Failed: Invalid Signature");
    res.status(400).json({ success: false, error: "Invalid signature" });
  }
});

// Fetch assets for an order
app.get('/api/orders/:orderId/assets', async (req, res) => {
  const { orderId } = req.params;
  console.log(`Fetching assets for Order: ${orderId}`);

  try {
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: `orders/${orderId}/` });

    const urls = await Promise.all(files.map(async (file) => {
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour expiration
      });
      return {
        name: file.name.split('/').pop(),
        path: file.name,
        url
      };
    }));

    res.json({ assets: urls });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Save metadata for an order
app.post('/api/orders/:orderId/metadata', async (req, res) => {
  const { orderId } = req.params;
  const metadata = req.body;

  try {
    const file = storage.bucket(bucketName).file(`orders/${orderId}/metadata.json`);
    await file.save(JSON.stringify(metadata, null, 2), {
      contentType: 'application/json',
    });
    console.log(`Metadata saved for Order: ${orderId}`);

    await sendNotificationEmail(orderId, metadata);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving metadata:', error);
    res.status(500).json({ error: 'Failed to save metadata' });
  }
});

// Fetch metadata for an order
app.get('/api/orders/:orderId/metadata', async (req, res) => {
  const { orderId } = req.params;
  try {
    const file = storage.bucket(bucketName).file(`orders/${orderId}/metadata.json`);
    const [content] = await file.download();
    res.json(JSON.parse(content.toString()));
  } catch (error) {
    res.json({});
  }
});

module.exports = app;