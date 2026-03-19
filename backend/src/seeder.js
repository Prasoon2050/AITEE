const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
const s3 = require('./config/s3');

dotenv.config();

connectDB();

const products = [
  {
    name: 'Cyberpunk Neon Tee',
    imageFile: 'cyberpunk.png',
    description: 'A futuristic cyberpunk t-shirt design with neon colors and circuit board patterns. Perfect for tech enthusiasts and gamers.',
    brand: 'AITEE',
    category: 'Sci-Fi',
    price: 39.99,
    countInStock: 15,
    rating: 4.8,
    numReviews: 10,
  },
  {
    name: 'Abstract Splash Tee',
    imageFile: 'abstract.png',
    description: 'An abstract artistic t-shirt design with splashing colorful paint. Express your creativity with this vibrant piece.',
    brand: 'AITEE',
    category: 'Art',
    price: 34.99,
    countInStock: 20,
    rating: 4.5,
    numReviews: 8,
  },
  {
    name: 'Geometric Wolf Tee',
    imageFile: 'nature.png',
    description: 'A nature-inspired t-shirt design with a geometric wolf and forest elements. A blend of wild nature and modern art.',
    brand: 'AITEE',
    category: 'Nature',
    price: 29.99,
    countInStock: 25,
    rating: 4.7,
    numReviews: 15,
  },
  {
    name: 'Minimalist Robot Tee',
    imageFile: 'robot.png',
    description: 'A minimalist AI t-shirt design with a robot hand holding a flower. Symbolizing the harmony between technology and nature.',
    brand: 'AITEE',
    category: 'Minimalist',
    price: 32.99,
    countInStock: 12,
    rating: 4.9,
    numReviews: 20,
  },
  {
    name: 'Synthwave Sunset Tee',
    imageFile: 'synthwave.png',
    description: 'A retro synthwave t-shirt design with a sunset and grid. Relive the 80s with this nostalgic aesthetic.',
    brand: 'AITEE',
    category: 'Retro',
    price: 36.99,
    countInStock: 18,
    rating: 4.6,
    numReviews: 12,
  },
];

const uploadImageToS3 = async (fileName) => {
  const filePath = path.join(__dirname, '../uploads', fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `products/${Date.now()}-${fileName}`,
    Body: fileContent,
    ContentType: 'image/png',
  };

  try {
    const data = await s3.upload(params).promise();
    console.log(`Uploaded ${fileName} to ${data.Location}`);
    return data.Location;
  } catch (error) {
    console.error(`Error uploading ${fileName}:`, error);
    throw error;
  }
};

const setBucketPolicy = async () => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${bucketName}/products/*`
      }
    ]
  };

  const params = {
    Bucket: bucketName,
    Policy: JSON.stringify(policy)
  };

  try {
    await s3.putBucketPolicy(params).promise();
    console.log('Bucket policy updated to allow public read access for products.');
  } catch (error) {
    console.warn('Warning: Could not update bucket policy. Images may not be visible.');
    console.warn('Error:', error.message);
    console.warn('Please ensure "Block Public Access" is disabled and you have permission to set bucket policies.');
  }
};

const importData = async () => {
  try {
    await setBucketPolicy();
    
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed...');

    const createdUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
    });

    const adminUser = createdUser._id;

    const productsWithImages = [];

    for (const product of products) {
      const imageUrl = await uploadImageToS3(product.imageFile);
      if (imageUrl) {
        productsWithImages.push({
          ...product,
          image: imageUrl,
          user: adminUser,
        });
      }
    }

    await Product.insertMany(productsWithImages);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
