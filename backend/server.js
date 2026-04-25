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
  'https://smrithiexperience.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

async function sendCustomerUploadEmail(metadata) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !metadata.email) return;

  const mailOptions = {
    from: `"Smrithi Atelier" <${process.env.EMAIL_USER}>`,
    to: metadata.email,
    subject: `Smrithi Atelier: Photographs Received`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #1E0E06; line-height: 1.6;">
        <h2 style="font-weight: 300; letter-spacing: 0.1em; color: #4E3420; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
          Smrithi Atelier
        </h2>
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">We have securely received your collection for <em>${metadata.dest || 'your upcoming edition'}</em>.</p>
        <p style="font-size: 16px;">The Atelier is currently reviewing the photographs and preparing the initial layouts. Our focus is on deliberate sequencing to ensure the narrative of your journey is preserved correctly.</p>
        <p style="font-size: 16px;">We will notify you once the preview is ready for your review.</p>
        <br/>
        <p style="font-size: 14px; color: #888;">Warm regards,<br/>The Smrithi Team</p>
      </div>
    `,
  };
  try { await transporter.sendMail(mailOptions); } catch (e) { console.error(e); }
}

async function sendCustomerPaymentEmail(customerEmail) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !customerEmail) return;

  const mailOptions = {
    from: `"Smrithi Atelier" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Smrithi Atelier: Commission Confirmed`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #1E0E06; line-height: 1.6;">
        <h2 style="font-weight: 300; letter-spacing: 0.1em; color: #4E3420; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
          Smrithi Atelier
        </h2>
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">Your payment has been successfully secured. Your archival edition is now formally commissioned and entered into our production queue.</p>
        <p style="font-size: 16px;">We will reach out shortly to schedule a brief consultation call. This ensures every detail of the layout aligns with your intentions before we begin the final binding process.</p>
        <br/>
        <p style="font-size: 14px; color: #888;">Warm regards,<br/>The Smrithi Team</p>
      </div>
    `,
  };
  try { await transporter.sendMail(mailOptions); } catch (e) { console.error(e); }
}

function generatePreviewCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
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
      amount: 499000,
      currency: "INR",
      receipt: crypto.randomUUID() // <--- Exactly 36 characters. Perfect.
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// 2. Verify Payment Signature
app.post('/api/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, customer_email } = req.body;
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");

  if (razorpay_signature === expectedSign) {
    if (orderId) {
      try {
        const metaFile = storage.bucket(bucketName).file(`orders/${orderId}/metadata.json`);
        const [metaContent] = await metaFile.download();
        const metadata = JSON.parse(metaContent.toString());
        metadata.status = "paid";
        metadata.paymentId = razorpay_payment_id;
        await metaFile.save(JSON.stringify(metadata, null, 2), { contentType: 'application/json' });
      } catch (err) { console.error(err); }
    }
    if (customer_email) await sendCustomerPaymentEmail(customer_email);
    res.json({ success: true, message: "Payment verified" });
  } else {
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
    await sendCustomerUploadEmail(metadata);

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

// Ops Engine Export — new path: preview/CODE/CODE.json + preview/CODE/preview_folder/
app.post('/api/orders/:orderId/export', async (req, res) => {
  const { orderId } = req.params;
  const { spreads } = req.body;

  if (!spreads || !Array.isArray(spreads)) return res.status(400).json({ error: 'Invalid payload.' });

  try {
    // 1. Read order metadata to get client email + dest
    const metaFile = storage.bucket(bucketName).file(`orders/${orderId}/metadata.json`);
    const [metaContent] = await metaFile.download();
    const metadata = JSON.parse(metaContent.toString());

    // 2. Generate the preview code
    const previewCode = generatePreviewCode();

    // 3. Upload final spread images to preview/CODE/preview_folder/
    const uploadPromises = spreads.map(async (spread) => {
      const buffer = Buffer.from(spread.base64, 'base64');
      const file = storage.bucket(bucketName).file(`preview/${previewCode}/preview_folder/${spread.filename}`);
      await file.save(buffer, { contentType: 'image/jpeg' });
    });
    await Promise.all(uploadPromises);

    // 4. Write the pointer JSON: preview/CODE/CODE.json
    const pointerPayload = {
      orderId,
      previewCode,
      dest: metadata.dest || '',
      status: 'preview_ready',
      generatedAt: new Date().toISOString(),
    };
    const pointerFile = storage.bucket(bucketName).file(`preview/${previewCode}/${previewCode}.json`);
    await pointerFile.save(JSON.stringify(pointerPayload, null, 2), { contentType: 'application/json' });

    // 5. Update order metadata with previewCode and status
    metadata.previewCode = previewCode;
    metadata.status = 'preview_ready';
    await metaFile.save(JSON.stringify(metadata, null, 2), { contentType: 'application/json' });

    // 6. Email the client their access code
    if (metadata.email) {
      const mailOptions = {
        from: `"Smrithi Atelier" <${process.env.EMAIL_USER}>`,
        to: metadata.email,
        subject: `Smrithi Atelier: Your Edition is Ready for Review`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #1E0E06; line-height: 1.6;">
            <h2 style="font-weight: 300; letter-spacing: 0.1em; color: #4E3420; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
              Smrithi Atelier
            </h2>
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">The curation of your journey is complete. We have prepared a digital proof of your archival edition for your review.</p>
            <p style="font-size: 16px;">You may view your layout by entering your secure access code on our portal.</p>
            <div style="background: #fdfaf5; padding: 20px; border: 1px solid #eee; text-align: center; margin: 30px 0;">
              <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-top: 0;">Access Code</p>
              <h1 style="font-weight: 400; letter-spacing: 0.2em; color: #4E3420; margin: 0;">${previewCode}</h1>
            </div>
            <p style="font-size: 14px; color: #888;">Warm regards,<br/>The Smrithi Team</p>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    }

    console.log(`Export complete. Preview code: ${previewCode} | Order: ${orderId}`);
    res.json({ success: true, previewCode });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export.' });
  }
});

// Client Preview Lookup — reads preview/CODE/CODE.json, returns signed spread URLs
app.get('/api/preview/:code', async (req, res) => {
  const cleanCode = req.params.code.toUpperCase().trim();
  try {
    // Read the pointer JSON at preview/CODE/CODE.json
    const pointerFile = storage.bucket(bucketName).file(`preview/${cleanCode}/${cleanCode}.json`);
    const [pointerExists] = await pointerFile.exists();
    if (!pointerExists) return res.status(404).json({ error: 'Invalid access code.' });

    const [pointerContent] = await pointerFile.download();
    const pointer = JSON.parse(pointerContent.toString());
    const { orderId } = pointer;

    // Read order metadata
    const metaFile = storage.bucket(bucketName).file(`orders/${orderId}/metadata.json`);
    const [metaContent] = await metaFile.download();
    const metadata = JSON.parse(metaContent.toString());

    // List spread images from preview/CODE/preview_folder/
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: `preview/${cleanCode}/preview_folder/` });
    const urls = await Promise.all(files.map(async (file) => {
      const [url] = await file.getSignedUrl({ version: 'v4', action: 'read', expires: Date.now() + 60 * 60 * 1000 });
      return { name: file.name.split('/').pop(), url };
    }));

    res.json({
      orderId,
      previewCode: cleanCode,
      metadata,
      spreads: urls.sort((a, b) => a.name.localeCompare(b.name))
    });
  } catch (error) {
    console.error('Preview lookup error:', error);
    res.status(500).json({ error: 'Failed to retrieve preview.' });
  }
});

// Admin Ledger — returns all orders and statuses from GCS
app.get('/api/admin/orders', async (req, res) => {
  try {
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: 'orders/' });
    const metadataFiles = files.filter(file => file.name.endsWith('metadata.json'));
    const orders = await Promise.all(metadataFiles.map(async (file) => {
      const [content] = await file.download();
      const meta = JSON.parse(content.toString());
      const orderId = file.name.split('/')[1];
      return { orderId, ...meta };
    }));
    res.json({ orders });
  } catch (error) {
    console.error('Ledger error:', error);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
});

module.exports = app;