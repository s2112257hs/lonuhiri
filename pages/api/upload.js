import fs from "fs";
import path from "path";

import multer from "multer";

import File from "@/models/File";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const uploadPath = path.join(process.cwd(), "public/images");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

async function saveFile(file) {
  return File.create({
    filename: file.filename,
    originalName: file.originalname,
    path: `/images/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size,
  });
}

function toPublicFile(fileRecord) {
  return {
    _id: fileRecord._id,
    filename: fileRecord.filename,
    originalName: fileRecord.originalName,
    path: fileRecord.path,
    mimeType: fileRecord.mimeType,
    size: fileRecord.size,
  };
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectToDatabase();

    const isMultiple = req.query.multiple === "true";
    const uploadHandler = isMultiple
      ? upload.array("files", 10)
      : upload.single("file");

    uploadHandler(req, res, async (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(500).json({
          error: "Error uploading file(s)",
          details: err.message,
        });
      }

      if (!req.file && !req.files) {
        return res.status(400).json({ error: "No file(s) uploaded" });
      }

      try {
        if (isMultiple && req.files) {
          const fileRecords = await Promise.all(
            req.files.map((file) => saveFile(file)),
          );

          res.status(200).json({
            message: "Files uploaded successfully",
            files: fileRecords.map(toPublicFile),
          });
        } else {
          const fileRecord = await saveFile(req.file);

          res.status(200).json({
            message: "File uploaded successfully",
            file: toPublicFile(fileRecord),
          });
        }
      } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
          error: "Error saving file information",
          details: error.message,
        });
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Error connecting to database",
      details: error.message,
    });
  }
}
