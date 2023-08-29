# Changes made

## a11y.js

Add line 82 and 107 the `setAttribute` with a inline style has been disabled and we've added the styles to their respective class instead. See `a11y.css`.

At the `WordPressServiceProvider` in this repository we make sure this script loads first using `array_unshift(wp_scripts()->queue, 'wp-a11y');` because Gravity Forms has a dependency on the global `wp-a11y` object which also has a dependency on the `wp-i18n` package causing a conflict.

## moxie.js

Add line 6515 we've removed the `style="font-size:999px;opacity:0;"`.
