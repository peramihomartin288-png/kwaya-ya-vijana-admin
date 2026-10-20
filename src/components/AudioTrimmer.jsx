import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import { uploadToUploadcare } from '../lib/uploadcare';
import '../styles/components/audio-trimmer.css';

export default function AudioTrimmer({ url, initialStart = 0, initialEnd = 0, onTrim, onClose }) {
  const audioRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [playing, setPlaying] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!url || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = url;
    audio.load();

    const onLoaded = () => {
      const dur = audio.duration;
      setDuration(dur);
      setStart(initialStart || 0);
      setEnd(initialEnd || dur);
      setReady(true);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime >= end) {
        audio.pause();
        setPlaying(false);
        audio.currentTime = start;
      }
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.pause();
      audio.src = '';
    };
  }, [url, initialStart, initialEnd, end, start]);

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function handlePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (audio.currentTime < start || audio.currentTime >= end) {
        audio.currentTime = start;
      }
      audio.play();
      setPlaying(true);
    }
  }

  function handleSeek(e) {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(start * sampleRate);
      const endSample = Math.floor(end * sampleRate);
      const frameCount = endSample - startSample;

      const newBuffer = audioCtx.createBuffer(audioBuffer.numberOfChannels, frameCount, sampleRate);
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        newBuffer.copyToChannel(channelData.subarray(startSample, endSample), i);
      }

      const wavBlob = audioBufferToWav(newBuffer);
      const file = new File([wavBlob], `trimmed_${Date.now()}.wav`, { type: 'audio/wav' });
      
      const newUrl = await uploadToUploadcare(file);
      
      onTrim?.({ url: newUrl, start: 0, end: duration: end - start });
      onClose?.();
      alert('Wimbo umekatwa na kupakiwa ✅');
    } catch (e) {
      alert('Kosa la kukata: ' + e.message);
    }
    setSaving(false);
  }

  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    let pos = 0;
    function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }
    
    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numChannels);
    setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numChannels);
    setUint16(numChannels * 2); setUint16(16);
    setUint32(0x61746164); setUint32(length - pos - 4);
    
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        let sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        out.setInt16(pos, sample, true); pos += 2;
      }
    }
    return new Blob([out], { type: 'audio/wav' });
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const startPct = duration > 0 ? (start / duration) * 100 : 0;
  const endPct = duration > 0 ? (end / duration) * 100 : 100;

  return (
    <div className="audio-trimmer" style={{ background: 'var(--color-card)', padding: 16, borderRadius: 8, marginTop: 12 }}>
      <audio ref={audioRef} preload="metadata" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div style={{ position: 'relative', height: 40, background: '#333', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, #444)' }}></div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${startPct}%`, width: `${endPct - startPct}%`, background: 'rgba(147, 51, 234, 0.4)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${progress}%`, width: 2, background: '#fff', zIndex: 2 }}></div>
        <input type="range" min={0} max={duration || 100} step={0.1} value={currentTime} onChange={handleSeek} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 3, width: '100%' }} />
      </div>

      {ready && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Anza (Start)</span> <span>{formatTime(start)}</span>
            </label>
            <input type="range" min={0} max={duration} step={0.1} value={start} onChange={(e) => { const v = parseFloat(e.target.value); if (v < end) setStart(v); }} />

            <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span>Mwisho (End)</span> <span>{formatTime(end)}</span>
            </label>
            <input type="range" min={0} max={duration} step={0.1} value={end} onChange={(e) => { const v = parseFloat(e.target.value); if (v > start) setEnd(v); }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handlePlay} style={{ flex: 1 }}>
              {playing ? '⏸ Simamisha' : '▶️ Sikiliza'}
            </Button>
            <Button onClick={handleSave} style={{ flex: 1, background: 'var(--color-primary)' }} disabled={saving}>
              {saving ? '⏳ Inakata...' : '✂️ Kata na Hifadhi'}
            </Button>
            <Button onClick={onClose} style={{ background: 'transparent', border: '1px solid #555' }}>
              ✕
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
