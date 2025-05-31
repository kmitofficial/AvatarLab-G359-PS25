from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
from datetime import datetime
from TTS.tts.configs.xtts_config import XttsConfig, XttsAudioConfig
from TTS.tts.models.xtts import XttsArgs
from TTS.config.shared_configs import BaseDatasetConfig
from TTS.api import TTS
from contextlib import asynccontextmanager
import torch
if not hasattr(torch.serialization, "add_safe_globals"):
    def add_safe_globals(*args, **kwargs):
        pass  # Dummy fallback
else:
    from torch.serialization import add_safe_globals
# ── PyTorch ≥2.6 pickle fix ─────────────────────────────────────────────────
add_safe_globals([XttsConfig, XttsAudioConfig, XttsArgs, BaseDatasetConfig])
# ───────────────────────────────────────────────────────────────────────────

# Directories to store uploaded and output files
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the TTS model
    app.state.tts = TTS(
        model_name="tts_models/multilingual/multi-dataset/xtts_v2",
        progress_bar=False,
        gpu=False
    )
    yield
    # Shutdown: Perform any necessary cleanup here

# FastAPI app initialization with lifespan
app = FastAPI(lifespan=lifespan)

@app.post("/synthesize/")
async def synthesize_speech(
    text: str = Form(...),
    language: str = Form(...),
    speaker_wav: UploadFile = File(...),
):
    try:
        # Save the speaker's audio file
        timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
        speaker_filename = f"{timestamp}_{speaker_wav.filename}"
        speaker_path = os.path.join(UPLOAD_DIR, speaker_filename)
        with open(speaker_path, "wb") as f:
            f.write(await speaker_wav.read())

        # Generate speech output
        output_filename = f"{timestamp}_synthesized.wav"
        out_file = os.path.join(OUTPUT_DIR, output_filename)
        app.state.tts.tts_to_file(
            text=text,
            speaker_wav=speaker_path,
            language=language,
            file_path=out_file
        )

        # Return the generated audio file as a response
        return FileResponse(out_file, media_type="audio/wav", filename=os.path.basename(out_file))

    except Exception as e:
        # Raise an HTTP exception in case of an error
        raise HTTPException(status_code=500, detail=f"Error during synthesis: {str(e)}")
