const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const s3 = require('../config/s3');
const { protect, admin } = require('../middleware/authMiddleware');

const getS3ObjectKey = (imageValue) => {
  if (typeof imageValue !== 'string') {
    return null;
  }

  const trimmedValue = imageValue.trim();

  if (!trimmedValue || trimmedValue.startsWith('data:')) {
    return null;
  }

  if (!trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
    return trimmedValue.startsWith('/') ? null : trimmedValue;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmedValue);
  } catch (error) {
    console.error(`Invalid image URL "${trimmedValue}" while deleting product`, error);
    return null;
  }

  const bucketName = process.env.AWS_BUCKET_NAME;
  const hostname = parsedUrl.hostname.toLowerCase();
  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

  if (!pathSegments.length) {
    return null;
  }

  if (bucketName && hostname.startsWith(`${bucketName.toLowerCase()}.s3`)) {
    return pathSegments.join('/');
  }

  if (hostname.endsWith('.s3.amazonaws.com') || hostname.includes('.s3.')) {
    return pathSegments.join('/');
  }

  if (hostname === 's3.amazonaws.com' || hostname.startsWith('s3.')) {
    if (pathSegments.length < 2) {
      return null;
    }

    if (bucketName && pathSegments[0] !== bucketName) {
      return null;
    }

    return pathSegments.slice(1).join('/');
  }

  return null;
};

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private
router.post('/', protect, async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    images,
    brand,
    category,
    countInStock,
  } = req.body;

  try {
    const product = new Product({
      name,
      price,
      user: req.user._id,
      image,
      images,
      brand,
      category,
      countInStock,
      numReviews: 0,
      description,
      createdBy: req.user.name
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Create new review
// @access  Private

router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const imageValues = [product.image, ...(Array.isArray(product.images) ? product.images : [])];
      const imageKeys = [...new Set(imageValues.map(getS3ObjectKey).filter(Boolean))];

      if (imageKeys.length > 0) {
        const bucketName = process.env.AWS_BUCKET_NAME;

        if (!bucketName) {
          return res.status(500).json({ message: 'AWS bucket not configured. Unable to remove product images.' });
        }

        await Promise.all(
          imageKeys.map(async (key) => {
            try {
              await s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
            } catch (s3Error) {
              if (s3Error.code === 'NoSuchKey') {
                return;
              }
              throw s3Error;
            }
          })
        );
      }

      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
