import { useEffect, useState } from 'react';

export default function useIsMobile(breakpoint = 768) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 0.5}px)`);
		const update = () => setIsMobile(mediaQuery.matches);

		update();

		if (typeof mediaQuery.addEventListener === 'function') {
			mediaQuery.addEventListener('change', update);
			return () => mediaQuery.removeEventListener('change', update);
		}

		// Safari / older browsers
		mediaQuery.addListener(update);
		return () => mediaQuery.removeListener(update);
	}, [breakpoint]);

	return isMobile;
}
