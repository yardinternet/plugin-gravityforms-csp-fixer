import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Builds the stylesheets in resources/css to public/css.
 * Kept separate from vite.config.js, which builds the JavaScript as a library.
 * Both builds empty their outDir, so these must never be nested in each other.
 */
export default defineConfig( () => {
	const isWatchMode = process.env.WATCH === 'true';

	return {
		root: 'resources/css',
		build: {
			outDir: resolve( __dirname, 'public/css' ),
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
