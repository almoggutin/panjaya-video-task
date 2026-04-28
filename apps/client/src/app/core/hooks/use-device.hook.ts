import { useEffect, useState } from 'react';

import { BP_LG, BP_SM } from '@/app/core/constants/device.constants';
import { IDeviceInfo } from '@/app/core/models/device.models';

function getDevice(): IDeviceInfo {
	const width = window.innerWidth;
	return {
		isMobile: width < BP_SM,
		isTablet: width >= BP_SM && width < BP_LG,
		isDesktop: width >= BP_LG,
	};
}

export function useDevice(): IDeviceInfo {
	const [device, setDevice] = useState<IDeviceInfo>(getDevice);

	useEffect(() => {
		const mqlSm: MediaQueryList = window.matchMedia(`(min-width: ${BP_SM}px)`);
		const mqlLg: MediaQueryList = window.matchMedia(`(min-width: ${BP_LG}px)`);
		const update = () => setDevice(getDevice());

		mqlSm.addEventListener('change', update);
		mqlLg.addEventListener('change', update);

		return () => {
			mqlSm.removeEventListener('change', update);
			mqlLg.removeEventListener('change', update);
		};
	}, []);

	return device;
}
