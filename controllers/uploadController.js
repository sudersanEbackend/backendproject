const sharp = require("sharp");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
const ConstructionAsset = require("../models/ConstructionAsset");

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            });
        }

        // Convert image to WebP
        const webpBuffer = await sharp(req.file.buffer)
            .webp({ quality: 80 })
            .toBuffer();

        // Generate unique file name
        const fileName = `construction-${Date.now()}.webp`;

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: webpBuffer,
            ContentType: "image/webp",
        });

        await s3.send(command);

        // Generate image URL
        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        const asset = await ConstructionAsset.create({
            fileName,
            imageUrl,
            contentType: "image/webp",
            fileSize: webpBuffer.length,
        });

        return res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            imageUrl,
            data: asset,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};