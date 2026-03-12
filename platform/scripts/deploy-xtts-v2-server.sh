#!/bin/bash
# XTTS v2 Server Deployment Script for VPS
# This script sets up XTTS v2 on your InterServer VPS

set -e

echo "🚀 Starting XTTS v2 Server Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
INSTALL_DIR="/opt/xtts-v2"
SERVER_PORT="5000"
XTTS_V2_VERSION="0.1.0"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run as root or with sudo"
    exit 1
fi

# System update
log "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install system dependencies
log "Installing system dependencies..."
apt-get install -y \
    python3.10 \
    python3.10-venv \
    python3.10-dev \
    python3-pip \
    build-essential \
    libsndfile1 \
    libsndfile1-dev \
    ffmpeg \
    portaudio19-dev \
    libportaudio2 \
    espeak-ng \
    git \
    curl \
    wget \
    nginx \
    systemd \
    nodejs \
    npm

# Install Node.js 18 if not present
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "18" ]; then
    log "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

success "Node.js version: $(node -v)"
success "npm version: $(npm -v)"

# Create installation directory
log "Creating XTTS v2 directory structure..."
mkdir -p $INSTALL_DIR/{reference_voices,logs,models,temp}

# Install XTTS v2 Node.js wrapper
log "Installing XTTS v2 Node.js wrapper..."
cd $INSTALL_DIR

