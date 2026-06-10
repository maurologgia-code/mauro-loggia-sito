const ejs  = require('ejs');
const fs   = require('fs');
const path = require('path');

const dir     = __dirname;
const content = path.join(dir, 'content');

const data = {
  hero:        JSON.parse(fs.readFileSync(path.join(content, 'hero.json'),        'utf8')),
  chiSono:     JSON.parse(fs.readFileSync(path.join(content, 'chi-sono.json'),    'utf8')),
  servizi:     JSON.parse(fs.readFileSync(path.join(content, 'servizi.json'),     'utf8')),
  esperienza:  JSON.parse(fs.readFileSync(path.join(content, 'esperienza.json'),  'utf8')),
  portfolio:   JSON.parse(fs.readFileSync(path.join(content, 'portfolio.json'),   'utf8')),
  galleria:    JSON.parse(fs.readFileSync(path.join(content, 'galleria.json'),    'utf8')),
  discografia: JSON.parse(fs.readFileSync(path.join(content, 'discografia.json'), 'utf8')),
  stampa:      JSON.parse(fs.readFileSync(path.join(content, 'stampa.json'),      'utf8')),
  contatti:    JSON.parse(fs.readFileSync(path.join(content, 'contatti.json'),    'utf8')),
  impostazioni:JSON.parse(fs.readFileSync(path.join(content, 'impostazioni.json'),'utf8')),
  encodeURI,
};

/* Pagine da generare: file template .ejs -> file .html in output */
const pages = [
  { template: 'template.ejs',    output: 'index.html'       },
  { template: 'galleria.ejs',    output: 'galleria.html'    },
  { template: 'esperienza.ejs',  output: 'esperienza.html'  },
  { template: 'discografia.ejs', output: 'discografia.html' },
  { template: 'documento.ejs',   output: 'documento.html'   },
];

/* ------------------------------------------------------------------ *
 * Ottimizzazione automatica delle immagini (best-effort).
 * Ridimensiona a max 2000px e ricomprime le immagini caricate troppo
 * grandi (es. dal CMS). Se 'sharp' non è disponibile, salta senza errori.
 * ------------------------------------------------------------------ */
async function optimizeImages() {
  let sharp;
  try { sharp = require('sharp'); }
  catch { console.log('· sharp non disponibile: ottimizzazione immagini saltata'); return; }

  const imgDir = path.join(dir, 'images');
  if (!fs.existsSync(imgDir)) return;
  const exts = ['.jpg', '.jpeg', '.png'];
  const files = fs.readdirSync(imgDir).filter(f => exts.includes(path.extname(f).toLowerCase()));
  const MAX = 2000;
  let count = 0;

  for (const f of files) {
    const file = path.join(imgDir, f);
    try {
      const input = fs.readFileSync(file);
      const meta = await sharp(input).metadata();
      if (!meta.width || !meta.height) continue;
      if (Math.max(meta.width, meta.height) <= MAX) continue; // già leggera

      let pipe = sharp(input).resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });
      const ext = path.extname(f).toLowerCase();
      if (ext === '.png') pipe = pipe.png({ compressionLevel: 9, palette: true });
      else                pipe = pipe.jpeg({ quality: 80, mozjpeg: true });

      const out = await pipe.toBuffer();
      if (out.length < input.length) {        // scrivi solo se più leggera
        fs.writeFileSync(file, out);
        count++;
        console.log(`· ottimizzata ${f} (${Math.round(input.length/1024)}KB → ${Math.round(out.length/1024)}KB)`);
      }
    } catch (e) {
      console.log(`· salto ${f}: ${e.message}`);
    }
  }
  console.log(`· immagini ottimizzate: ${count}`);
}

function renderPages() {
  const maintenance = !!(data.impostazioni && data.impostazioni.maintenance);
  if (maintenance) {
    const maint = fs.readFileSync(path.join(dir, 'maintenance.html'), 'utf8');
    pages.forEach(({ output }) => {
      fs.writeFileSync(path.join(dir, output), maint, 'utf8');
      console.log(`⚠  ${output} → pagina di manutenzione`);
    });
    console.log('⚠  MODALITÀ MANUTENZIONE ATTIVA');
  } else {
    pages.forEach(({ template, output }) => {
      const src  = fs.readFileSync(path.join(dir, template), 'utf8');
      const html = ejs.render(src, data, { filename: path.join(dir, template) });
      fs.writeFileSync(path.join(dir, output), html, 'utf8');
      console.log(`✓  ${output} generato`);
    });
  }
}

(async () => {
  await optimizeImages();
  renderPages();
})();
