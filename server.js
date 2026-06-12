const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ 
  dest: '/tmp/uploads/',
  limits: { fileSize: 200 * 1024 * 1024 }
});

app.use(cors());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Galeria Video Converter' });
});

app.post('/convert', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const inputPath = req.file.path;
  const outputPath = `/tmp/uploads/${Date.now()}.mp4`;

  ffmpeg(inputPath)
    .outputOptions([
      '-c:v libx264',
      '-preset ultrafast',
      '-crf 28',
      '-c:a aac',
      '-b:a 96k',
      '-movflags +faststart',
      '-threads 1',
      '-vf scale=720:-2'
    ])
    .output(outputPath)
    .on('end', () => {
      res.download(outputPath, 'video_galeria.mp4', (err) => {
        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    })
    .on('error', (err) => {
      console.error('Erro:', err);
      fs.unlink(inputPath, () => {});
      res.status(500).json({ error: 'Erro ao converter vídeo' });
    })
    .run();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
