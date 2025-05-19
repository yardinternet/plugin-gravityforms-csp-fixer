import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig( () => {
	const isWatchMode = process.env.WATCH === 'true';

	return {
		root: 'resources/js',
		build: {
			outDir: resolve( __dirname, 'public/build' ),
			emptyOutDir: true,
			lib: {
				entry: resolve( __dirname, 'resources/js/index.js' ),
				name: 'gravityforms-csp-fixer',
			},
			watch: isWatchMode
				? {
						include: 'resources/js/**',
				  }
				: null,
		},
	};
} );