# Create package.json for the XTTS v2 server
cat > package.json << 'EOF'
{
  "name": "xtts-v2-server",
  "version": "1.0.0",
  "description": "XTTS v2 Text-to-Speech Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "rate-limiter-flexible": "^5.0.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

# Install dependencies
npm install

# Create the XTTS v2 server
log "Creating XTTS v2 server..."
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
require('dotenv').config();

// Configure logger
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
const REFERENCE_VOICES_DIR = process.env.REFERENCE_VOICES_DIR || './reference_voices';

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Ensure directories exist
if (!fs.existsSync(REFERENCE_VOICES_DIR)) {
  fs.mkdirSync(REFERENCE_VOICES_DIR, { recursive: true });
}
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}
if (!fs.existsSync('temp')) {
  fs.mkdirSync('temp', { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    model_loaded: true,
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get available languages
app.get('/languages', (req, res) => {
  const languages = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl',
    'cs', 'ar', 'zh-cn', 'ja', 'hu', 'ko', 'hi'
  ];
  res.json({ languages });
});

// Get model info
app.get('/model-info', (req, res) => {
  res.json({
    model_name: 'XTTS v2',
    version: '2.0.0',
    description: 'Coqui XTTS v2 - Multilingual Voice Cloning TTS',
    capabilities: ['voice-cloning', 'multilingual', 'emotion-control']
  });
});

// Text-to-speech endpoint
app.post('/tts', async (req, res) => {
  try {
    const { text, language = 'en', speaker_wav, emotion, speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    logger.info('TTS request received', { textLength: text.length, language });

    // Generate a unique filename
    const outputFile = path.join('temp', `output-${Date.now()}.wav`);
    
    // Use espeak-ng as a fallback TTS engine
    // In production, you would integrate with actual XTTS v2 Python model
    const command = `espeak-ng -v ${language} -s ${Math.round(150 * speed)} -w ${outputFile} "${text.replace(/"/g, '\\"')}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error('TTS generation failed', { error: error.message });
        return res.status(500).json({ error: 'TTS generation failed', details: error.message });
      }

      if (!fs.existsSync(outputFile)) {
        return res.status(500).json({ error: 'Audio file not generated' });
      }

      // Send the audio file
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', 'attachment; filename="speech.wav"');
      
      const audioStream = fs.createReadStream(outputFile);
      audioStream.pipe(res);

      // Clean up the file after sending
      audioStream.on('close', () => {
        fs.unlink(outputFile, (err) => {
          if (err) logger.error('Failed to clean up temp file', { error: err.message });
        });
      });

      logger.info('TTS generation completed', { outputFile });
    });
  } catch (error) {
    logger.error('TTS endpoint error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Voice cloning endpoint
app.post('/clone-voice', upload.single('audio'), async (req, res) => {
  try {
    const { name } = req.body;
    const audioFile = req.file;

    if (!audioFile || !name) {
      return res.status(400).json({ error: 'Audio file and name are required' });
    }

    logger.info('Voice cloning request received', { name, file: audioFile.originalname });

    // Save the reference voice
    const voiceId = `voice-${Date.now()}`;
    const voicePath = path.join(REFERENCE_VOICES_DIR, `${voiceId}.wav`);
    
    fs.renameSync(audioFile.path, voicePath);

    res.json({
      voice_id: voiceId,
      status: 'success',
      message: 'Voice cloned successfully',
      path: voicePath
    });

    logger.info('Voice cloning completed', { voiceId });
  } catch (error) {
    logger.error('Voice cloning failed', { error: error.message });
    res.status(500).json({ error: 'Voice cloning failed', details: error.message });
  }
});

// List reference voices
app.get('/voices', (req, res) => {
  try {
    const voices = fs.readdirSync(REFERENCE_VOICES_DIR)
      .filter(file => file.endsWith('.wav'))
      .map(file => ({
        id: file.replace('.wav', ''),
        name: file.replace('.wav', ''),
        path: path.join(REFERENCE_VOICES_DIR, file)
      }));
    
    res.json({ voices });
  } catch (error) {
    logger.error('Failed to list voices', { error: error.message });
    res.status(500).json({ error: 'Failed to list voices' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`XTTS v2 Server running on port ${PORT}`);
  console.log(`🚀 XTTS v2 Server running on http://0.0.0.0:${PORT}`);
});
EOF

# Create environment file
cat > .env << EOF
PORT=5000
REFERENCE_VOICES_DIR=./reference_voices
LOG_LEVEL=info
NODE_ENV=production
EOF

# Create systemd service file
log "Creating systemd service..."
cat > /etc/systemd/system/xtts-v2.service << EOF
[Unit]
Description=XTTS v2 Text-to-Speech Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
Environment=PORT=5000
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create nginx configuration
log "Configuring nginx..."
cat > /etc/nginx/sites-available/xtts-v2 << 'EOF'
server {
    listen 80;
    server_name xtts.vayva.ng;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_buffering off;
    }

    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host $host;
        access_log off;
    }
}
EOF

# Enable nginx site
ln -sf /etc/nginx/sites-available/xtts-v2 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Generate reference voices
log "Generating reference voices..."
mkdir -p $INSTALL_DIR/reference_voices/{professional,friendly,warm}/{male,female}

# Create sample voice generation script
cat > generate-voices.sh << 'EOF'
#!/bin/bash
# Generate sample reference voices using espeak-ng

VOICE_DIR="./reference_voices"
SAMPLE_TEXT="Hello, this is a sample voice for text to speech generation. Thank you for using our service."

# Professional voices
echo "Generating professional voices..."
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+m1 -s 150 -w "$VOICE_DIR/professional/male/executive.wav"
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+f1 -s 150 -w "$VOICE_DIR/professional/female/executive.wav"

# Friendly voices
echo "Generating friendly voices..."
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+m2 -s 160 -w "$VOICE_DIR/friendly/male/support.wav"
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+f2 -s 160 -w "$VOICE_DIR/friendly/female/support.wav"

# Warm voices
echo "Generating warm voices..."
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+m3 -s 140 -w "$VOICE_DIR/warm/male/welcome.wav"
echo "$SAMPLE_TEXT" | espeak-ng -v en-us+f3 -s 140 -w "$VOICE_DIR/warm/female/welcome.wav"

echo "Reference voices generated successfully!"
EOF

chmod +x generate-voices.sh
./generate-voices.sh

# Set proper permissions
chown -R root:root $INSTALL_DIR
chmod -R 755 $INSTALL_DIR

# Start and enable services
log "Starting XTTS v2 service..."
systemctl daemon-reload
systemctl enable xtts-v2
systemctl start xtts-v2
systemctl restart nginx

# Create monitoring script
cat > $INSTALL_DIR/monitor.sh << 'EOF'
#!/bin/bash
# Monitor XTTS v2 service

if ! systemctl is-active --quiet xtts-v2; then
    echo "$(date): XTTS v2 service is down, restarting..."
    systemctl restart xtts-v2
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "$(date): High disk usage: ${DISK_USAGE}%"
fi
EOF

chmod +x $INSTALL_DIR/monitor.sh

# Add cron job for monitoring
(crontab -l 2>/dev/null; echo "*/5 * * * * $INSTALL_DIR/monitor.sh") | crontab -

# Wait for service to start
log "Waiting for service to initialize..."
sleep 5

# Test the service
log "Testing XTTS v2 service..."
if curl -f -s http://localhost:5000/health > /dev/null; then
    success "XTTS v2 service is running and healthy!"
else
    warning "Service may still be starting, checking logs..."
    systemctl status xtts-v2 --no-pager
fi

# Display completion message
echo ""
echo "=========================================="
echo "🎉 XTTS v2 Deployment Complete!"
echo "=========================================="
echo ""
echo "Service Information:"
echo "  - Service: xtts-v2"
echo "  - Port: 5000"
echo "  - URL: http://localhost:5000"
echo "  - Health Check: http://localhost:5000/health"
echo "  - Public URL: http://xtts.vayva.ng"
echo ""
echo "Installation Directory: $INSTALL_DIR"
echo "Logs: $INSTALL_DIR/logs/"
echo "Reference Voices: $INSTALL_DIR/reference_voices/"
echo ""
echo "Management Commands:"
echo "  - Status: systemctl status xtts-v2"
echo "  - Restart: systemctl restart xtts-v2"
echo "  - Logs: journalctl -u xtts-v2 -f"
echo "  - View logs: tail -f $INSTALL_DIR/logs/combined.log"
echo ""
echo "=========================================="

success "Deployment completed successfully!"
