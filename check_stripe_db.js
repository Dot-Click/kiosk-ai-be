
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkConfig() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'kiosk-ai' });
        const settings = await mongoose.connection.collection('stripesettings').findOne();
        console.log('--- DATABASE STRIPE SETTINGS ---');
        console.log(JSON.stringify(settings, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkConfig();
