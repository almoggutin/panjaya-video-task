export const landingEnTranslation = {
	landing: {
		hero: {
			headline: 'Swap audio tracks,',
			headlineAccent: 'without re-rendering.',
			description:
				'Panjaya is a free, self-hostable video review tool that lets creators A/B the original audio against a server-transformed track in real time — sample-accurate, zero re-buffer.',
			cta: 'Get Started',
		},
		preview: {
			title: 'A live look at the player',
			description: 'Upload, subscribe to events, and toggle tracks — all from one SDK.',
			tabs: {
				upload: 'Upload an asset',
				events: 'Subscribe to events',
				toggle: 'Toggle audio track',
				delete: 'Delete',
			},
		},
		features: {
			compare: {
				tag: 'Compare in real time',
				title: 'Hear the difference, instantly',
				body: 'Flip between the original take and a polished mix in the same breath — no rewinding, no waiting for a new render.',
			},
			hub: {
				tag: 'Central review hub',
				title: 'One place for every cut',
				body: 'Drop raw footage straight from your camera roll. Panjaya keeps every version in a tidy library so your team reviews in one link.',
			},
			pipeline: {
				tag: 'Live processing feed',
				title: 'Watch the magic happen',
				body: 'See each upload move through extraction, transformation, and finalization live — with a clear ETA and zero guesswork.',
			},
		},
	},
} as const;
