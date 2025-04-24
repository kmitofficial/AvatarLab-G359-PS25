import os
import torch
import torchaudio
from datetime import datetime
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
import logging
import time
logger = logging.getLogger(__name__)
print("Loading model...")
config = XttsConfig()
config.load_json(r"C:\xtts_finetune\checkpoints\GPT_XTTS_v2.0_LJSpeech_FT-April-18-2025_11+11AM-0000000\config.json")
model = Xtts.init_from_config(config)
model.load_checkpoint(config, checkpoint_dir=r"C:\xtts_finetune\checkpoints\GPT_XTTS_v2.0_LJSpeech_FT-April-18-2025_11+11AM-0000000", use_deepspeed=False)
model.cpu()
speakerpath = os.path.abspath(r"C:\xtts_finetune\reference_wav")
phrases = ["I like big butts and I cannot lie, You other brothers can't deny. That when a girl walks in with an itty bitty waist, And a round thing in your face, you get sprung. Wanna pull up tough 'cause you notice that butt was stuffed. Deep in the jeans she's wearin', I'm hooked and I can't stop starin'. Oh, baby, I wanna get with ya, And take your picture, My homeboys tried to warn me, But that butt you got makes Me-me so horny.","X T T S is very sensitive to noise and outlying samples in the dataset."]
print(len(phrases))
#phrase_one = "X T T S is very sensitive to noise and outlying samples in the dataset."
for filename in os.listdir(speakerpath):
    if filename.endswith(".wav"):
        for phrase in phrases:
            start_time = time.time()

            print("Computing speaker latents...")
            full_audio_path = os.path.abspath(os.path.join(speakerpath, filename))  # Full absolute path
            print(f"  > Loading audio from: {full_audio_path}")  # Print the path
            audio_path = [full_audio_path]
            gpt_cond_latent, speaker_embedding = model.get_conditioning_latents(audio_path=audio_path)

            print("Inference...")
            out = model.inference(
            phrase,
            "en",
            gpt_cond_latent, 
            speaker_embedding,
            temperature=0.7, # Add custom parameters here
        )
            now = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            # compute stats
            process_time = time.time() - start_time
            audio_time = len(torch.tensor(out["wav"]).unsqueeze(0) / 24000)
            logger.warning("Processing time: %.3f", process_time)
            logger.warning("Real-time factor: %.3f", process_time / audio_time)
            torchaudio.save(f"{now}-xtts.wav", torch.tensor(out["wav"]).unsqueeze(0), 24000)