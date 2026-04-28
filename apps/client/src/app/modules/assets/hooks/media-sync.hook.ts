import { useEffect, useRef } from 'react';

import { SYNC_THRESHOLD_SEC, HARD_SEEK_SEC } from '../constants/player.constants';

export function useMediaSync(
	videoRef: React.RefObject<HTMLVideoElement | null>,
	audioARef: React.RefObject<HTMLAudioElement | null>,
	audioBRef: React.RefObject<HTMLAudioElement | null>
) {
	const rafRef = useRef<number>(0);
	const syncingRef = useRef(false);

	useEffect(() => {
		const video: HTMLVideoElement | null = videoRef.current;
		const audioA: HTMLAudioElement | null = audioARef.current;
		const audioB: HTMLAudioElement | null = audioBRef.current;
		if (!video || !audioA || !audioB) return;

		const syncAudio = (audio: HTMLAudioElement) => {
			const diff = Math.abs(audio.currentTime - video.currentTime);
			if (diff > HARD_SEEK_SEC) {
				audio.currentTime = video.currentTime;
				return;
			}

			if (diff > SYNC_THRESHOLD_SEC) {
				audio.playbackRate = video.currentTime > audio.currentTime ? 1.02 : 0.98;
				return;
			}

			audio.playbackRate = video.playbackRate;
		};

		const loop = () => {
			if (!syncingRef.current) {
				syncAudio(audioA);
				syncAudio(audioB);
			}

			rafRef.current = requestAnimationFrame(loop);
		};

		const handlePlay = () => {
			audioA.currentTime = video.currentTime;
			audioB.currentTime = video.currentTime;
			audioA.play().catch((err) => console.error('[media-sync] audioA play failed:', err));
			audioB.play().catch((err) => console.error('[media-sync] audioB play failed:', err));

			rafRef.current = requestAnimationFrame(loop);
		};

		const handlePause = () => {
			audioA.pause();
			audioB.pause();

			cancelAnimationFrame(rafRef.current);
		};

		const handleSeeking = () => {
			syncingRef.current = true;
		};

		const handleSeeked = () => {
			audioA.currentTime = video.currentTime;
			audioB.currentTime = video.currentTime;

			syncingRef.current = false;
		};

		const handleRateChange = () => {
			audioA.playbackRate = video.playbackRate;
			audioB.playbackRate = video.playbackRate;
		};

		const handleEnded = () => {
			audioA.pause();
			audioB.pause();

			cancelAnimationFrame(rafRef.current);
		};

		video.addEventListener('play', handlePlay);
		video.addEventListener('pause', handlePause);
		video.addEventListener('seeking', handleSeeking);
		video.addEventListener('seeked', handleSeeked);
		video.addEventListener('ratechange', handleRateChange);
		video.addEventListener('ended', handleEnded);

		return () => {
			cancelAnimationFrame(rafRef.current);
			video.removeEventListener('play', handlePlay);
			video.removeEventListener('pause', handlePause);
			video.removeEventListener('seeking', handleSeeking);
			video.removeEventListener('seeked', handleSeeked);
			video.removeEventListener('ratechange', handleRateChange);
			video.removeEventListener('ended', handleEnded);
		};
	}, [videoRef, audioARef, audioBRef]);
}
