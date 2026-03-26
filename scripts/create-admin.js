#!/usr/bin/env node
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-examination-system';
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

async function run() {
  try {
    console.log('Connecting to', MONGO);
    await mongoose.connect(MONGO, { dbName: undefined });
    const db = mongoose.connection.db;
    const users = db.collection('users');

    const name = 'monu';
    const email = 'monu@testy.com';
    const password = 'Monu@2001';

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const existing = await users.findOne({ email });
    if (existing) {
      await users.updateOne(
        { email },
        { $set: { name, role: 'admin', password: hashed, isActive: true, lastLogin: null } }
      );
      console.log('Updated existing admin with email', email);
    } else {
      const doc = {
        name,
        email,
        password: hashed,
        role: 'admin',
        isActive: true,
        dateJoined: new Date(),
      };
      await users.insertOne(doc);
      console.log('Created admin user with email', email);
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

run();
