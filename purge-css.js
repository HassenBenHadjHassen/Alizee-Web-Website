/* eslint-disable */
// Génère assets/css/style-offre-speciale.css en purgeant style.css
// avec offre-speciale.html comme contenu de référence.

import { PurgeCSS } from 'purgecss';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
// PurgeCSS attend des chemins POSIX-style même sur Windows
const html = 'offre-speciale.html';
const sourceCss = 'assets/css/style.css';
const outCss = path.join(root, 'assets', 'css', 'style-offre-speciale.css');

const safelist = {
  standard: [
    'open', 'active', 'show', 'fade', 'fade-anim', 'move-anim', 'char-anim',
    'info-open', 'overlay-open', 'mfp-fade', 'mfp-bg', 'mfp-wrap',
    'animated', 'fadeIn', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight',
    'header-stuck', 'sticky', 'has-smooth', 'sliding-down',
    'd-none', 'd-block', 'd-flex', 'd-xl-none',
  ],
  deep: [
    /^swiper-/, /^magnific-/, /^mfp-/, /^gsap-/, /^scroll-/,
    /^fa-/, /^fas$/, /^far$/, /^fab$/, /^fa$/,
    /^animate__/, /^slick-/,
    /^col-/, /^row$/, /^container$/, /^container-/,
    /^bg-/, /^p-/, /^px-/, /^py-/, /^pt-/, /^pb-/, /^ps-/, /^pe-/,
    /^m-/, /^mx-/, /^my-/, /^mt-/, /^mb-/, /^ms-/, /^me-/,
    /^d-/, /^align-/, /^justify-/,
    /^section-/, /^header-/, /^hero-/, /^offre-/, /^cmp-/,
    /^trust-/, /^testimonial-/, /^portfolio-/, /^brand-/,
    /^form-/, /^field-/, /^btn-/, /^t-btn/,
    /^footer-/, /^side-/, /^offset-/, /^contact-/,
    /^step-/, /^progress-/, /^preloader-/, /^mobile-/,
    /^sticky-/, /^wa-/, /^check-/, /^slide-/,
    /^card-/, /^title-/, /^subtitle-/,
  ],
};

(async () => {
  const result = await new PurgeCSS().purge({
    content: [html],
    css: [sourceCss],
    safelist,
    keyframes: true,
  });

  if (!result || !result.length || !result[0]) {
    throw new Error('PurgeCSS retour vide');
  }

  // Retire les @import Google Fonts (déjà chargés via <link> dans le head)
  let css = result[0].css.replace(/@import\s+url\([^)]*fonts\.googleapis[^)]*\);?/g, '');

  // Ajoute font-display:swap dans toutes les @font-face qui ne l'ont pas
  css = css.replace(/@font-face\s*\{([^}]+)\}/g, function(match, body) {
    if (!/font-display\s*:/.test(body)) {
      return '@font-face{' + body.trim().replace(/;\s*$/, '') + ';font-display:swap}';
    }
    return match;
  });

  await fs.writeFile(outCss, css, 'utf8');

  const beforeSize = (await fs.stat(sourceCss)).size;
  const afterSize = (await fs.stat(outCss)).size;
  console.log(`style.css                : ${(beforeSize / 1024).toFixed(1)} KB`);
  console.log(`style-offre-speciale.css : ${(afterSize / 1024).toFixed(1)} KB (-${((1 - afterSize / beforeSize) * 100).toFixed(1)}%)`);
})();
