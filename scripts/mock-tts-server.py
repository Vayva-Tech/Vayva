from fastapi import FastAPI, Response
from pydantic import BaseModel
import subprocess
import tempfile
import os

app = FastAPI(title="Mock Qwen3-TTS Service")

class TTSRequest(BaseModel):
    text: str
    language: str = "Auto"
    speaker: str = "Vivian"
    instruct: str = None
    speed: float = 1.0

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        # Create temporary file for audio output
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            temp_filename = tmp_file.name
        
        # Use macOS say command for TTS (built-in system TTS)
        voice_map = {
            "Vivian": "Victoria",  # Female voice
            "Alex": "Alex",        # Male voice  
            "Emma": "Samantha"     # Female voice
        }
        
        voice = voice_map.get(request.speaker, "Victoria")
        speed = request.speed * 200  # say command uses words per minute (default ~175)
        
        # Generate speech using system TTS
        cmd = [
            "say",
            "-v", voice,
            "-r", str(int(speed)),
            "-o", temp_filename,
            request.text
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"TTS generation failed: {result.stderr}")
        
        # Read the generated audio file
        with open(temp_filename, 'rb') as f:
            audio_data = f.read()
        
        # Clean up temporary file
        os.unlink(temp_filename)
        
        # Return audio file
        return Response(
            content=audio_data,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=speech.wav"
            }
        )
        
    except Exception as e:
        print(f"Error generating speech: {e}")
        # Return a simple beep sound as fallback
        return Response(
            content=b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00",
            media_type="audio/wav"
        )

@app.get("/")
async def root():
    return {
        "message": "Mock Qwen3-TTS Service Running",
        "voices": ["Vivian", "Alex", "Emma"],
        "languages": ["English", "Chinese", "Auto"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)