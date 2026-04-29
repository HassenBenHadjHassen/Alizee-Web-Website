/* eslint-disable */
// Script one-shot pour la landing offre-speciale.html.
// 1. shape-22 hero LCP : versions mobile + desktop allégées
// 2. portfolio : variantes 800w + 1200w (retina)
// 3. logos brand PNG -> WebP

import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const portfolioDir = path.join(root, 'image portofolio');
const shapeDir = path.join(root, 'assets', 'imgs', 'shape');
const assetsDir = path.join(root, 'assets');
const logoDir = path.join(root, 'assets', 'imgs', 'logo');

const portfolioBases = [
  'plombier_1', 'dentiste_1', 'avocat_1', 'electricite_1',
  'medecin_1', 'archi_1', 'notaire_1', 'paysagiste_1',
  'pharma_1', 'couvreur_1', 'comptable_1', 'kyne_1',
];

const brandLogos = [
  { src: path.join(assetsDir, 'Semrush.png'), out: path.join(assetsDir, 'Semrush.webp'), w: 240 },
  { src: path.join(assetsDir, 'W3C-developers.png'), out: path.join(assetsDir, 'W3C-developers.webp'), w: 240 },
  { src: path.join(assetsDir, 'google-developers-experts.png'), out: path.join(assetsDir, 'google-developers-experts.webp'), w: 240 },
  { src: path.join(logoDir, 'logo.png'), out: path.join(logoDir, 'logo.webp') },
];

async function statKb(p) {
  try { const s = await fs.stat(p); return Math.round(s.size / 1024 * 10) / 10; }
  catch { return null; }
}

async function processShape() {
  const src = path.join(shapeDir, 'shape-22.webp');
  const backup = path.join(shapeDir, 'shape-22-original.webp');

  try {
    await fs.access(backup);
  } catch {
    await fs.copyFile(src, backup);
    console.log('  Backup -> shape-22-original.webp');
  }

  const buf = await fs.readFile(backup);
  const beforeKb = await statKb(backup);

  // Desktop : 1600px max, q75, strip metadata
  const desktopOut = path.join(shapeDir, 'shape-22.webp');
  await sharp(buf)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 75, effort: 6, alphaQuality: 80 })
    .toFile(desktopOut);

  // Mobile : 600px max, q70, strip metadata
  const mobileOut = path.join(shapeDir, 'shape-22-mobile.webp');
  await sharp(buf)
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 70, effort: 6, alphaQuality: 75 })
    .toFile(mobileOut);

  const afterDesktop = await statKb(desktopOut);
  const afterMobile = await statKb(mobileOut);
  console.log(`shape-22 : ${beforeKb} KB -> desktop ${afterDesktop} KB / mobile ${afterMobile} KB`);
}

async function processPortfolio() {
  for (const base of portfolioBases) {
    const src = path.join(portfolioDir, `${base}.webp`);
    try { await fs.access(src); } catch { console.warn(`  manquant : ${src}`); continue; }
    const buf = await fs.readFile(src);
    const before = await statKb(src);

    const out800 = path.join(portfolioDir, `${base}-800w.webp`);
    const out1200 = path.join(portfolioDir, `${base}-1200w.webp`);

    await sharp(buf)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 75, effort: 5 })
      .toFile(out800);

    await sharp(buf)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 75, effort: 5 })
      .toFile(out1200);

    const a8 = await statKb(out800);
    const a12 = await statKb(out1200);
    console.log(`${base} : ${before} KB -> 800w ${a8} KB / 1200w ${a12} KB`);
  }
}

async function processBrand() {
  for (const item of brandLogos) {
    try { await fs.access(item.src); } catch { console.warn(`  manquant : ${item.src}`); continue; }
    const before = await statKb(item.src);
    let pipe = sharp(item.src);
    if (item.w) pipe = pipe.resize({ width: item.w, withoutEnlargement: true });
    await pipe.webp({ quality: 85, effort: 6 }).toFile(item.out);
    const after = await statKb(item.out);
    console.log(`${path.basename(item.src)} : ${before} KB -> ${path.basename(item.out)} ${after} KB`);
  }
}

(async () => {
  console.log('-- shape-22 hero LCP --');
  await processShape();
  console.log('\n-- portfolio --');
  await processPortfolio();
  console.log('\n-- brand logos --');
  await processBrand();
  console.log('\nOK');
})();
