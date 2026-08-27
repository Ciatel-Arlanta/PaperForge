import math
import struct
import wave
import os

OUTPUT_DIR = "public/audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "soundtrack.wav")

SAMPLE_RATE = 44100
DURATION = 26.0  # seconds
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

# Chord progression in Hz (F minor -> Db major -> Ab major -> Eb major)
CHORDS = [
    # Fm (F3, Ab3, C4, Eb4)
    [174.61, 207.65, 261.63, 311.13],
    # Db (Db3, F3, Ab3, C4)
    [138.59, 174.61, 207.65, 261.63],
    # Ab (Ab3, C4, Eb4, G4)
    [207.65, 261.63, 311.13, 392.00],
    # Eb (Eb3, G3, Bb3, D4)
    [155.56, 196.00, 233.08, 293.66],
]

BASS_NOTES = [87.31, 69.30, 103.83, 77.78]  # F2, Db2, Ab2, Eb2
BPM = 120.0
BEAT_DUR = 60.0 / BPM  # 0.5s per beat
CHORD_DUR = 4.0 * BEAT_DUR  # 2.0s per chord

def generate_audio():
    samples_left = [0.0] * TOTAL_SAMPLES
    samples_right = [0.0] * TOTAL_SAMPLES

    for i in range(TOTAL_SAMPLES):
        t = i / SAMPLE_RATE
        
        # Overall master envelope (fade in 0-1s, fade out 23-25.5s)
        master_env = 1.0
        if t < 1.0:
            master_env = t / 1.0
        elif t > 23.0:
            master_env = max(0.0, 1.0 - (t - 23.0) / 2.5)

        # Active chord index
        chord_idx = int(t / CHORD_DUR) % len(CHORDS)
        chord = CHORDS[chord_idx]
        bass_freq = BASS_NOTES[chord_idx]

        # 1. Warm Sub & Mid Bass
        bass_phase = 2.0 * math.pi * bass_freq * t
        bass_osc = math.sin(bass_phase) * 0.5 + math.sin(bass_phase * 2.0) * 0.2
        # Slight sidechain pumping on each beat
        beat_phase = (t % BEAT_DUR) / BEAT_DUR
        pump = 0.6 + 0.4 * math.sin(beat_phase * math.pi)
        bass_val = bass_osc * pump * 0.35

        # 2. Lush Ambient Polyphonic Pad (detuned stereo spread)
        pad_l = 0.0
        pad_r = 0.0
        for f in chord:
            # Left oscillator (slightly detuned down)
            pad_l += math.sin(2.0 * math.pi * (f * 0.997) * t) * 0.06
            pad_l += (math.sin(2.0 * math.pi * (f * 2.0) * t) * 0.02)
            # Right oscillator (slightly detuned up)
            pad_r += math.sin(2.0 * math.pi * (f * 1.003) * t) * 0.06
            pad_r += (math.sin(2.0 * math.pi * (f * 2.0) * t) * 0.02)

        # 3. Crystal 16th-note Arpeggiator
        step_dur = BEAT_DUR / 4.0  # 0.125s per 16th note
        step_idx = int(t / step_dur) % 8
        arp_note = chord[step_idx % len(chord)] * 2.0  # One octave up
        arp_phase = (t % step_dur) / step_dur
        arp_env = math.exp(-arp_phase * 12.0)  # Plucky envelope
        arp_val = math.sin(2.0 * math.pi * arp_note * t) * arp_env * 0.12
        # Panning ping-pong
        arp_pan = math.sin(t * 8.0) * 0.5 + 0.5
        arp_l = arp_val * (1.0 - arp_pan)
        arp_r = arp_val * arp_pan

        # 4. Cinematic Risers & Transitions at Scene Cut Points (t = 0, 5, 10, 16, 21.5)
        sfx_val = 0.0
        for transition_t in [0.0, 5.0, 10.0, 15.5, 21.5]:
            dt = t - transition_t
            if 0.0 <= dt < 1.2:
                # High tech shimmer / chime
                shimmer = math.sin(2.0 * math.pi * (1200.0 - dt * 400.0) * dt) * math.exp(-dt * 3.0) * 0.08
                sfx_val += shimmer

        # Mix channels
        mix_l = (bass_val + pad_l + arp_l + sfx_val) * master_env
        mix_r = (bass_val + pad_r + arp_r + sfx_val) * master_env

        # Soft limiter / saturation
        mix_l = math.tanh(mix_l * 1.4) * 0.85
        mix_r = math.tanh(mix_r * 1.4) * 0.85

        samples_left[i] = mix_l
        samples_right[i] = mix_r

    # Write 16-bit stereo WAV
    with wave.open(OUTPUT_FILE, "w") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        
        frames = bytearray()
        for i in range(TOTAL_SAMPLES):
            int_l = int(max(-32767, min(32767, samples_left[i] * 32767)))
            int_r = int(max(-32767, min(32767, samples_right[i] * 32767)))
            frames.extend(struct.pack("<hh", int_l, int_r))
            
        wav_file.writeframes(frames)
    
    print(f"Generated soundtrack saved to: {OUTPUT_FILE} ({os.path.getsize(OUTPUT_FILE)} bytes)")

if __name__ == "__main__":
    generate_audio()
