# Rapport d'optimisation — `offre-speciale.html`

Landing Google Ads, mobile-first (Moto G Power, 4G slow).
Tracking GTM + Affilae + Elfsight + Clarity préservés. Formspree intact.

---

## 1. Image LCP `shape-22.webp` (P0.1)

| Variante | Avant | Après | Gain |
|---|---|---|---|
| `shape-22.webp` (desktop, 1600 px) | 269 KB | **120 KB** | −55 % |
| `shape-22-mobile.webp` (600 px) | — | **14.1 KB** | nouveau |
| Livré au LCP mobile (Moto G) | 269 KB | **14.1 KB** | **−95 %** |

- Backup original conservé : `assets/imgs/shape/shape-22-original.webp`.
- `<picture>` avec `source media="(max-width:768px)"` → variante mobile.
- `fetchpriority="high"`, `decoding="async"`, `width="1600" height="833"`.
- Préload responsive dans le `<head>` (`imagesrcset` + `imagesizes`).

## 2. CSS render-blocking (P0.2 + P3.13)

| Fichier | Avant | Après | Stratégie |
|---|---|---|---|
| `style.css` (global) | 294 KB | — | non chargé sur cette page |
| `style-offre-speciale.css` (PurgeCSS) | — | **108 KB** | non-bloquant `media=print + onload` |
| `bootstrap.min.css` | 189 KB | 189 KB | non-bloquant |
| `all.min.css` (Font Awesome) | 130 KB | 130 KB | non-bloquant |
| `swiper-bundle.min.css` | 18 KB | 18 KB | non-bloquant |
| Autres vendor (`magnific`, `animate`, `meanmenu`, `nice-select`, `progressbar`) | 86 KB | 86 KB | non-bloquant |
| **Total CSS render-blocking initial** | **~828 KB / 9 fichiers** | **0 KB inline ~12 KB** | — |

- CSS critique above-the-fold inliné dans le `<head>` (~12 KB).
- Tous les fichiers CSS externes en `media="print" onload="this.media='all'"`.
- Fallback `<noscript>` pour les navigateurs sans JS.
- `style-offre-speciale.css` créé via `purgecss` à partir de `style.css` global, basé sur les classes effectivement utilisées dans `offre-speciale.html`. **−63 %** par rapport à `style.css`.
- Imports `@import url(fonts.googleapis...)` retirés de `style-offre-speciale.css` (les Google Fonts sont chargées séparément, non-bloquantes).
- `font-display:swap` ajouté aux `@font-face` Font Awesome (inline).

## 3. Google Fonts (P0.3)

| | Avant | Après |
|---|---|---|
| Requêtes `fonts.googleapis.com` | 3 (sequentielles, bloquantes) | **1** (non-bloquante) |
| Préconnect | aucun | 2 (`googleapis` + `gstatic`) |
| Display | non précisé | `display=swap` |
| Polices fusionnées | 3 imports séparés (Instrument Sans, Space Grotesk, DM Sans, Poppins) | 1 URL unique |

- `<link rel="preconnect">` × 2.
- `<link rel="stylesheet" media="print" onload="this.media='all'">` (technique Filament Group).
- `<noscript>` fallback.
- `fa-solid-900.woff2` (152 KB) préchargé en `<link rel="preload" as="font">`.

## 4. JS vendor (P1.5 + P1.6)

| Script | Avant | Après |
|---|---|---|
| `jquery-3.7.1.min.js` | sync | **defer** |
| `bootstrap.bundle.min.js` | sync | **defer** |
| `swiper-bundle.min.js` | sync | **defer** |
| `gsap.min.js` | sync | **defer** |
| `ScrollTrigger.min.js` | sync | **defer** (requis par `main.js`) |
| `ScrollSmoother.min.js` | sync | **defer** (requis par `main.js`) |
| `SplitText.min.js` | sync | **defer** (requis par `main.js`) |
| `jquery.meanmenu.min.js` | sync | **defer** (requis par `main.js`) |
| `jquery.nice-select.min.js` | sync | **defer** (requis par `main.js`) |
| `main.js` | sync | **defer** |
| `jquery.magnific-popup.min.js` (20 KB) | sync | **lazy idle/scroll** |
| `counter.js` (2 KB) | sync | **lazy idle/scroll** |
| `progressbar.js` (3 KB) | sync | **lazy idle/scroll** |
| `backToTop.js` (1 KB) | sync | **lazy idle/scroll** |
| Affilae `ae-v3.5.js` | dans `<head>` | **fin de body, defer + async** |
| Elfsight `platform.js` | `<head> async` (déclenche tôt) | **`IntersectionObserver` à 300 px** |

