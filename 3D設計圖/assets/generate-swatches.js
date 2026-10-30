'use strict';
const fs = require('node:fs');
const path = require('node:path');
const colors = {stone:'#757e7a',plaster:'#e6ded0',wood:'#70513b',roof:'#3e535d',glow:'#e9e7c6',soil:'#5d4734',sand:'#c6bf9e',bamboo:'#6c8b47'};
for (const [id,color] of Object.entries(colors)) {
  let lines = '';
  if (id === 'stone') {
    for (let y=0;y<128;y+=32) {
      lines += `<path d="M0 ${y}H128"/>`;
      for (let x=y%64?16:0;x<128;x+=48) lines += `<path d="M${x} ${y}v32"/>`;
    }
  } else if (id === 'roof') {
    for (let x=0;x<128;x+=12) lines += `<path d="M${x} 0v128"/>`;
  } else if (id === 'wood' || id === 'bamboo') {
    for (let x=0;x<128;x+=11) lines += `<path d="M${x} 0q12 64 0 128"/>`;
  } else {
    for (let x=3;x<128;x+=13) for (let y=3;y<128;y+=17) lines += `<circle cx="${x}" cy="${y}" r="1"/>`;
  }
  fs.writeFileSync(path.join(__dirname,`${id}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="${color}"/><g stroke="#1b242a" stroke-opacity=".25" fill="none" stroke-width="2">${lines}</g></svg>`);
}
console.log('Generated eight original SVG material swatches.');
