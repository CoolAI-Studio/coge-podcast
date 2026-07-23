import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Server-side backup upload to Google Drive
  app.post("/api/backup-to-drive", async (req, res) => {
    console.log("Received server-side backup request...");
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "授權資訊遺失或無效，請重新登入 Google 帳號。" });
      }

      const token = authHeader.substring(7);
      const { type } = req.body; // 'zip' or 'tar'
      
      const fileName = type === 'tar' ? 'coge-world-podcast-export.tar.gz' : 'coge-world-podcast-export.zip';
      const filePath = path.join(process.cwd(), 'public', type === 'tar' ? 'project-export.tar.gz' : 'project-export.zip');

      console.log(`Target backup file: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "備份檔案尚未於伺服器生成。請稍候重新打包備份。" });
      }

      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = type === 'tar' ? 'application/gzip' : 'application/zip';

      const metadata = {
        name: fileName,
        mimeType: mimeType,
        description: 'Coge World Podcast 專案原始碼完整備份包 (由伺服器代理上傳，避開瀏覽器 CORS 與沙盒限制)',
      };

      const boundary = 'coge_backup_boundary_server';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadataPart = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n\r\n`;

      const multipartBody = Buffer.concat([
        Buffer.from(metadataPart, 'utf-8'),
        fileBuffer,
        Buffer.from(closeDelimiter, 'utf-8')
      ]);

      console.log(`Uploading ${multipartBody.length} bytes to Google Drive...`);

      const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Content-Length': multipartBody.length.toString(),
        },
        body: multipartBody,
      });

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        console.error('Google Drive API error details:', errText);
        let parsedErr = errText;
        try {
          const errObj = JSON.parse(errText);
          parsedErr = errObj.error?.message || errText;
        } catch {}
        return res.status(uploadResponse.status).json({ error: `Google Drive 伺服器回傳異常: ${parsedErr}` });
      }

      const responseData = await uploadResponse.json() as any;
      console.log("Successfully uploaded to Google Drive. File ID:", responseData.id);

      return res.json({ 
        success: true, 
        id: responseData.id,
        viewUrl: `https://drive.google.com/file/d/${responseData.id}/view` 
      });

    } catch (error: any) {
      console.error('Backup proxy error:', error);
      return res.status(500).json({ error: `伺服器上傳處理失敗: ${error.message || "未知伺服器錯誤"}` });
    }
  });

  // API Route: Manual Sync to GitHub
  app.post("/api/sync-github", async (req, res) => {
    console.log("Received manual sync request...");
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "授權資訊遺失或無效，請重新登入 Google 帳號。" });
      }
      
      const { exec } = await import("child_process");
      const util = await import("util");
      const execPromise = util.promisify(exec);
      
      console.log("Building data (fetching new episodes)...");
      await execPromise("npm run build:data");
      
      console.log("Pushing to GitHub...");
      const { stdout } = await execPromise("npm run sync:github");
      
      console.log("Sync completed.");
      return res.json({ success: true, log: stdout });
    } catch (error: any) {
      console.error("Sync error:", error);
      return res.status(500).json({ 
        error: `同步失敗: ${error.message || "未知錯誤"}`,
        log: error.stdout
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static files...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
