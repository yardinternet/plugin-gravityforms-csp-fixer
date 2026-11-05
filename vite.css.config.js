import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Builds the stylesheets in resources/css to public/build/css.
 * Kept separate from vite.config.js, which builds the JavaScript as a library.
 */
export default defineConfig( () => {
	const isWatchMode = process.env.WATCH === 'true';

	return {
		root: 'resources/css',
		build: {
			outDir: resolve( __dirname, 'public/build/css' ),
			emptyOutDir: true,
			rollupOptions: {
				input: {
					blocks: resolve( __dirname, 'resources/css/blocks.css' ),
				},
				output: {
					assetFileNames: '[name][extname]',
				},
			},
			watch: isWatchMode
				? {
						include: 'resources/css/**',
				  }
				: null,
		},
	};
} );
