const crypto = require('crypto');
const Admin = require('../models/Admin');
const AdminToken = require('../models/AdminToken');
const jwt = require('jsonwebtoken');
const { sendMagicLinkEmail } = require('../services/emailService');

const JWT_EXPIRY = '24h';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const ALLOWED_ADMIN_EMAIL = 'm.sanjayram07@gmail.com';
const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

exports.sendMagicLink = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    if (normalizedEmail !== ALLOWED_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized admin email.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await AdminToken.deleteMany({ email: normalizedEmail });
    await AdminToken.create({ email: normalizedEmail, token, expiresAt });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const magicLink = `${clientUrl}/admin-auth?token=${token}`;

    const emailResult = await sendMagicLinkEmail(normalizedEmail, magicLink);

    const response = {
      success: true,
      message: 'Magic link sent to your email. Check your inbox (and spam folder).',
    };
    if (emailResult?.devMagicLink) {
      response.magicLink = emailResult.devMagicLink;
      response.message = 'Magic link (SMTP not configured — use link below):';
    }

    res.json(response);
  } catch (err) {
    console.error('Magic link error:', err);
    res.status(500).json({ error: err.message || 'Failed to send magic link.' });
  }
};

exports.verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required.' });
    }

    const adminTokenDoc = await AdminToken.findOne({ token });
    if (!adminTokenDoc) {
      return res.status(401).json({ error: 'Invalid or expired magic link.' });
    }

    if (new Date() > adminTokenDoc.expiresAt) {
      await AdminToken.deleteOne({ _id: adminTokenDoc._id });
      return res.status(401).json({ error: 'Magic link has expired.' });
    }

    const email = adminTokenDoc.email;
    if (email !== ALLOWED_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized admin email.' });
    }

    // Ensure Admin document exists for JWT validation
    let admin = await Admin.findOne({ email });
    if (!admin) {
      admin = await Admin.create({
        email,
        password: crypto.randomBytes(16).toString('hex'),
      });
    }

    const jwtToken = jwt.sign(
      { adminId: admin._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    await AdminToken.deleteOne({ _id: adminTokenDoc._id });

    res.json({
      success: true,
      token: jwtToken,
      admin: { id: admin._id, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await admin.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { adminId: admin._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
