// test-upload.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BACKEND_URL = 'http://nodejs-production-25045463.up.railway.app/api/v1';

async function testUpload() {
  console.log('🧪 Testing Upload Endpoint...\n');
  
  try {
    // 1. Generate QR code first
    console.log('1. Generating QR code...');
    const qrRes = await axios.post(`${BACKEND_URL}/qr/generate`);
    const code = qrRes.data.data.code;
    console.log('✅ QR Code:', code);
    
    // 2. Validate the QR code
    console.log('\n2. Validating QR code...');
    const validateRes = await axios.get(`${BACKEND_URL}/qr/validate/${code}`);
    console.log('✅ QR Valid:', validateRes.data.data.isValid);
    
    // 3. Create a test image file
    const testImagePath = 'test-image.jpg';
    // Create a simple 1x1 pixel image
    const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, '');
    fs.writeFileSync(testImagePath, base64Data, 'base64');
    
    // 4. Upload the test image
    console.log('\n3. Uploading test image...');
    const formData = new FormData();
    formData.append('code', code);
    formData.append('image', fs.createReadStream(testImagePath));
    
    const uploadRes = await axios.post(`${BACKEND_URL}/upload/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Upload Response:', uploadRes.data);
    
    // 5. Check if upload was successful
    console.log('\n4. Checking upload status...');
    const checkRes = await axios.get(`${BACKEND_URL}/upload/check/${code}`);
    console.log('✅ Upload exists:', checkRes.data.data.exists);
    if (checkRes.data.data.exists) {
      console.log('✅ Image URL:', checkRes.data.data.imageUrl);
    }
    
    // 6. Clean up
    fs.unlinkSync(testImagePath);
    console.log('\n🎉 Upload test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    console.error('Full error:', error);
  }
}

testUpload();