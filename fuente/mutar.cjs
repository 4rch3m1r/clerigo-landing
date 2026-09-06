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
  /* Las fotos del sistema. La etiqueta sola no vale: con og.png ya pasó que
     apuntaba a un fichero que no existía y nadie se enteró. */
  ['apuntar una foto a un fichero que no está', s=>s.replace('sistema/sistema-panel.png','sistema/sistema-inventado.png')],
  ['quitarle la descripcion a una foto',   s=>s.replace(/alt="Resumen General de[^"]*"/,'alt=""')],
  ['quitar la galeria de pantallas',        s=>s.replace('<div class="galeria-sistema">','<div class="galeria-quitada">')],
  ['cargar la galeria de golpe',            s=>s.replace(/ loading="lazy"/g,'')],
  /* El panel del hero. Las tres rompen algo que no se nota mirando: la página
     queda entera y lo único que cambia es lo que dice de sí misma. */
  ['devolver el rotulo viejo del panel',
    s=>s.replace('ECOSISTEMA DE NIVEL ENTERPRISE','Nuestras Certificaciones')],
  ['quitar la segunda linea del rotulo',
    s=>s.replace(/<span class="cert-panel-sub">[^<]*<\/span>/,'')],
  ['quitar uno de los cuatro sellos',
    s=>s.replace('<div class="cert-logo-item">','<div class="cert-logo-quitado">')],
  /* Y esta cuarta existe por otro motivo, que conviene entender antes de
     tocarla. Las tres de arriba las caza la comprobacion de PRESENCIA —cuatro
     sellos, rotulo nuevo—, no la comparacion linea por linea. Asi que si
     alguien volviera a recortar el panel antes de comparar, la comparacion
     dejaria de mirar el panel entero y las tres seguirian saliendo «LO VE»:
     el validador diria TODO PASA y esto 18/18, con el panel sin comparar.
     Medido: pasa exactamente eso.
     Esta cambia texto de DENTRO del panel que ninguna comprobacion de
     presencia mira. Solo la puede cazar la comparacion. Con el recorte
     puesto SE LE ESCAPA; sin el, LO VE. Es la guarda de que el panel se
     sigue comparando de verdad. */
  ['cambiar el nombre de un sello',
    s=>s.replace('cert-logo-name">SOC 2 Type II','cert-logo-name">SOC 9 Type XX')],
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
