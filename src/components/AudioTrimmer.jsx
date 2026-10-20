import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import '../styles/components/audio-trimmer.css';

export default function AudioTrimmer({ url, initialStart = 0, initialEnd = 0, onTrim, onClose }) {
  const audioRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!url || !audioRef.current) return;
    
    const audio = audioRef.current;
    audio.src = url;
    audio.load();

    const onLoaded = () => {
      const dur = audio.duration;
      setDuration(dur);
      const s = initialStart || 0;
      const e = initialEnd || dur;
      setStart(s);
      setEnd(e);
      setReady(true);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Simulate region playback
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

  function handleStartChange(e) {
    const val = parseFloat(e.target.value);
    if (val < end) setStart(val);
  }

  function handleEndChange(e) {
    const val = parseFloat(e.target.value);
    if (val > start) setEnd(val);
  }

  function handleSave() {
    onTrim?.({ url, start, end, duration: end - start });
    onClose?.();
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
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, #444)' }}></div>
        
        {/* Selected Region */}
        <div style={{ 
          position: 'absolute', top: 0, bottom: 0, 
          left: `${startPct}%`, width: `${endPct - startPct}%`, 
          background: 'rgba(147, 51, 234, 0.4)', zIndex: 1 
        }}></div>

        {/* Progress cursor */}
        <div style={{ 
          position: 'absolute', top: 0, bottom: 0, 
          left: `${progress}%`, width: 2, background: '#fff', zIndex: 2 
        }}></div>
        
        {/* Invisible range for seeking */}
        <input 
          type="range" min={0} max={duration || 100} step={0.1} value={currentTime} 
          onChange={handleSeek} 
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 3, width: '100%' }} 
        />
      </div>

      {ready && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Anza (Start)</span> <span>{formatTime(start)}</span>
            </label>
            <input type="range" min={0} max={duration} step={0.1} value={start} onChange={handleStartChange} />

            <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span>Mwisho (End)</span> <span>{formatTime(end)}</span>
            </label>
            <input type="range" min={0} max={duration} step={0.1} value={end} onChange={handleEndChange} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handlePlay} style={{ flex: 1 }}>
              {playing ? '⏸ Simamisha' : '▶️ Sikiliza'}
            </Button>
            <Button onClick={handleSave} style={{ flex: 1, background: 'var(--color-primary)' }}>
              ✅ Hifadhi
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
