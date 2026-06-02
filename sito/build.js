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
  encodeURI,
};

const template = fs.readFileSync(path.join(dir, 'template.ejs'), 'utf8');
const html     = ejs.render(template, data, { filename: path.join(dir, 'template.ejs') });

fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
console.log('✓  index.html generato');
