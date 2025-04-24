import librosa
import soundfile as sf

input_file =r"C:\xtts_finetune\reference_wav\clip_00072.wav"
output_file =r"C:/xtts_finetune/reference_wav/24khz_file.wav"
target_sr = 24000

# Load the audio file
y, sr = librosa.load(input_file, sr=None) # Load with original sample rate

# Resample to the target sample rate
y_resampled = librosa.resample(y, orig_sr=sr, target_sr=target_sr)

# Save the resampled audio
sf.write(output_file, y_resampled, target_sr)

print(f"Resampled audio saved to: {output_file}")

audio_path =r"C:/xtts_finetune/reference_wav/24khz_file.wav"# Replace with your actual path

try:
    y, sr = librosa.load(audio_path, sr=None) # Load with original sample rate
    print(f"The sample rate of {audio_path} is: {sr} Hz")
except Exception as e:
    print(f"Error reading audio file: {e}")