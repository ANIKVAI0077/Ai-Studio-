import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import { editImage } from "./ai-provider.js";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(allowed.includes(file.mimetype) ? null : new Error("Only JPG, PNG and WEBP are allowed"), allowed.includes(file.mimetype));
  }
});
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:5500" }));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "AI Photo Studio API", aiConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY) }));
app.post("/api/ai-edit", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "ছবি আপলোড করা হয়নি।" });
    const operation = String(req.body.operation || "");
    const allowed = ["retouch", "background_remove", "enhance", "restore"];
    if (!allowed.includes(operation)) return res.status(400).json({ error: "Invalid operation." });
    const result = await editImage({ file: req.file, operation, options: req.body });
    res.type(result.mimeType || "image/png").send(result.buffer);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "AI processing failed." });
  }
});
app.use((err, _req, res, _next) => res.status(err.status || 400).json({ error: err.message || "Request error." }));
const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`AI Photo Studio API listening on http://localhost:${port}`));
