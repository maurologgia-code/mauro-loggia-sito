const ejs  = require('ejs');
const fs   = require('fs');
const path = require('path');

const dir     = __dirname;
const content = path.join(dir, 'content');

const data = {
  hero:       JSON.parse(fs.readFileSync(path.join(content, 'hero.json'),       'utf8')),
  chiSono:    JSON.parse(fs.readFileSync(path.join(content, 'chi-sono.json'),   'utf8')),
  servizi:    JSON.parse(fs.readFileSync(path.join(content, 'servizi.json'),    'utf8')),
  esperienza: JSON.parse(fs.readFileSync(path.join(content, 'esperienza.json'),'utf8')),
  portfolio:  JSON.parse(fs.readFileSync(path.join(content, 'portfolio.json'), 'utf8')),
  galleria:   JSON.parse(fs.readFileSync(path.join(content, 'galleria.json'),  'utf8')),
  stampa:     JSON.parse(fs.readFileSync(path.join(content, 'stampa.json'),    'utf8')),
  impostazioni: JSON.parse(fs.readFileSync(path.join(content, 'impostazioni.json'), 'utf8')),
  encodeURI,
};

/* Pagine da generare: file template .ejs -> file .html in output */
const pages = [
  { template: 'template.ejs',   output: 'index.html'      },
  { template: 'galleria.ejs',   output: 'galleria.html'   },
  { template: 'esperienza.ejs', output: 'esperienza.html' },
  { template: 'documento.ejs',  output: 'documento.html'  },
];

pages.forEach(({ template, output }) => {
  const src  = fs.readFileSync(path.join(dir, template), 'utf8');
  const html = ejs.render(src, data, { filename: path.join(dir, template) });
  fs.writeFileSync(path.join(dir, output), html, 'utf8');
  console.log(`✓  ${output} generato`);
});
