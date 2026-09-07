import '@testing-library/jest-dom';

if (typeof globalThis.TextEncoder === 'undefined') {
	const { TextEncoder, TextDecoder } = require('util');
	globalThis.TextEncoder = TextEncoder;
	globalThis.TextDecoder = TextDecoder;
}

if (!HTMLElement.prototype.scrollIntoView) {
	HTMLElement.prototype.scrollIntoView = jest.fn();
}
