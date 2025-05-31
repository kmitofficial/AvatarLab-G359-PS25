from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
import uuid
import requests
from datetime import datetime

app = FastAPI()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Serve the outputs folder as static files at /outputs URL path
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# Correct API URLs
TTS_API_URL = "http://127.0.0.1:8001/synthesize/"  # main.py
SAD_API_URL = "http://127.0.0.1:8002/generate/"    # talk.py

@app.post("/process/")
async def process_input(
    text: str = Form(...),
    language: str = Form("en"),
    speaker_wav: UploadFile = File(...),
    image: UploadFile = File(...),
    ref_eyeblink: UploadFile = File(...),
):
    try:
        print("===> Received request for processing")
        timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")

        # Save the speaker's audio file
        speaker_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{speaker_wav.filename}")
        with open(speaker_path, "wb") as f:
            f.write(await speaker_wav.read())
        print(f"===> Speaker audio saved to {speaker_path}")

        # Save the image file
        image_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{image.filename}")
        with open(image_path, "wb") as f:
            f.write(await image.read())
        print(f"===> Image saved to {image_path}")

        # Save the eye file
        eye_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{ref_eyeblink.filename}")
        with open(eye_path, "wb") as f:
            f.write(await ref_eyeblink.read())
        print(f"===> Eye saved to {eye_path}")

        # Prepare data for TTS API
        print("===> Sending input to TTS API")
        with open(speaker_path, "rb") as speaker_file:
            tts_data = {
                "text": (None, text),
                "language": (None, language),
                "speaker_wav": (speaker_wav.filename, speaker_file, speaker_wav.content_type)
            }

            # Call TTS API
            tts_response = requests.post(TTS_API_URL, files=tts_data)
        if tts_response.status_code != 200:
            print("!!! TTS synthesis failed")
            raise HTTPException(status_code=500, detail="TTS synthesis failed")

        print("===> Received synthesized audio from TTS")
        audio_path = os.path.join(OUTPUT_DIR, f"{timestamp}_synthesized.wav")
        with open(audio_path, "wb") as f:
            f.write(tts_response.content)
        print(f"===> Synthesized audio saved to {audio_path}")

        # Prepare data for SADTalker API
        print("===> Sending audio and image to SADTalker")
        with open(audio_path, "rb") as audio_file, open(image_path, "rb") as img_file, open(eye_path, "rb") as eye_file:
            sad_data = {
                "driven_audio": (os.path.basename(audio_path), audio_file, "audio/wav"),
                "image": (os.path.basename(image_path), img_file, "image/jpeg"),
                "ref_eyeblink": (os.path.basename(eye_path), eye_file, "video/mp4")
            }

            # Call SAD API
            sad_response = requests.post(SAD_API_URL, files=sad_data)
        if sad_response.status_code != 200:
            print("!!! SADTalker video generation failed")
            raise HTTPException(status_code=500, detail="SADTalker video generation failed")

        print("===> Received video from SADTalker")
        video_filename = f"{timestamp}_generated.mp4"
        video_path = os.path.join(OUTPUT_DIR, video_filename)
        with open(video_path, "wb") as f:
            f.write(sad_response.content)
        print(f"===> Generated video saved to {video_path}")

        video_url = f"http://localhost:8000/outputs/{video_filename}"
        print(f"===> Returning video URL to client: {video_url}")

        return {"video_url": video_url}

    except Exception as e:
        print(f"!!! Error during processing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