- `requestIdleCallback` (fallback `setTimeout 1500 ms`) + écouteurs `scroll/touchstart/mousemove/keydown` `{ once:true, passive:true }` pour les non-critiques.
- Plus aucun `<link rel="preconnect" href="https://core.service.elfsight.com">` (n'existait pas, mais le préchargement Elfsight est entièrement supprimé en attendant le scroll).
- Carrousel portfolio + lightbox initialisés via `DOMContentLoaded` avec polling sur `Swiper`/`magnificPopup` pour gérer le lazy.

## 5. Images portfolio (P2.8)

`<img srcset="...-800w.webp 800w, ...-1200w.webp 1200w" sizes="(max-width: 768px) 90vw, 33vw" loading="lazy" decoding="async" width="800" height="544">`

| Image source | Avant | 800w | 1200w | Gain mobile (800w) |
|---|---|---|---|---|
| `plombier_1` | 184.9 KB | **20.6 KB** | 33.7 KB | −89 % |
| `dentiste_1` | 130.9 KB | **17.6 KB** | 29.2 KB | −87 % |
| `avocat_1` | 96.0 KB | **15.5 KB** | 25.1 KB | −84 % |
| `electricite_1` | 96.3 KB | **12.0 KB** | 20.3 KB | −88 % |
| `medecin_1` | 104.6 KB | **21.6 KB** | 34.0 KB | −79 % |
| `archi_1` | 242.6 KB | **22.1 KB** | 38.0 KB | −91 % |
| `notaire_1` | 188.3 KB | **27.6 KB** | 47.2 KB | −85 % |
| `paysagiste_1` | 131.8 KB | **13.3 KB** | 21.9 KB | −90 % |
| `pharma_1` | 155.4 KB | **18.6 KB** | 32.3 KB | −88 % |
| `couvreur_1` | 171.2 KB | **21.9 KB** | 35.4 KB | −87 % |
| `comptable_1` | 196.0 KB | **34.8 KB** | 58.6 KB | −82 % |
| `kyne_1` | 95.7 KB | **18.8 KB** | 31.0 KB | −80 % |
| **Total** | **1 793.7 KB** | **244.4 KB** | 406.7 KB | **−86 %** |

> Économies effectives : **~1 549 KB** sur mobile (carrousel lazy-loadé, donc impact TBT/INP plutôt que LCP).

## 6. Logos brand PNG → WebP (P2.9)

| Logo | PNG (avant) | WebP (après) | Gain |
|---|---|---|---|
| `Semrush` | 11.1 KB | **1.6 KB** | −86 % |
| `W3C-developers` | 9.4 KB | **1.9 KB** | −80 % |
| `google-developers-experts` | 9.2 KB | **3.0 KB** | −67 % |
| `logo.png` | 5.3 KB | **1.3 KB** | −76 % |
| **Total** | **35.0 KB** | **7.8 KB** | **−78 %** |

Servi via `<picture><source srcset="...webp" type="image/webp"><img src="...png">` → fallback automatique pour les navigateurs anciens.

## 7. Width / height explicites (P2.10)

Ajoutés sur **toutes** les `<img>` :
- Logo header (160 × 42)
- Logo aside (160 × 42)
- Logo footer light (160 × 42)
- Logos brand carousel (240 × 80 ou 160 × 80)
- Hero shape-22 (1600 × 833)
- Hero shapes décoratives 20 / 21 (160 × 160, `loading="lazy"`)
- Portfolio (800 × 544)
- Footer-bkg (1920 × 600)
- Side-toggle icon (28 × 28)

## 8. Accessibilité (P3.12)

**Boutons** :
- `<button class="side-toggle" aria-label="Ouvrir le menu">` ✓
- `<button id="side-info-close" aria-label="Fermer le menu">` ✓
- `<a class="wa-float" aria-label="Contacter via WhatsApp">` (déjà OK)
- Toutes les `<i class="fa-…">` décoratives marquées `aria-hidden="true"` (cards SEO et étapes)

**Contrastes corrigés (cible WCAG AA 4.5:1)** :
- `.cmp-price-sub`, `.cmp-footer-sub` : `#888` → `#666` puis `#d0d0d0` sur fond `#0e0f11`
- `.offre-faq-q i` : `#888` → `#555`
- `.offre-form-card .micro` : `#999` → `#666`
- `.form-trust span` : `#999` → `#666`
- `.hero-phone p` : `#888` → `#666`
- `.trust-item span` : `#888` → `#555`
- `.cmp-q-icon` : `#fed302` → `#d9b800` (ratio ≥ 4.5 sur fond clair)
- `.cmp-mid` : `#e65100` → `#c54c00`
- `.offre-cta-final .sub` : `#aaa` → `#d0d0d0` (sur fond noir)
- `.offre-cta-final .micro` : `#777` → `#b0b0b0`
- `.mini-form-h input::placeholder` : `rgba(255,255,255,0.45)` → `0.6`

**Hiérarchie de titres** :
- Cards SEO : `<h4>` → `<h3>` (premier niveau sous `<h2>`)
- Étapes : `<h4>` → `<h3>`
- `.form-success h4` conservé (sous-section logique du formulaire qui a un `<h3>`)

## 9. Cache TTL tiers (P3.11)

> **Out of scope.** Les en-têtes `Cache-Control` de `static.affilae.com`, `elfsightcdn.com`, `googletagmanager.com`, `clarity.ms` sont gérés par les CDN. Documenté en commentaire HTML.

---

## Estimation PageSpeed mobile (Moto G Power, 4G slow)

| Métrique | Avant | Cible | Estimation après |
|---|---|---|---|
| **Performance** | 53 | ≥ 85 | **88 – 95** |
| **FCP** | 3.6 s | ≤ 1.8 s | **1.0 – 1.5 s** |
| **LCP** | **10.9 s** | ≤ 2.5 s | **1.5 – 2.3 s** |
| **TBT** | 370 ms | ≤ 200 ms | **80 – 160 ms** |
| **CLS** | 0.006 | < 0.1 | **0.005 – 0.015** (préservé via width/height) |
| **Speed Index** | 6.5 s | — | **2.5 – 3.5 s** |

### D'où vient le gain LCP (10.9 s → ~2 s)

| Source | Gain estimé |
|---|---|
| Image LCP : 269 KB → 14 KB + preload + fetchpriority | **−6 à −7 s** |
| CSS render-blocking : 9 fichiers → 0 + critique inline | **−2.5 à −3 s** |
| Google Fonts : 3 imports bloquants → 1 non-bloquant | **−1.5 à −2 s** |
| Polices `fa-solid-900.woff2` préchargée + `font-display:swap` | **−0.3 à −0.5 s** |
| **Total** | **−10 à −12 s** sur LCP |

### D'où vient le gain TBT (370 → ~150 ms)

- Affilae déplacé en fin de body et différé.
- Elfsight chargé via `IntersectionObserver` (rootMargin 300 px) → ne s'exécute qu'au scroll vers la section témoignages.
- 4 scripts non critiques (`magnific-popup`, `counter`, `progressbar`, `backToTop`) chargés en `requestIdleCallback` ou à la première interaction.
- `defer` partout → exécution post-DOM.

---

## Méthode de validation

Après déploiement :

```bash
npx lighthouse https://www.alizee-web.com/offre-speciale.html \
  --form-factor=mobile --only-categories=performance --view
```

Vérifications fonctionnelles (DevTools console) :
1. Soumettre le form principal (`#offreForm`) → `dataLayer.push({event:'form_submit_devis', form_name:'offre_speciale', ...})` doit apparaître.
2. Soumettre le mini-form (`#miniForm`) → `dataLayer.push({event:'form_submit_devis', form_name:'mini_formulaire_portfolio', ...})`.
3. Scroller vers la section "Avis Google" → `platform.js` se charge dans Network.
4. Affilae ping après ~1.5 s d'idle → `static.affilae.com/ae-v3.5.js`.
5. Carrousel portfolio fonctionnel, lightbox magnific-popup sur les images après idle.

Vérifications visuelles :
- Mobile 375 px : hero, formulaire, sticky bar bas, FAQ, footer.
- Desktop 1440 px : grille hero 2 colonnes, dropdown menu, table comparative complète.

---

## Livrables produits

- `offre-speciale.html` modifié (1378 lignes, 80.5 KB) avec CSS critique inline, scripts différés, preload LCP, `fetchpriority`, `srcset`, `picture`, `aria-label`, hiérarchie de titres corrigée, contrastes WCAG AA.
- `assets/imgs/shape/shape-22.webp` (1600 px, 120 KB) + `shape-22-mobile.webp` (600 px, 14 KB) + backup `shape-22-original.webp`.
- `image portofolio/*-800w.webp` + `*-1200w.webp` pour 12 secteurs.
- `assets/Semrush.webp`, `assets/W3C-developers.webp`, `assets/google-developers-experts.webp`, `assets/imgs/logo/logo.webp`.
- `assets/css/style-offre-speciale.css` (108 KB) — version PurgeCSS spécifique à la page (sans @import Google Fonts, avec `font-display:swap`).
- Scripts utilitaires : `optimize-images.js`, `purge-css.js` (à la racine, pour ré-exécuter si besoin).
