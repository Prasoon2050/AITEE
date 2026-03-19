const express = require("express");
const router = express.Router();
const multer = require("multer");
const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/authMiddleware");

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/images/upload
// @desc    Upload image to S3
// @access  Public
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileContent = req.file.buffer;
  const fileName = `${uuidv4()}-${req.file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: req.file.mimetype,
    // ACL: 'public-read' // Optional: depends on bucket settings
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error uploading to S3", error: err.message });
    }
    res.json({
      message: "Image uploaded successfully",
      imageUrl: data.Location,
      key: data.Key,
    });
  });
});

// @route   POST /api/images/upload-base64
// @desc    Upload base64 image to S3
// @access  Private
router.post("/upload-base64", protect, async (req, res) => {
  try {
    const { image, folder = "designs" } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image data provided" });
    }

    // Extract base64 data and content type
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: "Invalid base64 image format" });
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Determine file extension from content type
    const extension = contentType.split("/")[1] || "png";
    const fileName = `${folder}/${uuidv4()}.${extension}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    };

    const data = await s3.upload(params).promise();

    res.json({
      message: "Image uploaded successfully",
      imageUrl: data.Location,
      key: data.Key,
    });
  } catch (error) {
    console.error("Base64 upload error:", error);
    res
      .status(500)
      .json({ message: "Error uploading to S3", error: error.message });
  }
});

// @route   POST /api/images/upload-multiple-base64
// @desc    Upload multiple base64 images to S3
// @access  Private
router.post("/upload-multiple-base64", protect, async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const uploadPromises = images.map(async (item) => {
      const { image, folder = "designs" } = item;

      if (!image) return null;

      // Handle both base64 and URL images
      if (image.startsWith("http://") || image.startsWith("https://")) {
        // If already a URL, return as is
        return { imageUrl: image, key: null, isExisting: true };
      }

      // Extract base64 data and content type
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        return null;
      }

      const contentType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      // Determine file extension from content type
      const extension = contentType.split("/")[1] || "png";
      const fileName = `${folder}/${uuidv4()}.${extension}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
      };

      const data = await s3.upload(params).promise();

      return {
        imageUrl: data.Location,
        key: data.Key,
        isExisting: false,
      };
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((r) => r !== null);

    res.json({
      message: "Images uploaded successfully",
      uploads: successfulUploads,
      imageUrls: successfulUploads.map((u) => u.imageUrl),
    });
  } catch (error) {
    console.error("Multiple base64 upload error:", error);
    res
      .status(500)
      .json({ message: "Error uploading to S3", error: error.message });
  }
});

module.exports = router;
