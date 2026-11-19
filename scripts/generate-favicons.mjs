import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Primary Scalable SVG Asset (512x512 ViewBox)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient: Soft pale sky-blue with subtle cyan-to-mint transition -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE"/>
      <stop offset="48%" stop-color="#E6FFFA"/>
      <stop offset="100%" stop-color="#ECFDF5"/>
    </linearGradient>

    <!-- Subtle Inner Border Highlight -->
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#CCFBF1" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#99F6E4" stop-opacity="0.4"/>
    </linearGradient>

    <!-- Letter A Gradient: Deep Navy to Teal -->
    <linearGradient id="letterAGradient" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="45%" stop-color="#113A4B"/>
      <stop offset="85%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#0D6B63"/>
    </linearGradient>

    <!-- Flowing Wind Swoosh: Bright Cyan to Vibrant Turquoise -->
    <linearGradient id="windSwooshGrad" x1="0%" y1="30%" x2="100%" y2="70%">
      <stop offset="0%" stop-color="#00E5FF"/>
      <stop offset="35%" stop-color="#06B6D4"/>
      <stop offset="70%" stop-color="#14B8A6"/>
      <stop offset="100%" stop-color="#2DD4BF"/>
    </linearGradient>

    <!-- Secondary Wind Streamline -->
    <linearGradient id="windStreamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#2DD4BF" stop-opacity="0.95"/>
    </linearGradient>

    <!-- Botanical Leaves Gradient: Emerald to Fresh Mint -->
    <linearGradient id="leafGradMain" x1="20%" y1="80%" x2="80%" y2="20%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="45%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#34D399"/>
    </linearGradient>

    <linearGradient id="leafGradSecondary" x1="20%" y1="80%" x2="90%" y2="10%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#6EE7B7"/>
    </linearGradient>

    <!-- Urban Skyline Gradient: Minimal Blue-Grey -->
    <linearGradient id="skylineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94A3B8" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#64748B" stop-opacity="0.75"/>
    </linearGradient>

    <!-- Subtle Drop Shadows for Visual Depth -->
    <filter id="shadowA" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.16"/>
    </filter>

    <filter id="shadowWind" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F766E" flood-opacity="0.22"/>
    </filter>

    <filter id="shadowLeaf" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="2" dy="6" stdDeviation="6" flood-color="#064E3B" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Base: Modern Rounded-Square App Icon -->
  <rect width="512" height="512" rx="114" fill="url(#bgGradient)"/>
  <rect x="4" y="4" width="504" height="504" rx="110" fill="none" stroke="url(#borderGradient)" stroke-width="2.5"/>

  <!-- Atmosphere: Soft Ambient Air Glow -->
  <circle cx="256" cy="256" r="190" fill="#CCFBF1" opacity="0.3" filter="blur(30px)"/>

  <!-- Minimal Blue-Grey Urban Skyline (Lower Portion) -->
  <g id="urbanSkyline" fill="url(#skylineGrad)">
    <!-- Building 1 (Far Left) -->
    <rect x="94" y="342" width="34" height="78" rx="2.5"/>
    <rect x="100" y="352" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>
    <rect x="114" y="352" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>
    <rect x="100" y="366" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>
    <rect x="114" y="366" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>
    <rect x="100" y="380" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>
    <rect x="114" y="380" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>

    <!-- Building 2 (Left Mid - Spire Tower) -->
    <rect x="134" y="312" width="40" height="108" rx="2.5"/>
    <rect x="152.5" y="290" width="3" height="22" rx="1.5" fill="#64748B" opacity="0.8"/>
    <circle cx="154" cy="289" r="2.5" fill="#0EA5E9" opacity="0.8"/>
    <rect x="142" y="324" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>
    <rect x="157" y="324" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>
    <rect x="142" y="340" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>
    <rect x="157" y="340" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>
    <rect x="142" y="356" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>
    <rect x="157" y="356" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>

    <!-- Building 3 (Left Inner) -->
    <rect x="180" y="338" width="36" height="82" rx="2.5"/>
    <rect x="188" y="348" width="6" height="7" rx="1" fill="#CBD5E1" opacity="0.6"/>
    <rect x="202" y="348" width="6" height="7" rx="1" fill="#CBD5E1" opacity="0.6"/>
    <rect x="188" y="362" width="6" height="7" rx="1" fill="#CBD5E1" opacity="0.6"/>
    <rect x="202" y="362" width="6" height="7" rx="1" fill="#CBD5E1" opacity="0.6"/>

    <!-- Building 4 (Center - Anchoring Architecture seen through A) -->
    <rect x="242" y="278" width="28" height="142" rx="2.5" opacity="0.65"/>
    <rect x="254.5" y="254" width="3" height="24" rx="1.5" fill="#64748B" opacity="0.85"/>
    <circle cx="256" cy="253" r="2.5" fill="#14B8A6" opacity="0.9"/>
    <rect x="248" y="292" width="16" height="6" rx="1" fill="#E2E8F0" opacity="0.7"/>
    <rect x="248" y="306" width="16" height="6" rx="1" fill="#E2E8F0" opacity="0.7"/>

    <!-- Building 5 (Right Inner) -->
    <rect x="296" y="332" width="38" height="88" rx="2.5"/>
    <rect x="304" y="344" width="6" height="7" rx="1" fill="#CBD5E1" opacity="0.6"/>
    <rect x="318" y="344" width="6" height="7" rx="1" fill="#CBD5E1" opacity="0.6"/>
    <rect x="304" y="358" width="6" height="7" rx="1" fill="#CBD5E1" opacity="0.6"/>
    <rect x="318" y="358" width="6" height="7" rx="1" fill="#CBD5E1" opacity="0.6"/>

    <!-- Building 6 (Right Mid - Crown Spire) -->
    <rect x="338" y="306" width="42" height="114" rx="2.5"/>
    <path d="M 338,306 L 359,292 L 380,306 Z" fill="#64748B" opacity="0.75"/>
    <rect x="357.5" y="278" width="3" height="15" rx="1.5" fill="#64748B" opacity="0.8"/>
    <circle cx="359" cy="277" r="2.5" fill="#0EA5E9" opacity="0.8"/>
    <rect x="346" y="320" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>
    <rect x="363" y="320" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>
    <rect x="346" y="336" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>
    <rect x="363" y="336" width="7" height="9" rx="1" fill="#E2E8F0" opacity="0.6"/>

    <!-- Building 7 (Far Right) -->
    <rect x="384" y="346" width="34" height="74" rx="2.5"/>
    <rect x="392" y="358" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>
    <rect x="404" y="358" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>
    <rect x="392" y="372" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>
    <rect x="404" y="372" width="6" height="6" rx="1" fill="#CBD5E1" opacity="0.7"/>

    <!-- Soft Urban Horizon Base Ground -->
    <rect x="74" y="416" width="364" height="6" rx="3" fill="#64748B" opacity="0.3"/>
  </g>

  <!-- Large, Distinctive Uppercase Letter 'A' (Navy to Teal Gradient) -->
  <g id="letterA" filter="url(#shadowA)">
    <!-- 
      Geometric Vector Path for the letter 'A':
      Apex at (256, 102).
      Left leg base at (126, 420).
      Right leg base at (386, 420).
      Inner triangle apex at (256, 188).
    -->
    <path d="
      M 241,104
      C 247,95 265,95 271,104
      L 386,410
      C 391,419 384,422 374,422
      L 328,422
      C 320,422 314,417 311,409
      L 288,344
      L 224,344
      L 201,409
      C 198,417 192,422 184,422
      L 138,422
      C 128,422 121,419 126,410
      Z
      M 256,192
      L 235,274
      L 277,274
      Z"
      fill="url(#letterAGradient)"
      fill-rule="evenodd"
    />
  </g>

  <!-- Flowing Cyan and Turquoise Wind / Current Swooshes Crossing the A -->
  <g id="windCurrents" filter="url(#shadowWind)">
    <!-- Primary Clean Air Swoosh -->
    <path d="
      M 74,324
      C 134,296 200,266 268,260
      C 334,254 394,232 444,208
      C 402,230 334,272 268,280
      C 198,288 132,320 74,324
      Z"
      fill="url(#windSwooshGrad)"
    />

    <!-- Secondary Parallel Laminar Streamline -->
    <path d="
      M 106,348
      C 162,326 222,300 286,294
      C 342,288 392,270 424,252
      C 390,268 338,298 284,304
      C 220,312 160,340 106,348
      Z"
      fill="url(#windStreamGrad)"
      opacity="0.9"
    />

    <!-- Subtle Upper Air Current Whisps -->
    <path d="
      M 148,272
      C 188,252 232,240 274,238
      C 314,236 348,226 376,216
      C 346,224 312,232 274,233
      C 232,235 188,248 148,272
      Z"
      fill="#22D3EE"
      opacity="0.65"
    />
  </g>

  <!-- Two Elegant Green Leaves (Upper-Right Shoulder of the A) -->
  <g id="botanicalLeaves" filter="url(#shadowLeaf)">
    <!-- Leaf 1: Primary Large Upright Leaf -->
    <g transform="translate(306, 84)">
      <!-- Leaf Outer Body -->
      <path d="
        M 16,66
        C 22,44 42,22 84,10
        C 86,38 72,68 40,82
        C 26,88 18,80 16,66
        Z"
        fill="url(#leafGradMain)"
      />
      <!-- Leaf Delicate Central Spine Vein -->
      <path d="
        M 22,64
        C 38,48 58,32 78,16"
        fill="none"
        stroke="#E6FFFA"
        stroke-width="2.5"
        stroke-linecap="round"
        opacity="0.75"
      />
    </g>

    <!-- Leaf 2: Secondary Graceful Outward Leaf -->
    <g transform="translate(322, 126)">
      <!-- Leaf Outer Body -->
      <path d="
        M 10,40
        C 20,22 52,14 80,18
        C 74,44 46,62 18,52
        C 12,50 8,46 10,40
        Z"
        fill="url(#leafGradSecondary)"
      />
      <!-- Leaf Delicate Spine Vein -->
      <path d="
        M 16,39
        C 34,31 52,24 72,21"
        fill="none"
        stroke="#E6FFFA"
        stroke-width="2"
        stroke-linecap="round"
        opacity="0.75"
      />
    </g>
  </g>

  <!-- Polished High-Tech Accent Spark: Subtle White/Cyan Glint at Wind Inception -->
  <circle cx="268" cy="270" r="3.5" fill="#FFFFFF" opacity="0.8"/>
