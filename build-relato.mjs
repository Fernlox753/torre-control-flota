import { readFile, writeFile, copyFile } from 'node:fs/promises';
// El relato solo depende de Three.js r128, servido desde assets/vendor.
// Se inserta la fuente de datos en la publicación sin cambiar sus valores.
const data = JSON.parse(await readFile('assets/data/cierre-2026-08.json','utf8'));
const source = await readFile('src/relato.js','utf8');
const marker = 'import DATA from "../assets/data/cierre-2026-08.json";';
if(!source.includes(marker)) throw new Error('Falta la importación de datos del relato');
await writeFile('assets/build/relato.js',source.replace(marker,`var DATA = ${JSON.stringify(data)};`));
await copyFile('src/relato.html','index.html');
await copyFile('src/relato.css','assets/build/relato.css');
console.log('Recorrido visual reconstruido en index.html');
