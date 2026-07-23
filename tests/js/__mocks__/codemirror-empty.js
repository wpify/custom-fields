// Mock for @codemirror/* language/view/theme packages. Every named export
// (php, html, css, EditorView, vscodeDark, ...) resolves to a harmless no-op;
// language factories return an inert "extension", and property access on
// values like EditorView.lineWrapping yields undefined without throwing.
const noop = () => undefined;

module.exports = new Proxy(
	{ __esModule: true },
	{
		get( target, prop ) {
			if ( prop === '__esModule' ) {
				return true;
			}
			if ( prop === 'default' ) {
				return noop;
			}
			return noop;
		},
	}
);
