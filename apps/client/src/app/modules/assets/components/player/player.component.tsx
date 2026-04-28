import { useRef, useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ActiveTrack } from '../../models/asset.models';
import type { IAsset, PlaybackRate } from '../../models/asset.models';
import { AudioGraphProvider } from '../../contexts/audio-graph.context';
import { useAudioGraph } from '../../hooks/audio-graph.hook';
import { useMediaSync } from '../../hooks/media-sync.hook';
import { useCrossfade } from '../../hooks/crossfade.hook';
import { setActiveTrack, setVolume, setPlaybackRate } from '../../slices/player.slice';
import { VideoPane } from './video-pane/video-pane.component';
import { Waveform } from './waveform/waveform.component';
import { TransportBar } from './transport-bar/transport-bar.component';
import { Utils } from '@/app/core/utils/common.utils';
import type { RootState } from '@/app/core/store/root-reducer';

import './player.component.css';

type PlayerInnerProps = {
	asset: IAsset;
};

function PlayerInner({ asset }: PlayerInnerProps) {
	const dispatch = useDispatch();
	const { activeTrack, volume, playbackRate } = useSelector((s: RootState) => s.player);

	const { audioContext, gainA, gainB } = useAudioGraph();
	const { crossfade } = useCrossfade();

	const videoRef = useRef<HTMLVideoElement>(null);
	const audioARef = useRef<HTMLAudioElement>(null);
	const audioBRef = useRef<HTMLAudioElement>(null);

	const timecodeRef = useRef<HTMLSpanElement>(null);
	const currentTimeRef = useRef<HTMLSpanElement>(null);
	const seekFillRef = useRef<HTMLDivElement>(null);
	const seekThumbRef = useRef<HTMLDivElement>(null);

	const [playing, setPlaying] = useState(false);
	const [duration, setDuration] = useState(asset.durationSec ?? 0);
	const [waveCurrentTime, setWaveCurrentTime] = useState(0);

	const [gainAValue, setGainAValue] = useState(1);
	const [gainBValue, setGainBValue] = useState(0);
	const gainAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const gainAValueRef = useRef(1);
	const gainBValueRef = useRef(0);
	const rafRef = useRef<number>(0);
	const lastWaveUpdateRef = useRef(0);

	useMediaSync(videoRef, audioARef, audioBRef);

	useEffect(() => {
		const clamp = (v: number) => Math.max(0, Math.min(1, v));
		if (audioARef.current) audioARef.current.volume = clamp(gainAValue * volume);
		if (audioBRef.current) audioBRef.current.volume = clamp(gainBValue * volume);
	}, [gainAValue, gainBValue, volume]);

	useEffect(() => {
		crossfade(audioContext, gainA, gainB, activeTrack === ActiveTrack.MODIFIED);

		if (gainAnimRef.current) clearInterval(gainAnimRef.current);
		const targetGainA: number = activeTrack === ActiveTrack.MODIFIED ? 0 : 1;
		const targetGainB: number = activeTrack === ActiveTrack.MODIFIED ? 1 : 0;
		const startGainA: number = gainAValueRef.current;
		const startGainB: number = gainBValueRef.current;
		const animStartTime: number = Date.now();
		const animDurationMs: number = 80;

		gainAnimRef.current = setInterval(() => {
			const lerpFactor: number = Math.min(1, (Date.now() - animStartTime) / animDurationMs);
			const nextGainA: number = startGainA + (targetGainA - startGainA) * lerpFactor;
			const nextGainB: number = startGainB + (targetGainB - startGainB) * lerpFactor;

			gainAValueRef.current = nextGainA;
			gainBValueRef.current = nextGainB;

			setGainAValue(nextGainA);
			setGainBValue(nextGainB);
			if (lerpFactor >= 1 && gainAnimRef.current) clearInterval(gainAnimRef.current);
		}, 16);

		return () => {
			if (gainAnimRef.current) clearInterval(gainAnimRef.current);
		};
	}, [activeTrack, audioContext, crossfade, gainA, gainB]);

	useEffect(() => {
		if (videoRef.current) videoRef.current.playbackRate = playbackRate;
	}, [playbackRate]);

	useEffect(() => {
		const tick = (timestamp: number) => {
			const video = videoRef.current;
			if (video && duration > 0) {
				const currentTime: number = video.currentTime;
				const fillPercent: number = (currentTime / duration) * 100;

				if (timecodeRef.current) timecodeRef.current.textContent = Utils.formatDuration(currentTime);
				if (currentTimeRef.current) currentTimeRef.current.textContent = Utils.formatDuration(currentTime);
				if (seekFillRef.current) seekFillRef.current.style.width = `${fillPercent}%`;
				if (seekThumbRef.current) seekThumbRef.current.style.left = `${fillPercent}%`;

				if (timestamp - lastWaveUpdateRef.current > 100) {
					lastWaveUpdateRef.current = timestamp;
					setWaveCurrentTime(currentTime);
				}
			}
			rafRef.current = requestAnimationFrame(tick);
		};

		rafRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafRef.current);
	}, [duration]);

	const handlePlayPause = useCallback(async () => {
		const video = videoRef.current;
		if (!video) return;
		if (audioContext.state === 'suspended') await audioContext.resume();
		if (video.paused) {
			video.play();
			setPlaying(true);
			return;
		}

		video.pause();
		setPlaying(false);
	}, [audioContext]);

	const handleSeek = useCallback(
		(t: number) => {
			const video = videoRef.current;
			if (!video) return;
			video.currentTime = Math.max(0, Math.min(duration, t));
		},
		[duration]
	);

	const handleSkip = useCallback(
		(delta: number) => {
			const video = videoRef.current;
			if (!video) return;
			video.currentTime = Math.max(0, Math.min(duration, video.currentTime + delta));
		},
		[duration]
	);

	return (
		<div className="player">
			<VideoPane
				videoRef={videoRef}
				audioARef={audioARef}
				audioBRef={audioBRef}
				timecodeRef={timecodeRef}
				videoSrc={asset.videoUrl ?? undefined}
				audioSrc={asset.audioUrl ?? undefined}
				modifiedAudioSrc={asset.modifiedAudioUrl ?? undefined}
				thumbnailSrc={asset.thumbnailUrl ?? undefined}
				playing={playing}
				duration={duration}
				activeTrack={activeTrack}
				onPlayPause={handlePlayPause}
				onLoadedMetadata={() => {
					if (videoRef.current) setDuration(videoRef.current.duration);
				}}
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onEnded={() => setPlaying(false)}
			/>

			<Waveform
				assetId={asset.id}
				currentTime={waveCurrentTime}
				duration={duration}
				gainA={gainAValue}
				gainB={gainBValue}
				onSeek={handleSeek}
			/>

			<TransportBar
				playing={playing}
				currentTimeRef={currentTimeRef}
				seekFillRef={seekFillRef}
				seekThumbRef={seekThumbRef}
				duration={duration}
				volume={volume}
				playbackRate={playbackRate}
				activeTrack={activeTrack}
				onPlayPause={handlePlayPause}
				onSeek={handleSeek}
				onSkip={handleSkip}
				onVolumeChange={(v) => dispatch(setVolume(v))}
				onRateChange={(r) => dispatch(setPlaybackRate(r as PlaybackRate))}
				onTrackChange={(t) => dispatch(setActiveTrack(t))}
			/>
		</div>
	);
}

export function Player({ asset }: { asset: IAsset }) {
	return (
		<AudioGraphProvider>
			<PlayerInner asset={asset} />
		</AudioGraphProvider>
	);
}
