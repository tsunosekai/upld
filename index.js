const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const checkDiskSpace = require('check-disk-space');

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// 静的ファイルを提供する
app.use(express.static('public'));

// ファイルアップロードのルートを設定
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully');
});

// ファイル一覧を取得
app.get('/filelist', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      res.status(500).send('Error reading files');
    } else {
      res.json(files);
    }
  });
});

// ファイルを削除
app.delete('/deletefile/:filename', (req, res) => {
  const filePath = path.join('uploads', req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      res.status(500).send('Error deleting file');
    } else {
      res.send('File deleted successfully');
    }
  });
});

// ファイルダウンロードのルートを設定
app.get('/files/:filename', (req, res) => {
  const filePath = path.join('uploads', req.params.filename);
  res.download(filePath);
});

// サーバーの空き容量を取得
app.get('/freespace', async (req, res) => {
  try {
    const diskSpace = await checkDiskSpace('/');
    res.json({ freeSpace: diskSpace.free });
  } catch (err) {
    res.status(500).send('Error getting free space');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});