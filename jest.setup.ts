import '@testing-library/jest-dom';

if (typeof globalThis.TextEncoder === 'undefined') {
	const { TextEncoder, TextDecoder } = require('util');
	globalThis.TextEncoder = TextEncoder;
	globalThis.TextDecoder = TextDecoder;
}

if (!HTMLElement.prototype.scrollIntoView) {
	Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
		value: () => undefined,
		writable: true,
		configurable: true,
	});
}
