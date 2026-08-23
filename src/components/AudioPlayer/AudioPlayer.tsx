import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './AudioPlayer.css';

export type AudioTrack = {
  title: string;
  url: string;
  time: string;
};

const AUDIO_HOST = 'https://thuviennguyenanninh.vn';

export function audioUrl(path: string): string {
  return path.startsWith('http') ? path : `${AUDIO_HOST}${path}`;
}

function formatTime(duration: number) {
  if (!Number.isFinite(duration) || duration < 0) return '00:00';
  const hrs = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);
  const secs = Math.floor(duration % 60);
  const two = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return hrs > 0 ? `${two(hrs)}:${two(mins)}:${two(secs)}` : `${two(mins)}:${two(secs)}`;
}

function parseTime(label: string) {
  const parts = label.split(':').map((p) => parseInt(p, 10));
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

const PAGE_SIZE = 6;

type Props = {
  title: string;
  img: string;
  tracks: AudioTrack[];
};

export default function AudioPlayer({ title, img, tracks }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const shouldPlayRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState<number | null>(null);

  const [volume, setVolume] = useState(1);
  const lastVolume = useRef(1);

  const [visible, setVisible] = useState(() => Math.min(PAGE_SIZE, tracks.length));

  const track = tracks[index];
  const src = useMemo(() => (track ? audioUrl(track.url) : ''), [track]);

  const totalLabel = duration > 0 ? formatTime(duration) : track?.time || '00:00';
  const totalSeconds = duration > 0 ? duration : parseTime(track?.time || '');
  const shownCurrent = seeking ?? current;
  const progressPct = totalSeconds > 0 ? Math.min(100, (shownCurrent / totalSeconds) * 100) : 0;

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !src) return;
    setCurrent(0);
    setDuration(0);
    el.load();
    if (shouldPlayRef.current) {
      el.play().catch(() => setPlaying(false));
    }
  }, [src]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  const select = useCallback((next: number) => {
    shouldPlayRef.current = true;
    setIndex(next);
  }, []);

  const next = useCallback(() => {
    if (!tracks.length) return;
    select((index + 1) % tracks.length);
  }, [index, select, tracks.length]);

  const prev = useCallback(() => {
    if (!tracks.length) return;
    select((index - 1 + tracks.length) % tracks.length);
  }, [index, select, tracks.length]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    shouldPlayRef.current = true;
    if (el.paused) {
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setVolume((v) => {
      if (v > 0) {
        lastVolume.current = v;
        return 0;
      }
      return lastVolume.current || 1;
    });
  }, []);

  const seekTo = useCallback(
    (seconds: number) => {
      const el = audioRef.current;
      if (!el || totalSeconds <= 0) return;
      const clamped = Math.max(0, Math.min(totalSeconds, seconds));
      el.currentTime = clamped;
      setCurrent(clamped);
    },
    [totalSeconds],
  );

  const volumeIcon = volume === 0 ? 'fa-volume-mute' : volume <= 0.5 ? 'fa-volume-down' : 'fa-volume-up';

  return (
    <>
      <div className="audioTab-wrapper">
        <div className="audio-display">
          <div className="audio-thumb">
            <div className="thumb">
              <img src={img} alt={title} />
            </div>
          </div>

          <div className="audio-info">
            <h1 id="player-label" className="audio-info-name">
              {track?.title || title}
            </h1>

            <div className="audio-card">
              <div className="audio-progress">
                <audio
                  ref={audioRef}
                  preload="metadata"
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                  onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={next}
                >
                  <source src={src} type="audio/mpeg" />
                </audio>

                <div className="audio-seek">
                  <div className="audio-time audio-time--current">{formatTime(shownCurrent)}</div>

                  <div className="audio-seek__bar">
                    <div className="audio-seek__track" style={{ width: `${progressPct}%` }} />
                    <input
                      className="audio-seek__input"
                      type="range"
                      min={0}
                      max={totalSeconds || 0}
                      step={0.1}
                      value={shownCurrent}
                      aria-label="Tiến trình phát"
                      onChange={(e) => setSeeking(Number(e.target.value))}
                      onMouseUp={(e) => {
                        seekTo(Number(e.currentTarget.value));
                        setSeeking(null);
                      }}
                      onTouchEnd={(e) => {
                        seekTo(Number(e.currentTarget.value));
                        setSeeking(null);
                      }}
                      onKeyUp={(e) => {
                        seekTo(Number(e.currentTarget.value));
                        setSeeking(null);
                      }}
                    />
                  </div>

                  <div className="audio-time audio-time--track">{totalLabel}</div>
                </div>
              </div>

              <div className="audio-control">
                <div className="audio-navigation">
                  <button
                    type="button"
                    id="playPauseButton"
                    className={`audio-navigation-playPause${playing ? ' audio-navigation-pressing' : ''}`}
                    aria-label={playing ? 'Tạm dừng' : 'Phát'}
                    title={playing ? 'Tạm dừng' : 'Phát'}
                    onClick={togglePlay}
                  >
                    <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="audio-navigation-prev"
                    aria-label="Bài trước"
                    title={title}
                    disabled={tracks.length < 2}
                    onClick={prev}
                  >
                    <i className="fa-solid fa-backward-step" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="audio-navigation-next"
                    aria-label="Bài sau"
                    title={title}
                    disabled={tracks.length < 2}
                    onClick={next}
                  >
                    <i className="fa-solid fa-forward-step" aria-hidden="true" />
                  </button>
                </div>

                <div className="audio-volume">
                  <button
                    type="button"
                    className="audio-volume__btn"
                    aria-pressed={volume === 0}
                    aria-label={volume === 0 ? 'Bật tiếng' : 'Tắt tiếng'}
                    title={volume === 0 ? 'Bật tiếng' : 'Tắt tiếng'}
                    onClick={toggleMute}
                  >
                    <i className={`fa-solid ${volumeIcon}`} aria-hidden="true" />
                  </button>

                  <input
                    id="audio-range"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    aria-label="Âm lượng"
                    style={{ '--value': `${volume * 100}%` } as React.CSSProperties}
                    onChange={(e) => setVolume(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tracks.length > 0 && (
        <div className="audioList-wrapper">
          <div className="audioList">
            <h2 className="audioList__tt">
              Mục lục sách nói
              <span className="audioList__count">{tracks.length} phần</span>
            </h2>

            <div className="list-audioItem">
              {tracks.slice(0, visible).map((t, i) => (
                <div
                  key={`${t.url}-${i}`}
                  className={`playlist-title block${i === index ? ' playAudio' : ''}`}
                  role="button"
                  tabIndex={0}
                  title={t.title}
                  onClick={() => select(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      select(i);
                    }
                  }}
                >
                  <div className="left">
                    <div className="icon">
                      <i
                        className={`fa-solid ${i === index && playing ? 'fa-pause' : 'fa-play'}`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="info">
                      <div className="tt">
                        {String(i + 1).padStart(2, '0')} - {t.title}
                      </div>
                    </div>
                  </div>
                  <div className="right">
                    <div className="time bz-time">{t.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {visible < tracks.length && (
              <div id="loadmore" className="text-center">
                <button
                  type="button"
                  className="btn btn-loadmore"
                  title={title}
                  onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, tracks.length))}
                >
                  Xem thêm
                  <i className="fa-solid fa-angle-down ms-2" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
