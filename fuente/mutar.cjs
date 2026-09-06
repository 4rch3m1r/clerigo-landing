/** Rompe la version clara a proposito y comprueba que el validador lo ve. */
const RAIZ = require("node:path").join(__dirname, "..");
const fs=require('fs'), {execFileSync}=require('child_process');
const CLARO=require('node:path').join(RAIZ,'index.html');
const bueno=fs.readFileSync(CLARO);

/* Antes de romper nada, la pagina tiene que estar VERDE.
 *
 * Sin esto la prueba miente: si el validador ya venia fallando por cualquier
 * otro motivo, las once mutaciones salen «detectadas» sin que nadie las haya
 * mirado, y encima el motivo que se imprime es el fallo de antes. Paso de
 * verdad al reapuntar los enlaces de la portada. */
function pasa(){
  try { execFileSync('node',['validar.cjs'],{cwd:__dirname,encoding:'utf8'}); return {ok:true,salida:''}; }
  catch(e){ return {ok:false,salida:e.stdout||''}; }
}
const limpio=pasa();
if(!limpio.ok){
  console.error('\n  index.html no esta en verde: romperlo no demostraria nada.');
  console.error('  Deja el validador en TODO PASA y vuelve.\n');
  console.error((limpio.salida.match(/^  MAL .*/gm)||[]).join('\n'));
  process.exit(1);
}

const MUTANTES=[
  ['cambiar un relleno',        s=>s.replace('padding: 0 48px;','padding: 0 44px;')],
  ['cambiar un texto visible',  s=>s.replace('no tiene que ser','no tiene que serr')],
  ['cambiar un nombre de clase',s=>s.replace('class="nav-links"','class="nav-linkss"')],
  ['quitar una seccion',        s=>s.replace('<section id="how"','<div id="how"')],
  ['dejar un fondo oscuro',     s=>s.replace('--dark-2: #F7F8F9;','--dark-2: #141414;')],
  ['romper una animacion',      s=>s.replace('@keyframes','@keyframez')],
  ['quitar un enlace',          s=>s.replace('<a href="#solution">','<span href="#solution">')],
  ['cambiar un desenfoque',     s=>s.replace('0 8px 32px','0 8px 20px')],
  ['dejar texto casi blanco',   s=>s.replace('color:rgba(22,24,28,0.85)','color:rgba(240,240,240,0.8)')],
  ['dejar una flecha de texto', s=>s.replace('Más información <svg','Más información → <svg')],
  ['dejar una estrella de texto',s=>s.replace('<span class="star"><svg','<span class="star">★<svg')],
];

let visto=0;
for (const [nombre,romper] of MUTANTES){
  fs.writeFileSync(CLARO, romper(bueno.toString('utf8')));
  let salida='', codigo=0;
  try { salida=execFileSync('node',['validar.cjs'],{cwd:__dirname,encoding:'utf8'}); }
  catch(e){ salida=e.stdout||''; codigo=e.status; }
  const lo=codigo!==0;
  if(lo) visto++;
  const cual=(salida.match(/^  MAL .*/gm)||[]).map(l=>l.slice(6).split('  ·')[0]);
  console.log((lo?'  LO VE  ':'  SE LE ESCAPA  ')+nombre+(lo?'  →  '+cual.join(' / ').slice(0,90):''));
}
fs.writeFileSync(CLARO,bueno);
console.log('\n'+visto+'/'+MUTANTES.length+' mutaciones detectadas · fichero restaurado');
process.exitCode = visto===MUTANTES.length?0:1;
