import { defineConfig } from 'astro/config';

// En GitHub Actions el sitio se publica en GitHub Pages bajo /siac-web/.
// En cualquier otro build (local → siac-web-build.zip) se genera para
// producción en la raíz de siac.com.bo.
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: isGitHubPages ? 'https://maicolart07.github.io' : 'https://siac.com.bo',
  base: isGitHubPages ? '/siac-web/' : '/',
});
