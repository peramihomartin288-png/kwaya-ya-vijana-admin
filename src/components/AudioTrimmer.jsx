import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import Button from './Button';
import '../styles/components/audio-trimmer.css';

export default function AudioTrimmer({ url, initialStart = 0, initialEnd = 0, onTrim, onClose }) {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const regionsRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4c1d95',
      progressColor: '#9333ea',
      cursorColor: '#fff',
      height: 80,
      plugins: [regions],
    });
    wsRef.current = ws;

    ws.load(url);

    ws.on('ready', () => {
      const dur = ws.getDuration();
      setDuration(dur);
      const s = initialStart || 0;
      const e = initialEnd || dur;
      setStart(s);
      setEnd(e);

      regions.addRegion({
        start: s, end: e,
        color: 'rgba(147, 51, 234, 0.3)',
        drag: true, resize: true, id: 'trim',
      });

      setReady(true);
    });

    regions.on('region-updated', (region) => {
      setStart(region.start);
      setEnd(region.end);
    });

    return () => { ws.destroy(); };
  }, [url]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function handlePlay() {
    const ws = wsRef.current;
    const region = regionsRef.current?.getRegions()[0];
    if (!ws || !region) return;
    ws.play(region.start, region.end);
  }

  function handleReset() {
    setStart(0);
    setEnd(duration);
    const region = regionsRef.current?.getRegions()[0];
    if (region) region.setOptions({ start: 0, end: duration });
  }

  function handleSave() {
    onTrim?.({ url, start, end, duration: end - start });
    onClose?.();
  }

  return (
    <div className="audio-trimmer">
      <div ref={containerRef} className="audio-wave"></div>

      {ready && (
        <>
          <div className="audio-times">
            <span>Anza: {formatTime(start)}</span>
            <span>Mwisho: {formatTime(end)}</span>
            <span>Urefu: {formatTime(end - start)}</span>
          </div>

          <div className="audio-actions">
            <Button size="sm" variant="secondary" onClick={handlePlay}>▶️ Sikiliza</Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>↺ Reset</Button>
            <Button size="sm" variant="ghost" onClick={onClose}>Ghairi</Button>
            <Button size="sm" onClick={handleSave}>Hifadhi Trim</Button>
          </div>
        </>
      )}
    </div>
  );
}