</svg>`;

// Helper to assemble standard Windows/Web Multi-Resolution ICO format
function createIcoFromPngBuffers(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO Type
  header.writeUInt16LE(count, 4); // Count of images

  const entries = [];
  for (const img of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Colors in palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.data.length, 8); // Image size
    entry.writeUInt32LE(offset, 12); // Offset
    offset += img.data.length;
    entries.push(entry);
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((img) => img.data)]);
}

async function generateAllAssets() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('1. Writing primary scalable SVG: public/aerowise-icon.svg...');
  fs.writeFileSync(path.join(publicDir, 'aerowise-icon.svg'), svgContent, 'utf-8');

  // Also write favicon.svg so modern browsers can load SVG favicons directly
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');

  const svgBuffer = Buffer.from(svgContent);

  console.log('2. Generating PNG raster assets using sharp...');
  const sizes = [
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  const generatedPngs = {};

  for (const { name, size } of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, name), pngBuffer);
    generatedPngs[size] = pngBuffer;
    console.log(`   ✓ public/${name} (${size}x${size}, ${pngBuffer.length} bytes)`);
  }

  console.log('3. Assembling standard multi-resolution public/favicon.ico (16px, 32px, 48px)...');
  const icoData = createIcoFromPngBuffers([
    { width: 16, height: 16, data: generatedPngs[16] },
    { width: 32, height: 32, data: generatedPngs[32] },
    { width: 48, height: 48, data: generatedPngs[48] },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData);
  console.log(`   ✓ public/favicon.ico assembled (${icoData.length} bytes)`);

  // Also copy favicon.ico and icon.svg to src/app/ for App Router conventions
  const appDir = path.resolve('src/app');
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoData);
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf-8');
  console.log('   ✓ src/app/favicon.ico and src/app/icon.svg synced for App Router');

  console.log('All brand favicon & logo assets generated successfully!');
}

generateAllAssets().catch((err) => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
