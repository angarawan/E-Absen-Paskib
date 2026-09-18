import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <!-- Background with safe zone padding -->
  <rect width="100" height="100" rx="22" fill="#0f172a" />
  <circle cx="50" cy="50" r="40" fill="#1D4ED8" stroke="#FBBF24" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="33" fill="#1E40AF"/>
  <!-- Sayap & Lambang Pendidikan Tut Wuri Handayani -->
  <path d="M50 23 L57 36 L71 38 L60 49 L64 63 L50 55 L36 63 L40 49 L29 38 L43 36 Z" fill="#FBBF24"/>
  <circle cx="50" cy="46" r="8.5" fill="#DC2626"/>
  <path d="M47 39 Q50 34 53 39 Q55 43 50 47 Q45 43 47 39 Z" fill="#FEF08A"/>
  <path d="M37 69 Q50 65 63 69 L61 73 Q50 69 39 73 Z" fill="#FFFFFF"/>
</svg>`;

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write icon.svg
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

const svgBuffer = Buffer.from(svgContent);

async function generate() {
  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // favicon 64x64
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('All PWA icons generated successfully in /public!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
