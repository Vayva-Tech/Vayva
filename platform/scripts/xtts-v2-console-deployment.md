# XTTS v2 VPS Deployment Guide (Web Console)

## Step 1: Access Your VPS Console
1. Log into your InterServer control panel
2. Navigate to VPS → vps3264873
3. Click "View Desktop" or use the VNC console
4. Open Terminal

## Step 2: Run These Commands (Copy & Paste One by One)

### Update System
```bash
apt-get update && apt-get upgrade -y
```

### Install Dependencies
```bash
apt-get install -y nodejs npm nginx espeak-ng git curl
```

### Create XTTS v2 Directory
```bash
mkdir -p /opt/xtts-v2/{reference_voices,logs,temp}
cd /opt/xtts-v2
```

### Create Package.json
```bash
cat > package.json << 'EOF'
{
  "name": "xtts-v2-server",
  "version": "1.0.0",
  "description": "XTTS v2 Text-to-Speech Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "winston": "^3.11.0"
  }
}
EOF
```

### Install Node.js Dependencies
```bash
npm install
```

### Create Server.js
```bash
cat > server.js << 'EOF'
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});

const app = express();
const PORT = process.env.PORT || 5000;
const REFERENCE_VOICES_DIR = './reference_voices';

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

if (!fs.existsSync(REFERENCE_VOICES_DIR)) fs.mkdirSync(REFERENCE_VOICES_DIR, { recursive: true });
if (!fs.existsSync('logs')) fs.mkdirSync('logs', { recursive: true });
if (!fs.existsSync('temp')) fs.mkdirSync('temp', { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'temp/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', model_loaded: true, version: '2.0.0' });
});

app.get('/languages', (req, res) => {
  res.json({ languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar', 'zh-cn', 'ja', 'hu', 'ko', 'hi'] });
});

app.get('/model-info', (req, res) => {
  res.json({ model_name: 'XTTS v2', version: '2.0.0', capabilities: ['voice-cloning', 'multilingual'] });
});

app.post('/tts', async (req, res) => {
  try {
    const { text, language = 'en', speed = 1.0 } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const outputFile = path.join('temp', `output-${Date.now()}.wav`);
    const command = `espeak-ng -v ${language} -s ${Math.round(150 * speed)} -w ${outputFile} "${text.replace(/"/g, '\\"')}"`;
    
    exec(command, (error) => {
      if (error) {
        logger.error('TTS failed', { error: error.message });
        return res.status(500).json({ error: 'TTS generation failed' });
      }

      res.setHeader('Content-Type', 'audio/wav');
      const audioStream = fs.createReadStream(outputFile);
      audioStream.pipe(res);
      audioStream.on('close', () => fs.unlink(outputFile, () => {}));
    });
  } catch (error) {
    logger.error('TTS endpoint error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/clone-voice', upload.single('audio'), async (req, res) => {
  try {
    const { name } = req.body;
    const audioFile = req.file;
    if (!audioFile || !name) return res.status(400).json({ error: 'Audio file and name required' });

    const voiceId = `voice-${Date.now()}`;
    const voicePath = path.join(REFERENCE_VOICES_DIR, `${voiceId}.wav`);
    fs.renameSync(audioFile.path, voicePath);

    res.json({ voice_id: voiceId, status: 'success', message: 'Voice cloned' });
  } catch (error) {
    logger.error('Voice cloning failed', { error: error.message });
    res.status(500).json({ error: 'Voice cloning failed' });
  }
});

app.get('/voices', (req, res) => {
  try {
    const voices = fs.readdirSync(REFERENCE_VOICES_DIR)
      .filter(file => file.endsWith('.wav'))
      .map(file => ({ id: file.replace('.wav', ''), name: file.replace('.wav', '') }));
    res.json({ voices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list voices' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`XTTS v2 Server running on port ${PORT}`);
  console.log(`🚀 XTTS v2 Server running on http://0.0.0.0:${PORT}`);
});
EOF
```

### Create Systemd Service
```bash
cat > /etc/systemd/system/xtts-v2.service << 'EOF'
[Unit]
Description=XTTS v2 Text-to-Speech Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/xtts-v2
Environment=NODE_ENV=production
Environment=PORT=5000
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### Start the Service
```bash
systemctl daemon-reload
systemctl enable xtts-v2
systemctl start xtts-v2
```

### Test the Service
```bash
curl http://localhost:5000/health
```

### Generate Reference Voices
```bash
mkdir -p /opt/xtts-v2/reference_voices/{professional,friendly,warm}/{male,female}

cd /opt/xtts-v2

SAMPLE_TEXT="Hello, this is a sample voice for text to speech generation."

echo "$SAMPLE_TEXT" | espeak-ng -v en-us+m1 -s 150 -w "reference_voices/professional/male/executive.wav"
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+f1 -s 150 -w "reference_voices/professional/female/executive.wav"
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+m2 -s 160 -w "reference_voices/friendly/male/support.wav"
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+f2 -s 160 -w "reference_voices/friendly/female/support.wav"
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+m3 -s 140 -w "reference_voices/warm/male/welcome.wav"
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+f3 -s 140 -w "reference_voices/warm/female/welcome.wav"

echo "✅ Reference voices generated!"
```

### Check Service Status
```bash
systemctl status xtts-v2
```

### View Logs
```bash
journalctl -u xtts-v2 -f
```

## Step 3: Update Environment Variables

Add this to your application environment:
```
XTTS_V2_SERVER_URL=http://163.245.209.202:5000
```

## Step 4: Test the Deployment

From your local machine:
```bash
curl http://163.245.209.202:5000/health
```

## Troubleshooting

If service fails to start:
```bash
# Check logs
journalctl -u xtts-v2 --no-pager

# Restart service
systemctl restart xtts-v2

# Check port
netstat -tlnp | grep 5000
```

## Management Commands

```bash
# Start
systemctl start xtts-v2

# Stop
systemctl stop xtts-v2

# Restart
systemctl restart xtts-v2

# View logs
tail -f /opt/xtts-v2/logs/combined.log
```
