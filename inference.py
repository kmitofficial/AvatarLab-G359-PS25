# import os
# import torch
# import torchaudio

# from TTS.tts.models.xtts import Xtts
# from TTS.config import load_config
# from TTS.tts.configs.xtts_config import XttsConfig
# from TTS.tts.models.xtts import XttsAudioConfig, XttsArgs
# from TTS.tts.utils.synthesis import synthesis
# from TTS.utils.synthesizer import Synthesizer
# from TTS.vocoder.configs.hifigan_config import HifiganConfig
# from TTS.config.shared_configs import BaseDatasetConfig


# torch.serialization.add_safe_globals([XttsConfig, XttsAudioConfig,XttsArgs,HifiganConfig,BaseDatasetConfig])

# # === SET YOUR LOCAL PATHS HERE ===
# checkpoint_path = r"C:\Users\velis\Downloads\xtts_finetune\xtts_finetune\checkpoints\GPT_XTTS_v2.0_LJSpeech_FT-April-18-2025_11+11AM-0000000\best_model_3795-003.pth"
# reference_wav = r"C:\Users\velis\Downloads\xtts_finetune\xtts_finetune\reference_wav\clip_00072.wav"
# output_path = r"C:\Users\velis\Downloads\xtts_finetune\xtts_finetune\output"
# tokenizer_path = r"C:\Users\velis\Downloads\xtts_finetune\xtts_finetune\checkpoints\XTTS_v2.0_original_model_files\vocab.json"
# dvae_path = r"C:\Users\velis\Downloads\xtts_finetune\xtts_finetune\checkpoints\XTTS_v2.0_original_model_files\dvae.pth"
# mel_stats_path = r"C:\Users\velis\Downloads\xtts_finetune\xtts_finetune\checkpoints\XTTS_v2.0_original_model_files\mel_stats.pth"
# config_path = r"C:\Users\velis\Downloads\xtts_finetune\xtts_finetune\config.json"

# # === Load Config Globally ===
# config=load_config(config_path)


# # === Load Config ===
# xtts_config = XttsConfig()
# xtts_config.load_json(config_path)

# xtts_config.model_args['dvae_checkpoint'] = dvae_path
# xtts_config.model_args['mel_norm_file'] = mel_stats_path
# xtts_config.model_args['tokenizer_file'] = tokenizer_path

# # === Load Fine-Tuned XTTS Model ===
# model = Xtts.init_from_config(xtts_config)

# # model.load_checkpoint(config, checkpoint_path, eval=True)

# try:
#     checkpoint = torch.load(checkpoint_path, map_location='cpu')['model']
#     model.load_state_dict(checkpoint, strict=False)
#     print("Checkpoint loaded successfully (direct load).")
# except Exception as e:
#     print(f"Error loading checkpoint (direct load): {e}")
#     exit()

# model.cpu()  # or model.cpu() if not using GPU

# # === Synthesizer ===
# synthesizer = synthesis(model, config, reference_wav, use_cuda=torch.cuda.is_available())


# # === Input Text and Language
# text = "This is a sample sentence generated using the fine-tuned XTTS model."
# language = "en"

# # === Generate Audio ===
# wav = synthesizer.tts(
#     text=text,
#     speaker_wav=reference_wav,
#     language=language
# )

# # === Save Output
# torchaudio.save(output_path, torch.tensor(wav).unsqueeze(0), 24000)
# print(f"✅ Audio saved to: {output_path}")


import os
import torch
import torchaudio

from TTS.utils.synthesizer import Synthesizer

# === SET YOUR LOCAL PATHS HERE ===
checkpoint_path = os.path.abspath(r"C:/xtts_finetune/checkpoints/GPT_XTTS_v2.0_LJSpeech_FT-April-18-2025_11+11AM-0000000/model.pth")
reference_wav = os.path.abspath(r"C:/xtts_finetune/reference_wav/24khz_file.wav")
output_path = os.path.abspath(r"C:/xtts_finetune/output")
tokenizer_path = os.path.abspath(r"C:/xtts_finetune/checkpoints/XTTS_v2.0_original_model_files/vocab.json")
dvae_path = os.path.abspath(r"C:/xtts_finetune/checkpoints/XTTS_v2.0_original_model_files/dvae.pth")
mel_stats_path = os.path.abspath(r"C:/xtts_finetune/checkpoints/XTTS_v2.0_original_model_files/mel_stats.pth")
config_path = os.path.abspath(r"C:/xtts_finetune/config.json")


# === Initialize the Synthesizer ===
synthesizer = Synthesizer(
    tts_checkpoint=checkpoint_path,
    tts_config_path=config_path,
    vocoder_checkpoint=None,
    vocoder_config=None,
    use_cuda=torch.cuda.is_available(),
    vocab_path=tokenizer_path 
)

# === Input Text and Language
text = "This is a sample sentence generated using the fine-tuned XTTS model."
language = "en"

# === Generate Audio ===
wav = synthesizer.tts(
    text=text,
    speaker_wav=reference_wav,
    language_name=language
)

# === Save Output
output_file = os.path.join(output_path, "generated_audio.wav")
torchaudio.save(output_file, torch.tensor(wav).unsqueeze(0), 24000)
print(f"✅ Audio saved to: {output_file}")