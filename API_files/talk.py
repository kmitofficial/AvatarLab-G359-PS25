from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
import subprocess
import sys
import glob
from datetime import datetime
import shutil

app = FastAPI()

# Path to this file’s folder
BASE = os.path.dirname(__file__)
# Full path to inference.py inside the SadTalker subfolder
INFER = os.path.join(BASE, "SadTalker", "inference.py")

DEFAULT_EYEBLINK_PATH = os.path.join(BASE, "..", "ref_eyeblink.mp4")
DEFAULT_POSE_PATH = os.path.join(BASE, "..", "ref_eyeblink.mp4")

@app.post("/generate/")
async def generate_video(
    image: UploadFile = File(...),
    driven_audio: UploadFile = File(...),
    ref_eyeblink: UploadFile = File(None),
    ref_pose: UploadFile = File(None)
):
    # 1) prepare input/output folders
    input_dir = os.path.join(BASE, "inputs_api")
    output_dir = os.path.join(BASE, "outputs_api")
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    def short_id():
        return uuid.uuid4().hex[:8]

    # 2) save the uploaded files
    image_path = os.path.join(input_dir, f"{short_id()}_{image.filename}")
    audio_path = os.path.join(input_dir, f"{short_id()}_{driven_audio.filename}")

    with open(image_path, "wb") as f:
        f.write(await image.read())
    with open(audio_path, "wb") as f:
        f.write(await driven_audio.read())

    # Save or use default ref_eyeblink
    if ref_eyeblink:
        eye_path = os.path.join(input_dir, f"eye_{short_id()}_{ref_eyeblink.filename}")
        with open(eye_path, "wb") as f:
            f.write(await ref_eyeblink.read())
    else:
        eye_path = os.path.join(input_dir, os.path.basename(DEFAULT_EYEBLINK_PATH))
        shutil.copy(DEFAULT_EYEBLINK_PATH, eye_path)

    # Save or use default ref_pose
    if ref_pose:
        pose_path = os.path.join(input_dir, f"pose_{short_id()}_{ref_pose.filename}")
        with open(pose_path, "wb") as f:
            f.write(await ref_pose.read())
    else:
        pose_path = os.path.join(input_dir, os.path.basename(DEFAULT_POSE_PATH))
        shutil.copy(DEFAULT_POSE_PATH, pose_path)

    timestamp = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")

    # 3) set up a results folder for this run
    result_dir = os.path.join(output_dir, f"{timestamp}_result")
    os.makedirs(result_dir, exist_ok=True)

    # 4) build the subprocess command, using sys.executable so it uses the same venv
    # FIX #1: pass "False" as a string, not Python bool
    command = [
        sys.executable, INFER,
        "--driven_audio", audio_path,
        "--source_image", image_path,
        "--ref_eyeblink", eye_path,
        "--ref_pose", pose_path,                # FIX #2: pass pose_path explicitly as argument
        "--result_dir", result_dir,
        "--preprocess", "full",
        "--still",                       # FIX #1 applied here
        "--expression_scale", "1.0",
        "--pose_style", "1",
        "--enhancer", "gfpgan"
    ]

    # 5) run inference.py inside its own folder
    try:
        subprocess.run(
            command,
            check=True,
            cwd=os.path.join(BASE, "SadTalker")
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

    # 6) find and return the .mp4 file (directly in result_dir)
    all_mp4_files_in_dir = glob.glob(os.path.join(result_dir, '*.mp4'))

    if not all_mp4_files_in_dir:
        dir_contents = os.listdir(result_dir) if os.path.exists(result_dir) else "result_dir does not exist or is empty"
        raise HTTPException(status_code=500, detail=f"No .mp4 video generated in result_dir: {result_dir}. Contents: {dir_contents}")

    path_to_enhanced_video = None
    path_to_blurry_video = None

    for f_path in all_mp4_files_in_dir:
        filename = os.path.basename(f_path)
        if filename.endswith("_enhanced.mp4"):
            path_to_enhanced_video = f_path
            break
        else:
            if path_to_blurry_video is None:
                path_to_blurry_video = f_path

    if path_to_enhanced_video and os.path.exists(path_to_enhanced_video):
        return FileResponse(
            path_to_enhanced_video,
            media_type="video/mp4",
            filename=os.path.basename(path_to_enhanced_video)
        )
    elif path_to_blurry_video and os.path.exists(path_to_blurry_video):
        return FileResponse(
            path_to_blurry_video,
            media_type="video/mp4",
            filename=os.path.basename(path_to_blurry_video)
        )
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Could not find the enhanced or fallback video in {result_dir}."
        )
