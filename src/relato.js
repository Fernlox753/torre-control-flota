
import DATA from "../assets/data/cierre-2026-08.json";
(function(){
"use strict";

/* ══════════════════════════════════════════════════════════════════
   0 · utilidades
   ══════════════════════════════════════════════════════════════════ */
var $ = function(id){ return document.getElementById(id); };
/* La misma logica sirve a la pagina unica del Artifact y a las paginas
   sueltas del sitio publicado, donde falta casi todo el marcado.        */
var txt = function(id, v){ var e = $(id); if(e) e.textContent = v; return e; };
var htm = function(id, v){ var e = $(id); if(e) e.innerHTML = v; return e; };
var cls = function(id, v){ var e = $(id); if(e) e.className = v; return e; };
var att = function(id, a, v){ var e = $(id); if(e) e.setAttribute(a, v); return e; };
var esc_ = function(id, ev, fn){ var e = $(id); if(e) e.addEventListener(ev, fn); return e; };
var fmt  = function(n){ return Math.round(n).toLocaleString('es-PE'); };
var fmtK = function(n){
  return n >= 1e6 ? (n/1e6).toFixed(2) + ' MM'
       : n >= 1000 ? Math.round(n/1000) + ' k'
       : Math.round(n);
};
var lerp = function(a,b,t){ return a + (b-a)*t; };
var clamp = function(v,a,b){ return v<a?a:v>b?b:v; };
var css = function(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); };
var esc = function(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };

var REDUCIR = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var MOVIL   = !!(window.matchMedia && window.matchMedia('(max-width: 820px)').matches);

/* ══════════════════════════════════════════════════════════════════
   1 · marca — logotipo corporativo oficial de San Martin
   ══════════════════════════════════════════════════════════════════ */
var LOGO_ISO = 'data:image/png;base64,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';
var LOGO_WORD = 'data:image/png;base64,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';
['iso-nav','iso-pie'].forEach(function(id){ var e = $(id); if(e) e.src = LOGO_ISO; });
['word-nav','word-pie'].forEach(function(id){ var e = $(id); if(e) e.src = LOGO_WORD; });

/* ══════════════════════════════════════════════════════════════════
   2 · datos derivados (nada inventado: todo sale de DATA)
   ══════════════════════════════════════════════════════════════════ */
var EQ = DATA.equipos, FAM = DATA.familias, FASES = DATA.fases, SD = DATA.sysdesc;
var ART = DATA.articulos || [], PROV = DATA.prov || [];
var byId = {}; EQ.forEach(function(e){ byId[e.id] = e; });

var TOTAL     = FAM.reduce(function(a,f){ return a+f.tot; }, 0);
var N_FLOTA   = DATA.n_equipos || FAM.reduce(function(a,f){ return a+f.eq; }, 0);
var N_SISTEMA = Object.keys(SD).length;
var N_OT      = 225197;                       /* del cierre OFA, igual que la nota metodologica */
var MAX_EQ    = Math.max.apply(null, FAM.map(function(f){ return f.eq; }));
var TOT_AV    = EQ.reduce(function(a,e){ return a+e.av; }, 0);
var DISP_PROM = EQ.reduce(function(a,e){ return a+e.disp; }, 0) / EQ.length;
var FAM_ACA   = FAM.filter(function(f){ return f.n === 'ACARREO'; })[0];
var FASE_TOP  = FASES[0];

var extra = 0, movHoy = 118, vivo = true, seg = 0;

function estado(e){
  return e.disp >= 93 ? ['ok','Operativo'] : e.disp >= 86 ? ['at','En atención'] : ['pa','Parado'];
}
function nivelCalor(v, max){
  if(!v) return 0;
  var p = Math.pow(v/max, 0.6);
  return p > 0.62 ? 4 : p > 0.34 ? 3 : p > 0.14 ? 2 : 1;
}
function varCalor(v,max){ return 'var(--h' + nivelCalor(v,max) + ')'; }
function hexCalor(v,max){ return css('--h' + nivelCalor(v,max)) || '#888888'; }

/* ══════════════════════════════════════════════════════════════════
   3 · capitulo 00 — cifras maestras (contadores)
   ══════════════════════════════════════════════════════════════════ */
var contadores = [];
function contar(el, destino, dec, suf, pre){
  if(!el) return;
  var texto = (pre||'') + (dec ? destino.toFixed(dec) : fmt(destino)) + (suf||'');
  if(REDUCIR){ el.textContent = texto; return; }   /* sin movimiento: la cifra ya esta */
  contadores.push({ el:el, a:0, b:destino, t:0, dec:dec||0, suf:suf||'', pre:pre||'', hecho:false });
}
function pasoContadores(dt){
  var activos = false;
  for(var i=0;i<contadores.length;i++){
    var c = contadores[i];
    if(c.hecho) continue;
    c.t = Math.min(1, c.t + dt/1500);
    var p = 1 - Math.pow(1 - c.t, 3);
    var v = c.b * p;
    c.el.textContent = c.pre + (c.dec ? v.toFixed(c.dec) : fmt(v)) + c.suf;
    if(c.t >= 1) c.hecho = true; else activos = true;
  }
  return activos;
}

/* ══════════════════════════════════════════════════════════════════
   4 · capitulo 01 — mosaico de familias (ancho = costo, alto = flota)
   ══════════════════════════════════════════════════════════════════ */
function pintarMosaico(){
  if(!$('mosaico')) return;
  var tonos = ['#25498E','#2B5AA8','#2FA8DF','#3C6BC0','#1E7CC0','#5D89C7','#7FA6D4'];
  $('mosaico').innerHTML = FAM.map(function(f, i){
    var wp = f.tot / TOTAL * 100;
    var hp = Math.max(9, f.eq / MAX_EQ * 100);
    return '<div class="fam ' + (wp >= 9 ? 'ancha' : 'angosta') + '" '
      + 'style="flex:' + wp.toFixed(3) + ' 1 0; --w:' + wp.toFixed(1) + '%; --h:' + hp.toFixed(1) + '%">'
      + '<div class="rotulo"><span class="nm">' + esc(f.n) + '</span>'
      +   '<span class="dt">S/ ' + fmtK(f.tot) + ' · ' + wp.toFixed(1) + '%</span>'
      +   '<span class="eq">' + fmt(f.eq) + ' equipos</span></div>'
      + '<div class="slab" style="background:' + tonos[i % tonos.length] + '"></div>'
      + '</div>';
  }).join('');
}

/* ══════════════════════════════════════════════════════════════════
   5 · capitulo 02 — fases y articulos
   ══════════════════════════════════════════════════════════════════ */
function pintarFases(){
  if(!$('fases')) return;
  var max = FASES[0].v;
  $('fases').innerHTML = FASES.map(function(f, i){
    return '<div class="fase' + (i===0 ? ' top' : '') + '">'
      + '<div class="nm">' + esc(f.n) + '</div>'
      + '<div class="via" style="--w:' + (f.v/max*100).toFixed(1) + '%"><i></i></div>'
      + '<div class="vl">' + fmt(f.v) + '</div>'
      + '<div class="pc">' + (f.v/TOTAL*100).toFixed(1) + '%</div>'
      + '</div>';
  }).join('');
}
function pintarArticulos(){
  if(!$('articulos')) return;
  $('articulos').innerHTML = ART.slice(0,5).map(function(a){
    return '<div class="fila"><span class="a">' + esc(a.n) + '</span>'
         + '<span class="b">S/ ' + fmt(a.v) + '</span></div>';
  }).join('');
}
function pintarListas(){
  function lista(el, arr, max){
    if(!el) return;
    el.innerHTML = arr.map(function(a, i){
      return '<div class="it"><span class="i">' + String(i+1).padStart(2,'0') + '</span>'
        + '<span class="n">' + esc(a.n) + '</span>'
        + '<span class="v">S/ ' + fmt(a.v) + '</span>'
        + '<span class="barra" style="--w:' + (a.v/max*100).toFixed(1) + '%"><i></i></span></div>';
    }).join('');
  }
  if(ART.length)  lista($('lista-art'),  ART,  ART[0].v);
  if(PROV.length) lista($('lista-prov'), PROV, PROV[0].v);
}

/* ══════════════════════════════════════════════════════════════════
   6 · capitulo 03 — ticker y flujo en vivo
   ══════════════════════════════════════════════════════════════════ */
function pintarTicker(){
  if(!$('pista')) return;
  var its = [];
  FASES.slice(0,6).forEach(function(f){
    its.push('<span class="it"><b>' + esc(f.n) + '</b> S/ ' + fmt(f.v)
      + ' <em>' + (f.v/TOTAL*100).toFixed(1) + '%</em></span>');
  });
  FAM.slice(0,4).forEach(function(f){
    its.push('<span class="it"><b>' + esc(f.n) + '</b> ' + fmt(f.eq) + ' EQUIPOS · S/ ' + fmtK(f.tot) + '</span>');
  });
  EQ.slice(0,4).forEach(function(e){
    its.push('<span class="it"><b>' + esc(e.id) + '</b> ' + esc(e.mod||e.fam) + ' · S/ ' + fmt(e.tot) + '</span>');
  });
  var uno = its.join('');
  $('pista').innerHTML = uno + uno;
}

var ACC = ['Salida de almacén','Conformidad de servicio','Imputación de horas','Devolución a almacén'];
function nuevoMovimiento(){
  var e = EQ[Math.floor(Math.random() * Math.min(EQ.length, 24))];
  var s = e.sys.length ? e.sys[Math.floor(Math.random() * Math.min(e.sys.length, 8))] : {c:'IN', n:'INDIRECTOS'};
  var monto = Math.round((300 + Math.random()*Math.random()*22000) / 10) * 10;
  var acc = ACC[Math.floor(Math.random() * (Math.random() < 0.7 ? 2 : ACC.length))];
  extra += monto; movHoy++;
  var f = $('flujo');
  if(!f){ pintarPulso(); return; }
  var d = document.createElement('div');
  d.className = 'mov';
  d.innerHTML = '<span class="q"></span><span class="m"></span><span class="t"></span>';
  d.children[0].textContent = e.id + '  ' + s.c;
  d.children[1].textContent = 'S/ ' + fmt(monto);
  d.children[2].textContent = acc + ' — ' + s.n;
  f.insertBefore(d, f.firstChild);
  while(f.children.length > 34) f.removeChild(f.lastChild);
  f.scrollTop = 0;
  pintarPulso();
}
function pintarPulso(){
  txt('p-mov',  fmt(movHoy));
  txt('p-acum', 'S/ ' + fmt(TOTAL + extra));
  txt('p-disp', DISP_PROM.toFixed(1) + '%');
  txt('p-av',   fmt(TOT_AV));
}

/* ══════════════════════════════════════════════════════════════════
   7 · capitulo 04 — tabla de equipos, con filtro por familia
   ══════════════════════════════════════════════════════════════════ */
var filtroFam = 'TODAS';
function pintarFiltros(){
  if(!$('filtros')) return;
  var fams = ['TODAS'];
  EQ.forEach(function(e){ if(fams.indexOf(e.fam) < 0) fams.push(e.fam); });
  $('filtros').innerHTML = fams.map(function(f){
    var n = f === 'TODAS' ? EQ.length : EQ.filter(function(e){ return e.fam === f; }).length;
    return '<button class="filtro" data-f="' + esc(f) + '" aria-pressed="' + (f===filtroFam) + '">'
      + esc(f) + ' <span style="opacity:.55">' + n + '</span></button>';
  }).join('');
  Array.prototype.forEach.call($('filtros').children, function(b){
    b.addEventListener('click', function(){
      filtroFam = b.getAttribute('data-f');
      Array.prototype.forEach.call($('filtros').children, function(o){
        o.setAttribute('aria-pressed', o === b);
      });
      pintarTabla();
    });
  });
}
function pintarTabla(){
  if(!$('tabla')) return;
  var lista = EQ.filter(function(e){ return filtroFam === 'TODAS' || e.fam === filtroFam; });
  $('tabla').innerHTML = lista.map(function(e, i){
    var st = estado(e);
    return '<tr data-eq="' + esc(e.id) + '" tabindex="0">'
      + '<td class="rank">' + String(i+1).padStart(2,'0') + '</td>'
      + '<td class="id">' + esc(e.id) + '</td>'
      + '<td>' + esc(e.fam) + '</td>'
      + '<td>' + esc(e.mod || '—') + '</td>'
      + '<td class="nn">' + fmt(e.mat) + '</td>'
      + '<td class="nn">' + fmt(e.srv) + '</td>'
      + '<td class="nn fuerte">' + fmt(e.tot) + '</td>'
      + '<td class="nn">' + e.cph.toFixed(0) + '</td>'
      + '<td class="nn">' + e.disp.toFixed(1) + '%</td>'
      + '<td><span class="estado ' + st[0] + '">' + st[1] + '</span></td>'
      + '</tr>';
  }).join('');
  Array.prototype.forEach.call($('tabla').children, function(tr){
    var abrir = function(){
      var id = tr.getAttribute('data-eq');
      var destino = $('c-maquina');
      if(destino){
        elegirEquipo(id);
        destino.scrollIntoView({ behavior: REDUCIR ? 'auto' : 'smooth', block:'start' });
      } else {
        location.href = 'maquina.html?eq=' + encodeURIComponent(id);
      }
    };
    tr.addEventListener('click', abrir);
    tr.addEventListener('keydown', function(ev){
      if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); abrir(); }
    });
  });
}

/* ══════════════════════════════════════════════════════════════════
   8 · el camion — geometria construida pieza a pieza
   ══════════════════════════════════════════════════════════════════ */
var HAY3D = (typeof THREE !== 'undefined');

/* paleta de materiales: librea de contratista sobre chasis de acero */
var PINTURA = '#AE7A18', PINTURA2 = '#8B6011', ACERO = '#2F3740', ACERO2 = '#414B56',
    CROMO = '#9AA6B2', CAUCHO = '#15191E', LLANTA_R = '#79848F', VIDRIO = '#142D40',
    AZUL = '#25498E', ROJO = '#95321F';

function crearEntorno(rend){
  var c = document.createElement('canvas'); c.width = 32; c.height = 32;
  var g = c.getContext('2d'), gr = g.createLinearGradient(0,0,0,32);
  gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.45, '#D6E1EC');
  gr.addColorStop(0.55, '#9FAEBC'); gr.addColorStop(1, '#5D6875');
  g.fillStyle = gr; g.fillRect(0,0,32,32);
  var tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  var pm = new THREE.PMREMGenerator(rend);
  pm.compileEquirectangularShader();
  var rt = pm.fromEquirectangular(tex);
  pm.dispose(); tex.dispose();
  return rt.texture;
}

function matMetal(hex, rug, met){
  var m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    roughness: rug === undefined ? 0.62 : rug,
    metalness: met === undefined ? 0.45 : met
  });
  m.envMapIntensity = 0.38;      /* el estudio ilumina, no lava el color */
  return m;
}
/* Constructor del camion rigido de acarreo.
   Proporciones de un camion minero real: 12.6 m de largo, 7.2 m de ancho,
   5.9 m de alto, llantas de 3.2 m de diametro. Todas las piezas llevan el
   codigo de sistema del maestro SAP, para que el mapa de costo caiga sobre
   la pieza que corresponde.
   fino=true  -> version inspeccionable del capitulo 05
   fino=false -> version ligera que circula por la rampa del tajo          */
var _texLabrado = null;
function texLabrado(){
  if(_texLabrado) return _texLabrado;
  var c = document.createElement('canvas'); c.width = 128; c.height = 32;
  var g = c.getContext('2d');
  g.clearRect(0,0,128,32);
  g.fillStyle = 'rgba(255,255,255,1)';
  for(var i=0; i<16; i++){
    var x = i*8;
    g.save(); g.translate(x,0); g.transform(1,0,-0.35,1,0,0);
    g.fillRect(1.6, -4, 4.4, 40);
    g.restore();
  }
  _texLabrado = new THREE.CanvasTexture(c);
  _texLabrado.wrapS = _texLabrado.wrapT = THREE.RepeatWrapping;
  return _texLabrado;
}

function construirCamion(fino, piezas){
  var G = new THREE.Group();
  var lados = fino ? 22 : 8;

  var caja = function(w,h,d){ return new THREE.BoxGeometry(w,h,d); };
  var cil  = function(r1,r2,h,s){ return new THREE.CylinderGeometry(r1,r2,h,s||lados); };
  var reg = function(code, malla, base){
    malla.userData.code = code || null;
    malla.userData.base = base || null;
    malla.userData.original = malla.position.clone();
    malla.userData.originalRotation = malla.rotation.z;
    malla.castShadow = fino; malla.receiveShadow = fino;
    G.add(malla);
    if(code && piezas) piezas.push(malla);
    return malla;
  };
  var poner = function(code, geo, hex, x,y,z, rot, rug, met){
    var m = new THREE.Mesh(geo, matMetal(hex, rug, met));
    m.position.set(x,y,z);
    if(rot) m.rotation.set(rot[0]||0, rot[1]||0, rot[2]||0);
    return reg(code, m, hex);
  };
  /* los camiones que circulan por la rampa se ven a 30 px: solo volumenes */
  var det = fino ? poner : function(){};
  /* extruye un perfil transversal (z,y) a lo largo del eje X */
  var extruir = function(pts, largo, xc, yc){
    var sh = new THREE.Shape();
    pts.forEach(function(p,i){ i ? sh.lineTo(p[0],p[1]) : sh.moveTo(p[0],p[1]); });
    sh.closePath();
    var g = new THREE.ExtrudeGeometry(sh, { depth:largo, bevelEnabled:false });
    g.rotateY(Math.PI/2);
    g.translate(xc - largo/2, yc, 0);
    return g;
  };

  /* ═══ bastidor ═══ */
  var perfilLarguero = [
    [-6.30,-0.34],[-5.10, 0.30],[-1.60, 0.62],[ 2.60, 0.62],[ 5.10, 0.24],
    [ 5.80,-0.12],[ 5.80,-0.60],[ 2.40,-0.86],[-1.80,-0.86],[-5.30,-0.62],[-6.30,-0.72]
  ];
  (function(){
    var sh = new THREE.Shape();
    perfilLarguero.forEach(function(p,i){ i ? sh.lineTo(p[0],p[1]) : sh.moveTo(p[0],p[1]); });
    sh.closePath();
    var g = new THREE.ExtrudeGeometry(sh, { depth:0.46, bevelEnabled:false });
    g.translate(0,0,-0.23);
    poner(null, g.clone(), ACERO, 0, 2.12, -1.45, null, 0.74, 0.72);
    poner(null, g.clone(), ACERO, 0, 2.12,  1.45, null, 0.74, 0.72);
  })();
  [-4.9,-2.6, 0.2, 2.8, 5.1].forEach(function(x){
    det(null, caja(0.36, 0.50, 2.95), ACERO2, x, 2.05, 0, null, 0.72, 0.62);
  });
  /* parachoques y contrapeso delantero */
  poner(null, caja(0.52, 1.05, 5.10), ACERO2, -6.30, 1.85, 0, null, 0.78, 0.6);
  det(null, caja(0.30, 0.60, 4.20), ACERO,  -6.58, 1.35, 0, null, 0.8, 0.55);

  /* ═══ tolva: seccion en V, paredes con espesor ═══ */
  var perfilTolva = [
    [-3.34, 2.85],[-3.34, 0.66],[-2.58,-0.56],[ 0.00,-1.02],[ 2.58,-0.56],
    [ 3.34, 0.66],[ 3.34, 2.85],[ 3.04, 2.85],[ 3.04, 0.74],[ 2.44,-0.30],
    [ 0.00,-0.72],[-2.44,-0.30],[-3.04, 0.74],[-3.04, 2.85]
  ];
  poner('TLV', extruir(perfilTolva, 9.55, 0.95, 3.62), PINTURA, 0,0,0, null, 0.52, 0.12);
  /* pared frontal inclinada y visera sobre la cabina */
  var frontal = new THREE.Mesh(caja(0.34, 3.35, 6.80), matMetal(PINTURA, 0.52, 0.12));
  frontal.position.set(-3.98, 4.22, 0); frontal.rotation.z = 0.10;
  reg('TLV', frontal, PINTURA);
  var visera = new THREE.Mesh(caja(2.45, 0.32, 6.80), matMetal(PINTURA, 0.52, 0.12));
  visera.position.set(-5.05, 6.12, 0); visera.rotation.z = -0.10;
  reg('TLV', visera, PINTURA);
  [-3.05, 3.05].forEach(function(z){
    poner(null, caja(0.16, 1.35, 0.16), PINTURA2, -4.30, 5.55, z, [0,0,0.14], 0.55, 0.14);
  });
  /* cola con eyector de roca */
  det('TLV', caja(0.60, 0.34, 6.30), PINTURA2, 5.72, 2.72, 0, [0,0,-0.34], 0.55, 0.12);

  if(fino){
    /* nervios exteriores y franja de la contratista */
    [-2.5,-0.7, 1.1, 2.9, 4.6].forEach(function(x){
      poner(null, caja(0.16, 1.95, 0.12), PINTURA2, x, 5.34, -3.38, null, 0.55, 0.12);
      poner(null, caja(0.16, 1.95, 0.12), PINTURA2, x, 5.34,  3.38, null, 0.55, 0.12);
    });
    poner(null, caja(8.9, 0.50, 0.07), AZUL, 0.95, 5.62, -3.42, null, 0.45, 0.1);
    poner(null, caja(8.9, 0.50, 0.07), AZUL, 0.95, 5.62,  3.42, null, 0.45, 0.1);
    poner(null, caja(8.9, 0.10, 0.09), '#12161B', 0.95, 6.32, -3.42, null, 0.7, 0.2);
    poner(null, caja(8.9, 0.10, 0.09), '#12161B', 0.95, 6.32,  3.42, null, 0.7, 0.2);
  }
  /* cilindros de levante, apoyados entre bastidor y tolva */
  if(fino) [-1.15, 1.15].forEach(function(z){
    var cu = new THREE.Mesh(cil(0.30,0.30,2.55,fino?14:6), matMetal(ACERO2, 0.5, 0.72));
    cu.position.set(-0.55, 2.62, z); cu.rotation.z = 0.72; reg('HLH', cu, ACERO2);
    var va = new THREE.Mesh(cil(0.17,0.17,1.60,fino?14:6), matMetal(CROMO, 0.16, 0.96));
    va.position.set(0.60, 3.75, z); va.rotation.z = 0.72; reg('HLH', va, CROMO);
  });

  /* ═══ trompa: motor a la derecha, cabina a la izquierda ═══ */
  poner('ENG1', caja(3.10, 2.05, 2.35), ACERO2, -5.05, 2.95, 1.15, null, 0.54, 0.68);
  det('ENG1', caja(2.70, 0.36, 0.70), ACERO,  -5.05, 4.10, 0.62, null, 0.48, 0.76);
  det('ENG1', caja(2.70, 0.36, 0.70), ACERO,  -5.05, 4.10, 1.68, null, 0.48, 0.76);
  poner('RAD1', caja(0.46, 2.55, 2.70), ACERO2, -6.36, 3.05, 1.10, null, 0.7, 0.55);
  det(null,   caja(0.16, 2.25, 2.40), CROMO,  -6.60, 3.05, 1.10, null, 0.4, 0.88);
  det('MFC1', new THREE.TorusGeometry(0.88, 0.11, 7, fino?22:8), ACERO,
        -5.98, 3.05, 1.10, [0, Math.PI/2, 0], 0.55, 0.7);
  det('MFC1', cil(0.26,0.26,0.40,fino?12:6), ACERO, -5.98, 3.05, 1.10, [0,0,Math.PI/2], 0.5, 0.8);
  det('TLH1', cil(0.28,0.21,0.62,fino?12:6), ACERO, -3.75, 3.95, 0.55, [0,0,Math.PI/2], 0.42, 0.86);
  det('TRH1', cil(0.28,0.21,0.62,fino?12:6), ACERO, -3.75, 3.95, 1.75, [0,0,Math.PI/2], 0.42, 0.86);
  det('INY1', caja(0.60,0.26,1.95), ACERO, -5.05, 3.62, 2.15, null, 0.5, 0.8);
  det('AL1',  cil(0.28,0.28,0.48,fino?12:6), ACERO, -6.05, 2.30, 2.00, [0,0,Math.PI/2], 0.44, 0.86);
  det('AR1',  cil(0.24,0.24,0.54,fino?12:6), ACERO, -6.05, 2.30, 0.30, [0,0,Math.PI/2], 0.44, 0.86);
  det('CMP',  caja(0.76,0.62,0.66), ACERO2, -3.55, 2.62, 2.15, null, 0.6, 0.6);
  det(null, caja(3.30, 1.70, 0.14), PINTURA, -5.05, 2.90, 2.42, null, 0.5, 0.12);
  det(null, caja(3.30, 0.16, 1.45), PINTURA, -5.05, 3.72, 2.42, null, 0.5, 0.12);
  /* chimeneas */
  [0.55, 1.75].forEach(function(z){
    det(null, cil(0.19,0.19,1.95,fino?12:6), ACERO, -3.62, 4.90, z, null, 0.55, 0.8);
  });

  /* ═══ cabina ═══ */
  poner('CBN', caja(2.20, 2.00, 2.10), PINTURA, -5.15, 4.42, -2.10, null, 0.46, 0.12);
  det('CBN', caja(2.60, 0.20, 2.50), ACERO2,  -5.15, 3.34, -2.10, null, 0.7, 0.52);
  var vidrioMat = new THREE.MeshStandardMaterial({
    color:new THREE.Color(VIDRIO), roughness:0.06, metalness:0.2,
    transparent:false, opacity:1 });
  if(fino){
    var vf = new THREE.Mesh(caja(0.08, 1.30, 1.78), vidrioMat);
    vf.position.set(-6.27, 4.62, -2.10); G.add(vf);
    var vl = new THREE.Mesh(caja(1.72, 1.20, 0.08), vidrioMat.clone());
    vl.position.set(-5.15, 4.62, -3.17); G.add(vl);
  }
  det('AAC', caja(1.05, 0.40, 1.00), ACERO2, -5.05, 5.62, -2.10, null, 0.6, 0.5);

  if(fino){
    /* espejo, plataforma y escalera de acceso */
    poner(null, cil(0.06,0.06,1.25,8), ACERO, -6.60, 5.30, -2.10, [0,0,Math.PI/2.3], 0.5, 0.8);
    poner(null, caja(0.06, 0.58, 0.38), ACERO, -7.02, 5.66, -2.10, null, 0.38, 0.86);
    poner(null, caja(2.20, 0.10, 0.85), ACERO2, -5.55, 3.28, -3.55, null, 0.76, 0.5);
    poner(null, caja(0.10, 1.05, 0.85), ACERO2, -4.50, 3.80, -3.55, null, 0.76, 0.5);
    for(var st=0; st<4; st++){
      poner(null, caja(0.72, 0.07, 0.16), ACERO2, -5.55, 2.62 - st*0.66, -3.62, null, 0.76, 0.5);
    }
    poner(null, cil(0.05,0.05,3.4,8), ACERO, -5.22, 1.75, -3.68, null, 0.5, 0.8);
    poner(null, cil(0.05,0.05,3.4,8), ACERO, -5.90, 1.75, -3.68, null, 0.5, 0.8);
    /* barandas sobre la plataforma del motor */
    [-4.10,-6.00].forEach(function(x){
      poner(null, cil(0.05,0.05,1.05,8), ACERO, x, 4.60, 3.30, null, 0.5, 0.8);
    });
    poner(null, cil(0.05,0.05,1.95,8), ACERO, -5.05, 5.10, 3.30, [0,0,Math.PI/2], 0.5, 0.8);
  }

  /* luces */
  var luzMat = function(){ return new THREE.MeshStandardMaterial({
    color:new THREE.Color('#F7ECC4'), roughness:0.2, metalness:0.1,
    emissive:new THREE.Color('#3E3818') }); };
  if(fino){
    [-2.35,-0.85, 0.85, 2.35].forEach(function(z){
      poner(null, caja(0.20,0.26,0.44), '#191E24', -5.98, 5.86, z, null, 0.7, 0.3);
      var l = new THREE.Mesh(caja(0.10,0.17,0.32), luzMat());
      l.position.set(-6.10, 5.86, z); reg('LSM', l, '#F7ECC4');
    });
    [-2.05, 2.85].forEach(function(z){
      poner(null, caja(0.16,0.40,0.54), '#191E24', -6.48, 2.42, z, null, 0.7, 0.3);
      poner('LSM', caja(0.10,0.28,0.40), '#F7ECC4', -6.58, 2.42, z, null, 0.2, 0.1);
    });
  }
  det('FPD', caja(0.18,0.26,0.34), ROJO, 5.90, 2.55, 2.60, null, 0.4, 0.2);
  det('FPD', caja(0.18,0.26,0.34), ROJO, 5.90, 2.55, -2.60, null, 0.4, 0.2);

  /* ═══ tren de fuerza ═══ */
  det('CON',  cil(0.60,0.60,1.05), ACERO2, -2.55, 1.62, 0, [0,0,Math.PI/2], 0.5, 0.75);
  det('TRM',  caja(2.75, 1.30, 1.55), ACERO2, -0.80, 1.55, 0, null, 0.52, 0.72);
  det('CAR',  cil(0.18,0.18,2.55,fino?12:6), CROMO, 1.30, 1.48, 0, [0,0,Math.PI/2], 0.3, 0.9);
  det('DIFP', new THREE.SphereGeometry(0.95, fino?18:8, fino?12:6), ACERO2, 2.98, 1.48, 0, null, 0.5, 0.72);
  det('DIFD', cil(0.48,0.48,0.80,fino?12:6), ACERO2, -3.60, 1.62, 0, [0,0,Math.PI/2], 0.55, 0.7);
  det(null,   cil(0.32,0.32,5.20,fino?12:6), ACERO, 2.98, 1.48, 0, [Math.PI/2,0,0], 0.6, 0.7);
  det('MLH',  cil(0.92,0.92,0.70,fino?16:8), ACERO2, 2.98, 1.48, -2.70, [Math.PI/2,0,0], 0.5, 0.72);
  det('MRH',  cil(0.92,0.92,0.70,fino?16:8), ACERO2, 2.98, 1.48,  2.70, [Math.PI/2,0,0], 0.5, 0.72);
  det('FDP',  cil(0.50,0.50,0.34,fino?12:6), ACERO, 2.10, 1.55, 0, [0,0,Math.PI/2], 0.5, 0.7);
  det('BPRH', cil(0.34,0.34,0.30,fino?10:6), ACERO, 2.98, 1.48, 3.35, [Math.PI/2,0,0], 0.55, 0.72);

  /* ═══ suspension y direccion ═══ */
  function amortiguador(code, x, z, incl){
    det(code, cil(0.30,0.30,1.85,fino?12:6), ACERO2, x, 2.55, z, [incl||0,0,0], 0.55, 0.7);
    det(null, cil(0.16,0.16,1.20,fino?12:6), CROMO,  x, 1.72, z, [incl||0,0,0], 0.16, 0.96);
  }
  amortiguador('SDI', -3.60, -2.70, 0.14);
  amortiguador('SDD', -3.60,  2.70,-0.14);
  amortiguador('SPI',  3.85, -2.75, 0.18);
  amortiguador('SPD',  3.85,  2.75,-0.18);
  det('SLH', cil(0.14,0.14,1.55,fino?10:6), CROMO, -2.95, 2.10, -2.10, [0,0.45,Math.PI/2], 0.2, 0.94);
  det('SRH', cil(0.14,0.14,1.55,fino?10:6), CROMO, -2.95, 2.10,  2.10, [0,-0.45,Math.PI/2], 0.2, 0.94);
  det('BMLH', cil(0.46,0.46,0.42,fino?12:6), ACERO, -3.60, 1.62, -2.20, [Math.PI/2,0,0], 0.55, 0.72);
  det('BMRH', cil(0.46,0.46,0.42,fino?12:6), ACERO, -3.60, 1.62,  2.20, [Math.PI/2,0,0], 0.55, 0.72);
  det('PYB', cil(0.12,0.12,0.46,fino?10:6), CROMO, -3.05, 1.72, -1.20, [0,0,Math.PI/2], 0.26, 0.92);

  /* ═══ servicios sobre el bastidor ═══ */
  det('TQH1', cil(0.66,0.66,2.55,fino?16:8), ACERO2, -1.55, 2.72, -2.25, [0,0,Math.PI/2], 0.55, 0.68);
  det('TQC1', cil(0.72,0.72,2.85,fino?16:8), ACERO2, -1.55, 2.72,  2.25, [0,0,Math.PI/2], 0.55, 0.68);
  det('SEN',  caja(0.82,0.66,0.64), ACERO2,  0.70, 2.72, -2.25, null, 0.6, 0.6);
  det('GP1',  cil(0.22,0.22,0.46,fino?10:6), ACERO, 1.42, 2.72, -2.25, [0,0,Math.PI/2], 0.5, 0.8);
  det('MLB',  caja(0.46,0.36,0.42), ACERO,   1.42, 2.72, -1.70, null, 0.5, 0.75);
  det('BAT',  caja(0.90,0.54,0.72), ACERO2,  0.70, 2.72,  2.25, null, 0.6, 0.55);
  det('SCI',  caja(0.62,0.66,0.52), ROJO,    1.95, 2.72,  2.25, null, 0.42, 0.24);
  det('SENS', caja(0.38,0.32,0.30), ACERO,   1.95, 2.72, -1.70, null, 0.5, 0.7);
  det('HPM',  cil(0.28,0.28,0.60,fino?10:6), ACERO, -2.45, 2.35, 1.55, [0,0,Math.PI/2], 0.44, 0.84);
  det('PTB1', caja(0.46,0.44,0.46), ACERO,   -3.05, 2.10, 1.10, null, 0.5, 0.75);
  det('CBR3', caja(0.44,0.56,0.34), ACERO2,   2.55, 2.42, -1.45, null, 0.62, 0.6);
  det('PHY',  cil(0.15,0.15,0.95,fino?10:6), CROMO, 3.55, 2.48, -1.45, [0,0,Math.PI/2], 0.2, 0.94);
  det('MAV',  caja(0.34,0.28,0.32), ACERO, 4.35, 2.35, -1.15, null, 0.55, 0.7);
  [-1.80, 1.80].forEach(function(z){
    det('LPH', cil(0.08,0.08,8.2,fino?8:5), '#2A3038', 0.0, 2.44, z, [0,0,Math.PI/2], 0.88, 0.15);
    det('LPH', cil(0.08,0.08,8.2,fino?8:5), '#2A3038', 0.0, 2.30, z, [0,0,Math.PI/2], 0.88, 0.15);
  });

  /* ═══ llantas: 505/95R29, 3.2 m de diametro ═══ */
  var perfilLl = [];
  [[0.62,-0.50],[0.76,-0.53],[1.10,-0.58],[1.40,-0.545],[1.555,-0.40],
   [1.615,-0.18],[1.63,0],[1.615,0.18],[1.555,0.40],[1.40,0.545],
   [1.10,0.58],[0.76,0.53],[0.62,0.50]].forEach(function(p){
    perfilLl.push(new THREE.Vector2(p[0], p[1]));
  });

  function rueda(code, x, z, ancho, ladoAfuera){
    var gT = new THREE.LatheGeometry(perfilLl, fino ? 64 : 12);
    gT.scale(1, ancho, 1);
    var t = new THREE.Mesh(gT, matMetal(CAUCHO, 0.94, 0.04));
    t.rotation.x = Math.PI/2;
    t.position.set(x, 1.63, z);
    t.userData.isLlanta = true;
    reg(code, t, CAUCHO);
    // Relieve real de la banda: 40 chevrones en cada neumático.
    if(fino){
      var tacoGeo = caja(0.22,0.095,ancho*0.49);
      var tacoMat = matMetal('#252B31',0.96,0.02);
      var tacos = new THREE.InstancedMesh(tacoGeo,tacoMat,80);
      var dummy = new THREE.Object3D();
      for(var it=0;it<40;it++){
        var theta=it/40*Math.PI*2;
        for(var side=0;side<2;side++){
          dummy.position.set(x+Math.sin(theta)*1.635,1.63+Math.cos(theta)*1.635,z+(side?1:-1)*ancho*0.25);
          dummy.rotation.set(0,(side?1:-1)*0.32,-theta);
          dummy.updateMatrix();tacos.setMatrixAt(it*2+side,dummy.matrix);
        }
      }
      tacos.instanceMatrix.needsUpdate=true;reg(code,tacos,'#252B31');
    }
    var aro = new THREE.Mesh(cil(0.72, 0.72, ancho*1.04, fino?18:7), matMetal(LLANTA_R, 0.4, 0.86));
    aro.rotation.x = Math.PI/2; aro.position.set(x, 1.63, z);
    aro.castShadow = fino; G.add(aro);
    if(fino && ladoAfuera){
      var lado = ladoAfuera;
      var hub = new THREE.Mesh(cil(0.32, 0.32, 0.12, 14), matMetal(ACERO, 0.5, 0.8));
      hub.rotation.x = Math.PI/2; hub.position.set(x, 1.63, z + lado*(ancho*0.55));
      G.add(hub);
      for(var b=0; b<8; b++){
        var a = b/8 * Math.PI*2;
        var pn = new THREE.Mesh(cil(0.06,0.06,0.09,6), matMetal(CROMO, 0.32, 0.92));
        pn.rotation.x = Math.PI/2;
        pn.position.set(x + Math.cos(a)*0.52, 1.63 + Math.sin(a)*0.52, z + lado*(ancho*0.56));
        G.add(pn);
      }
    }
  }
  rueda('LL1', -3.60, -2.72, 0.94, -1);
  rueda('LL2', -3.60,  2.72, 0.94,  1);
  rueda('LL3',  2.98, -3.30, 0.88, -1);
  rueda('LL4',  2.98, -2.22, 0.88,  0);
  rueda('LL5',  2.98,  2.22, 0.88,  0);
  rueda('LL6',  2.98,  3.30, 0.88,  1);

  if(fino){
    // Rejilla frontal, pasamanos y mangueras con curvatura continua.
    for(var gr=0;gr<12;gr++) poner('RAD1',caja(0.08,0.06,2.7),ACERO,-6.64,2.35+gr*0.13,0.5,null,0.7,0.55);
    [-3.05,3.05].forEach(function(z){
      for(var po=0;po<5;po++) poner(null,cil(0.045,0.045,0.85,8),ACERO,-6.25+po*0.5,4.18,z,null,0.5,0.6);
      poner(null,cil(0.045,0.045,2.05,8),ACERO,-5.25,4.6,z,[0,0,Math.PI/2],0.5,0.6);
      var curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-3,2.5,z*.65),new THREE.Vector3(-2.3,3.2,z*.65),new THREE.Vector3(-.5,3.4,z*.65),new THREE.Vector3(1.3,2.65,z*.65)]);
      poner('LPH',new THREE.TubeGeometry(curve,24,0.065,8,false),'#272D35',0,0,0,null,0.9,0.05);
    });
    // Vincular los refuerzos a la tolva para la vista de inspección.
    G.children.forEach(function(m){
      if(m.userData.code==='TLV' || (m.position.x>-3.8 && m.position.y>5 && Math.abs(m.position.z)>3.3)) m.userData.tolva=true;
      m.userData.original=m.position.clone();m.userData.originalRotation=m.rotation.z;
    });
  }

  return G;
}
/* ══════════════════════════════════════════════════════════════════
   9 · estudio 3D del capitulo 05
   ══════════════════════════════════════════════════════════════════ */
var rE, escE, camE, camion, piezas = [], rayE, punteroE, sobre = null;
var rotY = 2.35, rotX = 0.27, dist = 27, arrastra = false, ultX = 0, ultY = 0, gira = true;
var estudioVisible = false, modelo3d = true, modoPreferido = true;
var realista = false, inspeccion = false, desplazamientoPointer = 0;

function iniciarEstudio(){
  if(!$('lienzo-eq')) return;
  var cv = $('lienzo-eq');
  rE = new THREE.WebGLRenderer({ canvas:cv, antialias:true, alpha:true, powerPreference:'high-performance' });
  rE.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOVIL ? 1.5 : 2));
  rE.outputEncoding = THREE.sRGBEncoding;
  rE.toneMapping = THREE.ACESFilmicToneMapping;
  rE.toneMappingExposure = 1.08;
  rE.shadowMap.enabled = !MOVIL;
  rE.shadowMap.type = THREE.PCFSoftShadowMap;

  escE = new THREE.Scene();
  camE = new THREE.PerspectiveCamera(30, 1.6, 0.5, 160);
  var env = crearEntorno(rE);
  escE.environment = env;
  var borde = new THREE.DirectionalLight(0xBEDDFF,0.8);
  borde.position.set(-9,9,-10);escE.add(borde);

  escE.add(new THREE.HemisphereLight(0xEDF4FA, 0x6D7A87, 0.48));
  var key = new THREE.DirectionalLight(0xFFF6E8, 1.8);
  key.position.set(11, 15, 9);
  if(!MOVIL){
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 3;
    var c = key.shadow.camera;
    c.left = -13; c.right = 13; c.top = 13; c.bottom = -13; c.near = 4; c.far = 50;
    key.shadow.bias = -0.0012; key.shadow.normalBias = 0.03;
  }
  escE.add(key);
  var relleno = new THREE.DirectionalLight(0xB9D2EA, 0.62); relleno.position.set(-13, 6, -11);
  escE.add(relleno);
  if(!MOVIL){
    var catch_ = new THREE.Mesh(new THREE.PlaneGeometry(44, 44),
      new THREE.ShadowMaterial({ opacity:0.22 }));
    catch_.rotation.x = -Math.PI/2; catch_.position.y = 0.004;
    catch_.receiveShadow = true; escE.add(catch_);
  }

  /* suelo de estudio que se desvanece en los bordes */
  var cs = document.createElement('canvas'); cs.width = cs.height = 128;
  var gg = cs.getContext('2d'), rg = gg.createRadialGradient(64,64,10, 64,64,64);
  rg.addColorStop(0,'#ffffff'); rg.addColorStop(0.62,'#ffffff'); rg.addColorStop(1,'#000000');
  gg.fillStyle = rg; gg.fillRect(0,0,128,128);
  var alfa = new THREE.CanvasTexture(cs);
  var suelo = new THREE.Mesh(new THREE.CircleGeometry(21, 48),
    new THREE.MeshStandardMaterial({ color:0xFFFFFF, roughness:0.94, metalness:0,
      alphaMap:alfa, transparent:true }));
  suelo.rotation.x = -Math.PI/2; suelo.position.y = 0; suelo.receiveShadow = !MOVIL;
  escE.add(suelo);

  camion = construirCamion(true, piezas);
  camion.position.y = 0;
  escE.add(camion);

  rayE = new THREE.Raycaster(); punteroE = new THREE.Vector2();
  ajustarEstudio();

  cv.addEventListener('pointerdown', function(ev){
    desplazamientoPointer = 0;
    arrastra = true; ultX = ev.clientX; ultY = ev.clientY;
    cv.classList.add('arrastra');
    if(cv.setPointerCapture) try{ cv.setPointerCapture(ev.pointerId); }catch(e){}
  });
  var soltar = function(){ arrastra = false; cv.classList.remove('arrastra'); };
  cv.addEventListener('pointerup', soltar);
  cv.addEventListener('pointercancel', soltar);
  cv.addEventListener('pointerleave', function(){ soltar(); globo(null); });
  cv.addEventListener('pointermove', function(ev){
    if(arrastra){
      desplazamientoPointer += Math.abs(ev.clientX-ultX)+Math.abs(ev.clientY-ultY);
      rotY += (ev.clientX - ultX) * 0.0075;
      rotX = clamp(rotX + (ev.clientY - ultY) * 0.0045, -0.10, 0.92);
      ultX = ev.clientX; ultY = ev.clientY;
      gira = false; $('v-giro').setAttribute('aria-pressed','false');
      pedirCuadro();
    }
    var r = cv.getBoundingClientRect();
    punteroE.x = ((ev.clientX - r.left)/r.width)*2 - 1;
    punteroE.y = -((ev.clientY - r.top)/r.height)*2 + 1;
    probarSobre(ev.clientX - r.left, ev.clientY - r.top);
  });
  cv.addEventListener('wheel', function(ev){
    ev.preventDefault();
    dist = clamp(dist + (ev.deltaY > 0 ? 1.6 : -1.6), 16, 46);
    pedirCuadro();
  }, { passive:false });
  cv.addEventListener('click', function(ev){
    if(desplazamientoPointer>6) return;
    var rect=cv.getBoundingClientRect();
    punteroE.set((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1);
    probarSobre(ev.clientX-rect.left,ev.clientY-rect.top);
    if(sobre && sobre.userData.code) elegirSistema(sobre.userData.code);
  });
  cv.addEventListener('keydown',function(ev){
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','r','R'].includes(ev.key))return;
    ev.preventDefault();
    if(ev.key==='ArrowLeft')rotY-=0.2;
    if(ev.key==='ArrowRight')rotY+=0.2;
    if(ev.key==='ArrowUp')rotX=clamp(rotX+0.1,-0.1,0.92);
    if(ev.key==='ArrowDown')rotX=clamp(rotX-0.1,-0.1,0.92);
    if(ev.key==='+'||ev.key==='=')dist=clamp(dist-2,16,46);
    if(ev.key==='-')dist=clamp(dist+2,16,46);
    if(ev.key.toLowerCase()==='r'){rotY=2.35;rotX=0.27;dist=27;}
    gira=false;att('v-giro','aria-pressed',false);pedirCuadro();
  });

  var io = new IntersectionObserver(function(es){
    estudioVisible = es[0].isIntersecting;
    if(estudioVisible){ ajustarEstudio(); pedirCuadro(); }
  }, { rootMargin:'120px' });
  io.observe($('estudio'));
}
function ajustarEstudio(){
  if(!rE) return;
  var cv = $('lienzo-eq'), w = cv.clientWidth, h = cv.clientHeight;
  if(!w || !h) return;
  rE.setSize(w, h, false);
  camE.aspect = w/h; camE.updateProjectionMatrix();
}
function globo(contenido, x, y){
  var g = $('globo');
  if(!g) return;
  if(!contenido){ g.className = 'globo'; return; }
  g.innerHTML = contenido; g.className = 'globo on';
  g.style.left = x + 'px'; g.style.top = y + 'px';
}
function probarSobre(mx, my){
  if(!rayE || !camion || !estudioVisible) return;
  rayE.setFromCamera(punteroE, camE);
  var hits = rayE.intersectObjects(piezas, false);
  var h = hits.length ? hits[0].object : null;
  if(h !== sobre){
    if(sobre && sobre.material.emissive) sobre.material.emissive.setHex(0x000000);
    sobre = h;
    if(sobre && sobre.material.emissive) sobre.material.emissive.setHex(0x24344A);
    pedirCuadro();
  }
  if(sobre && sobre.userData.code){
    var e = byId[eqActual], v = 0, nm = SD[sobre.userData.code] || sobre.userData.code;
    e.sys.forEach(function(s){ if(s.c === sobre.userData.code) v = s.v; });
    globo(esc(nm) + '&nbsp;&nbsp;<b>' + (v ? 'S/ ' + fmt(v) : 'sin consumo') + '</b>', mx, my);
  } else globo(null);
}
function pintarCamion(e){
  if(!camion) return;
  var mapa = {}; e.sys.forEach(function(s){ mapa[s.c] = s.v; });
  var max = e.sys.length ? e.sys[0].v : 1;
  piezas.forEach(function(m){
    var c = m.userData.code, v = mapa[c] || 0;
    var hex = !realista && v ? hexCalor(v, max) : (m.userData.base || PINTURA);
    if(c === sysActual) hex = css('--hivis') || '#FCE624';
    m.material.color.set(hex);
  });
}
function renderEstudio(t){
  if(!rE) return;
  if(gira && !arrastra && !REDUCIR) rotY += 0.0026;
  camion.rotation.y = rotY;
  var encuadre = dist * Math.max(1,0.95/camE.aspect);
  var ry = 2.6 + Math.sin(rotX) * encuadre * 0.62;
  camE.position.set(0, ry, encuadre * Math.cos(rotX * 0.62));
  camE.lookAt(0, 2.85, 0);
  rE.render(escE, camE);
}

/* ══════════════════════════════════════════════════════════════════
   10 · el tajo — fondo del acto I
   ══════════════════════════════════════════════════════════════════ */
var rT, escT, camT, polvo, velos = [], tajoVivo = false, camiones = [];
var R_TAJO = 188, PROF = 82, BANCO = 14.5, C_RAMPA = 8.2, W_RAMPA = 13;

/* el contorno del tajo no es un circulo: se abre y se cierra segun el rumbo */
function radioTajo(th){
  return R_TAJO * (1 + 0.175*Math.sin(2*th + 0.7) + 0.085*Math.cos(3*th - 1.2)
                     + 0.045*Math.sin(5*th + 2.1));
}
/* rampa en espiral: distancia del punto al eje del camino, y su altura */
function rampa(r, th){
  var mejor = 1e9, hR = 0;
  for(var k=0; k<4; k++){
    var phi = th + Math.PI*2*k;
    var rr = radioTajo(phi)*0.965 - C_RAMPA*phi;
    if(rr < 30) continue;
    var d = Math.abs(r - rr);
    if(d < mejor){ mejor = d; hR = -PROF * (1 - rr/radioTajo(phi)); }
  }
  return { d:mejor, h:hR };
}
function alturaTajo(x, z){
  var r = Math.hypot(x, z);
  var th = Math.atan2(z, x); if(th < 0) th += Math.PI*2;
  var R = radioTajo(th);
  var ruido = Math.sin(x*0.048)*Math.cos(z*0.041)*3.1 + Math.sin(x*0.115 + z*0.083)*1.4;
  if(r > R) return 5 + ruido*0.9 + (r - R)*0.055;
  var t = 1 - r/R;
  var nivel = (PROF*t)/BANCO;
  var hBanco = -Math.floor(nivel)*BANCO;
  var fr = nivel - Math.floor(nivel);
  if(fr < 0.13) hBanco += Math.sin(fr/0.13*Math.PI)*0.95;      /* berma de seguridad */
  hBanco += Math.sin(th*7 + r*0.05)*0.9;                        /* el banco no es plano */
  var ram = rampa(r, th);
  if(ram.d < W_RAMPA){
    var m = 1 - Math.pow(ram.d/W_RAMPA, 2.2);
    return lerp(hBanco + ruido*0.3, ram.h + 0.9, m);
  }
  return hBanco + ruido*0.45;
}
function esRampa(x, z){
  var r = Math.hypot(x, z);
  var th = Math.atan2(z, x); if(th < 0) th += Math.PI*2;
  if(r > radioTajo(th)) return 0;
  var d = rampa(r, th).d;
  return d < W_RAMPA ? 1 - Math.pow(d/W_RAMPA, 2.2) : 0;
}
var U_MAX = 0.62;              /* los camiones no bajan al fondo: alli el giro es cerrado */
var _ade = null, _ejeX = null, _ejeY = null, _ejeZ = null, _base = null;
/* alinea el camion con la rampa: el morro del modelo apunta a -X y el vehiculo
   se inclina con la pendiente, en vez de girar sobre si mismo */
function orientarCamion(obj, a, b){
  if(!_ade){
    _ade = new THREE.Vector3(); _ejeX = new THREE.Vector3();
    _ejeY = new THREE.Vector3(); _ejeZ = new THREE.Vector3();
    _base = new THREE.Matrix4();
  }
  _ade.set(b.x - a.x, b.y - a.y, b.z - a.z);
  if(_ade.lengthSq() < 1e-9) return;
  _ade.normalize();
  _ejeX.copy(_ade).multiplyScalar(-1);
  _ejeY.set(0, 1, 0);
  _ejeY.addScaledVector(_ejeX, -_ejeY.dot(_ejeX));
  if(_ejeY.lengthSq() < 1e-9) return;
  _ejeY.normalize();
  _ejeZ.crossVectors(_ejeX, _ejeY).normalize();
  _base.makeBasis(_ejeX, _ejeY, _ejeZ);
  obj.quaternion.setFromRotationMatrix(_base);
}
function puntoRampa(u){
  var phi = u * Math.PI*2*3.05;
  var rr = radioTajo(phi)*0.965 - C_RAMPA*phi;
  return { x: Math.cos(phi)*rr, z: Math.sin(phi)*rr,
           y: -PROF*(1 - rr/radioTajo(phi)) + 1.1 };
}

function iniciarTajo(){
  if(!$('lienzo-tajo')) return;
  var cv = $('lienzo-tajo');
  rT = new THREE.WebGLRenderer({ canvas:cv, antialias:!MOVIL, alpha:true, powerPreference:'high-performance' });
  rT.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOVIL ? 1.25 : 1.75));
  rT.outputEncoding = THREE.sRGBEncoding;
  rT.toneMapping = THREE.ACESFilmicToneMapping;
  rT.toneMappingExposure = 0.94;

  escT = new THREE.Scene();
  escT.fog = new THREE.FogExp2(0x14384E, 0.0033);
  camT = new THREE.PerspectiveCamera(44, 1.6, 1, 1100);

  var N = MOVIL ? 128 : 280, LADO = 460;
  var g = new THREE.PlaneGeometry(LADO, LADO, N, N);
  g.rotateX(-Math.PI/2);
  var pos = g.attributes.position, col = new Float32Array(pos.count*3);
  var cHondo = new THREE.Color('#0B1620');   /* fondo del tajo, en sombra   */
  var cPiso  = new THREE.Color('#544E3E');   /* piso de banco, polvo seco   */
  var cCara  = new THREE.Color('#1C242C');   /* cara de banco, roca         */
  var cCam   = new THREE.Color('#8D8471');   /* camino de acarreo compactado*/
  var tmp = new THREE.Color();
  var dd = LADO/N;
  for(var i=0; i<pos.count; i++){
    var x = pos.getX(i), z = pos.getZ(i);
    var y = alturaTajo(x, z);
    pos.setY(i, y);
    var hx = (alturaTajo(x+dd,z) - alturaTajo(x-dd,z)) / (2*dd);
    var hz = (alturaTajo(x,z+dd) - alturaTajo(x,z-dd)) / (2*dd);
    var pend = Math.min(1, Math.hypot(hx,hz) * 0.78);
    var f = clamp((y + PROF) / (PROF + 12), 0, 1);
    tmp.copy(cHondo).lerp(cPiso, Math.pow(f, 0.72));
    tmp.lerp(cCara, pend);
    var rp = esRampa(x, z);
    if(rp > 0.18) tmp.lerp(cCam, Math.min(1,(rp - 0.18)*1.45) * (1 - pend*0.6));
    var vn = 0.9 + ((Math.sin(x*0.83)*Math.cos(z*0.71) + 1)/2) * 0.2;
    col[i*3] = tmp.r*vn; col[i*3+1] = tmp.g*vn; col[i*3+2] = tmp.b*vn;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  var terreno = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
    vertexColors:true, flatShading:true, roughness:0.99, metalness:0.0 }));
  escT.add(terreno);

  escT.add(new THREE.HemisphereLight(0x3F76A4, 0x080F16, 0.38));
  var sol = new THREE.DirectionalLight(0xFFBE7C, 1.95);
  sol.position.set(300, 74, -70); escT.add(sol);
  var contra = new THREE.DirectionalLight(0x2E6E9E, 0.5);
  contra.position.set(-140, 60, 150); escT.add(contra);

  /* polvo: nada de bokeh. Particulas finas bajas + dos velos de polvo
     tendidos sobre el fondo del tajo, que es donde el polvo se queda. */
  var NP = MOVIL ? 130 : 320;
  var gp = new THREE.BufferGeometry(), pp = new Float32Array(NP*3);
  for(var j=0; j<NP; j++){
    var a = Math.random()*Math.PI*2, rr = 20 + Math.random()*160;
    pp[j*3] = Math.cos(a)*rr;
    pp[j*3+1] = -PROF*0.92 + Math.random()*PROF*0.8;
    pp[j*3+2] = Math.sin(a)*rr;
  }
  gp.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  var cp = document.createElement('canvas'); cp.width = cp.height = 32;
  var gc = cp.getContext('2d'), rgp = gc.createRadialGradient(16,16,0, 16,16,16);
  rgp.addColorStop(0,'rgba(214,196,168,.8)'); rgp.addColorStop(1,'rgba(214,196,168,0)');
  gc.fillStyle = rgp; gc.fillRect(0,0,32,32);
  var texPolvo = new THREE.CanvasTexture(cp);
  polvo = new THREE.Points(gp, new THREE.PointsMaterial({
    size: 1.5, map:texPolvo, transparent:true, opacity:0.20,
    depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true }));
  escT.add(polvo);

  velos = [];
  for(var vi=0; vi<3; vi++){
    var vel = new THREE.Mesh(new THREE.PlaneGeometry(230, 230),
      new THREE.MeshBasicMaterial({ map:texPolvo, transparent:true,
        opacity:0.055 + vi*0.02, depthWrite:false, blending:THREE.AdditiveBlending,
        color:new THREE.Color('#C9B79A') }));
    vel.rotation.x = -Math.PI/2;
    vel.position.set(0, -PROF*0.86 + vi*14, 0);
    escT.add(vel); velos.push(vel);
  }

  /* camiones circulando por la rampa */
  var nC = MOVIL ? 2 : 3;
  for(var c2=0; c2<nC; c2++){
    var m = construirCamion(false, null);
    m.scale.setScalar(1.35);
    escT.add(m);
    camiones.push({ obj:m, u: 0.06 + c2*0.17, vel: 0.0000042 + Math.random()*0.0000018 });
  }
  ajustarTajo();
}
function ajustarTajo(){
  if(!rT) return;
  var w = window.innerWidth, h = window.innerHeight;
  rT.setSize(w, h, false);
  var asp = w/h;
  camT.aspect = asp;
  /* fijamos el campo horizontal: en vertical el tajo no se convierte en una rendija */
  var hFov = 60 * Math.PI/180;
  var v = 2*Math.atan(Math.tan(hFov/2)/asp) * 180/Math.PI;
  camT.fov = clamp(v, 42, 58);   /* en vertical se recorta, no se aleja */
  camT.updateProjectionMatrix();
}
function renderTajo(t, p){
  if(!rT) return;
  /* descenso de camara ligado al scroll del acto I */
  var e = p*p*(3-2*p);
  var cx, cy, cz, mx, my, mz;
  if(MOVIL){
    /* en vertical el tajo se centra y la camara se acerca */
    cx = lerp(104, 26, e); cy = lerp(58, -10, e); cz = lerp(190, 74, e);
    mx = lerp(-8,-18, e); my = lerp(-12,-54, e); mz = lerp(-6,-16, e);
  } else {
    cx = lerp(126, 30, e); cy = lerp(56, -16, e); cz = lerp(238, 88, e);
    mx = lerp(-42,-40, e); my = lerp(-14,-58, e); mz = lerp(-26,-28, e);
  }
  var bal = REDUCIR ? 0 : Math.sin(t*0.00014)*5;
  camT.position.set(cx + bal, cy, cz + bal*0.6);
  camT.lookAt(mx, my, mz);

  if(!REDUCIR){
    for(var i=0; i<camiones.length; i++){
      var c = camiones[i];
      c.u += c.vel * 16;
      if(c.u > U_MAX) c.u -= U_MAX;
      var a = puntoRampa(c.u), b = puntoRampa(c.u + 0.0025);
      c.obj.position.set(a.x, a.y, a.z);
      orientarCamion(c.obj, a, b);
    }
    if(polvo) polvo.rotation.y = t*0.000010;
    for(var vv=0; vv<velos.length; vv++) velos[vv].rotation.z = t*0.0000065*(vv+1);
  }
  rT.render(escT, camT);
}

/* ══════════════════════════════════════════════════════════════════
   11 · esquema 2D (alterna y respaldo sin WebGL)
   ══════════════════════════════════════════════════════════════════ */
var ZONAS = [
  {c:'TLV',  l:'TOLVA',        x:230, y:16,  w:640, h:98, f:'tolva'},
  {c:'AAC',  l:'A/A',          x:104, y:56,  w:104, h:20},
  {c:'CBN',  l:'CABINA',       x:104, y:80,  w:104, h:52},
  {c:'LSM',  l:'LUCES',        x:34,  y:80,  w:64,  h:52},
  {c:'MFC1', l:'VENTIL.',      x:34,  y:138, w:64,  h:22},
  {c:'TLH1', l:'TURBO',        x:104, y:138, w:64,  h:22},
  {c:'CMP',  l:'COMPR.',       x:174, y:138, w:64,  h:22},
  {c:'RAD1', l:'RAD.',         x:34,  y:166, w:42,  h:76},
  {c:'ENG1', l:'MOTOR',        x:82,  y:166, w:156, h:76},
  {c:'TQH1', l:'TQ. HIDR.',    x:246, y:124, w:104, h:52},
  {c:'TQC1', l:'TQ. COMB.',    x:356, y:124, w:104, h:52},
  {c:'SEN',  l:'ENGRASE',      x:466, y:124, w:86,  h:52},
  {c:'LPH',  l:'MANGUERAS',    x:558, y:124, w:124, h:52},
  {c:'BAT',  l:'BATERÍA',      x:688, y:124, w:70,  h:52},
  {c:'SCI',  l:'C. INCENDIO',  x:764, y:124, w:106, h:52},
  {c:'SDI',  l:'SUSP. DEL.',   x:246, y:184, w:78,  h:58},
  {c:'CON',  l:'CONVERT.',     x:330, y:184, w:70,  h:58},
  {c:'TRM',  l:'TRANSMISIÓN',  x:406, y:184, w:116, h:58},
  {c:'CAR',  l:'CARDÁN',       x:528, y:184, w:70,  h:58},
  {c:'DIFP', l:'DIFERENCIAL',  x:604, y:184, w:96,  h:58},
  {c:'MLH',  l:'M. FINAL LH',  x:706, y:184, w:82,  h:28},
  {c:'MRH',  l:'M. FINAL RH',  x:706, y:214, w:82,  h:28},
  {c:'SPI',  l:'SUSP. POST.',  x:794, y:184, w:76,  h:58}
];
function pintarEsquema(e){
  if(!$('esquema')) return;
  var mapa = {}; e.sys.forEach(function(s){ mapa[s.c] = s.v; });
  var max = e.sys.length ? e.sys[0].v : 1;
  var svg = '<svg viewBox="0 0 900 282" role="img" aria-label="Esquema del equipo con el costo por sistema">';
  if(e.fam === 'ACARREO'){
    svg += '<rect x="30" y="250" width="846" height="14" fill="#EEF2F6" stroke="#CBD6E1"></rect>';
    ZONAS.forEach(function(z){
      var v = mapa[z.c] || 0, f = varCalor(v, max), act = (sysActual === z.c ? ' act' : '');
      var claro = nivelCalor(v,max) >= 3 ? '#FFFFFF' : '#08192A';
      if(z.f === 'tolva'){
        /* visera hacia la cabina (izquierda) y caja que baja hacia la cola */
        svg += '<g class="zona' + act + '" data-c="' + z.c + '" tabindex="0" role="button">'
          + '<path data-f d="M' + (z.x-80) + ' ' + (z.y+6)
          + ' L' + (z.x+z.w) + ' ' + (z.y+30)
          + ' L' + (z.x+z.w) + ' ' + (z.y+z.h)
          + ' L' + z.x + ' ' + (z.y+z.h)
          + ' L' + z.x + ' ' + (z.y+34)
          + ' L' + (z.x-80) + ' ' + (z.y+34)
          + ' Z" fill="' + f + '" stroke="#7389A0"></path>';
      } else {
        svg += '<g class="zona' + act + '" data-c="' + z.c + '" tabindex="0" role="button">'
          + '<rect data-f x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.h
          + '" fill="' + f + '" stroke="#7389A0"></rect>';
      }
      var cx = z.f === 'tolva' ? z.x + z.w/2 + 30 : z.x + z.w/2;
      svg += '<text class="zlbl" x="' + cx + '" y="' + (z.y + z.h/2) + '" text-anchor="middle" fill="' + claro + '">' + z.l + '</text>'
        + '<text class="zval" x="' + cx + '" y="' + (z.y + z.h/2 + 13) + '" text-anchor="middle" fill="' + claro + '">'
        + (v ? fmtK(v) : '—') + '</text></g>';
    });
  } else {
    var cols = 4, cw = 208, ch = 76, i = 0;
    e.sys.slice(0,12).forEach(function(s){
      var x = 18 + (i % cols)*(cw + 10), y = 14 + Math.floor(i/cols)*(ch + 10); i++;
      var claro = nivelCalor(s.v,max) >= 3 ? '#FFFFFF' : '#08192A';
      svg += '<g class="zona' + (sysActual === s.c ? ' act' : '') + '" data-c="' + s.c + '" tabindex="0" role="button">'
        + '<rect data-f x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" fill="'
        + varCalor(s.v, max) + '" stroke="#7389A0"></rect>'
        + '<text class="zlbl" x="' + (x+12) + '" y="' + (y+24) + '" fill="' + claro + '">' + esc(s.n.slice(0,26)) + '</text>'
        + '<text class="zval" x="' + (x+12) + '" y="' + (y+44) + '" fill="' + claro + '" style="font-size:12px">S/ '
        + fmtK(s.v) + '</text></g>';
    });
  }
  svg += '</svg>';
  $('esquema').innerHTML = svg;
  Array.prototype.forEach.call($('esquema').querySelectorAll('.zona'), function(g){
    var pick = function(){ elegirSistema(g.getAttribute('data-c')); };
    g.addEventListener('click', pick);
    g.addEventListener('keydown', function(ev){
      if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); pick(); }
    });
  });
}

/* ---------- mapa de posiciones de llanta: vista en planta ---------- */
function pintarLlantas(e){
  if(!$('llantas')) return;
  var mapa = {};
  e.sys.forEach(function(s){ mapa[s.c] = s.v; });
  var cods = [], n = 0;
  for(var i=1; i<=14; i++){ if(mapa['LL'+i] !== undefined) n = i; }
  if(e.fam === 'ACARREO' && n < 6) n = 6;          /* el camion siempre tiene seis */
  if(n < 2){ $('llantas').innerHTML = ''; return; }
  for(var i2=1; i2<=n; i2++) cods.push('LL'+i2);
  var max = Math.max.apply(null, cods.map(function(c){ return mapa[c] || 0; })) || 1;

  var AN = 66, AL = 25;
  var filaDel = [12, 147], filaPost = [12, 41, 118, 147];
  var pos = [];
  var xDel = 74;
  pos.push({ c:cods[0], x:xDel, y:filaDel[0] });
  pos.push({ c:cods[1], x:xDel, y:filaDel[1] });
  var resto = cods.slice(2);
  var ejes = Math.max(1, Math.ceil(resto.length/4));
  for(var a=0; a<ejes; a++){
    for(var k=0; k<4; k++){
      var idx = a*4 + k;
      if(idx >= resto.length) break;
      pos.push({ c:resto[idx], x: 262 + a*86, y: filaPost[k] });
    }
  }
  var ancho = 262 + ejes*86 + 34;
  var xCh = xDel + AN/2, xCh2 = 262 + (ejes-1)*86 + AN/2;

  var svg = '<svg viewBox="0 0 ' + ancho + ' 184" role="img" '
    + 'aria-label="Costo del mes por posición de llanta, vista en planta">'
    + '<rect x="' + (xCh-38) + '" y="70" width="' + (xCh2 - xCh + 110) + '" height="44" '
    + 'fill="#EDF1F5" stroke="#CBD6E1"></rect>'
    + '<line x1="' + xCh + '" y1="20" x2="' + xCh + '" y2="164" stroke="#CBD6E1" stroke-width="5"></line>';
  for(var a2=0; a2<ejes; a2++){
    var xe = 262 + a2*86 + AN/2;
    svg += '<line x1="' + xe + '" y1="18" x2="' + xe + '" y2="166" stroke="#CBD6E1" stroke-width="5"></line>';
  }
  pos.forEach(function(p){
    var v = mapa[p.c] || 0;
    var nivel = nivelCalor(v, max);
    var tinta = nivel >= 3 ? '#FFFFFF' : '#08192A';
    var suave = nivel >= 3 ? 'rgba(255,255,255,.78)' : '#41566C';
    svg += '<g class="zona' + (sysActual === p.c ? ' act' : '') + '" data-c="' + p.c + '" tabindex="0" role="button">'
      + '<rect data-f x="' + p.x + '" y="' + p.y + '" width="' + AN + '" height="' + AL + '" rx="3" fill="'
      + varCalor(v, max) + '" stroke="#7389A0"></rect>'
      + '<text class="zlbl" x="' + (p.x+7) + '" y="' + (p.y+17) + '" fill="' + tinta + '">' + p.c + '</text>'
      + '<text class="zval" x="' + (p.x+AN-7) + '" y="' + (p.y+17) + '" text-anchor="end" fill="' + suave + '">'
      + (v ? fmtK(v) : '—') + '</text></g>';
  });
  svg += '</svg>';
  $('llantas').innerHTML = '<div class="tt">POSICIONES DE LLANTA · COSTO DEL MES · '
    + cods.length + ' POSICIONES</div>' + svg;
  Array.prototype.forEach.call($('llantas').querySelectorAll('.zona'), function(g){
    var pick = function(){ elegirSistema(g.getAttribute('data-c')); };
    g.addEventListener('click', pick);
    g.addEventListener('keydown', function(ev){
      if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); pick(); }
    });
  });
}

/* ══════════════════════════════════════════════════════════════════
   12 · panel de sistemas y detalle
   ══════════════════════════════════════════════════════════════════ */
var eqActual = null, sysActual = null;

function pintarSistemas(e){
  if(!$('sistemas')) return;
  var max = e.sys.length ? e.sys[0].v : 1;
  $('sistemas').innerHTML = e.sys.map(function(s){
    return '<button class="sis' + (sysActual === s.c ? ' sel' : '') + '" data-c="' + esc(s.c) + '" tabindex="0">'
      + '<span class="c">' + esc(s.c) + '</span>'
      + '<span class="n">' + esc(s.n) + '</span>'
      + '<span class="v">' + fmt(s.v) + '</span>'
      + '<span class="b"><i style="width:' + (s.v/max*100).toFixed(1) + '%"></i></span></button>';
  }).join('');
  Array.prototype.forEach.call($('sistemas').children, function(r){
    r.addEventListener('click', function(){ elegirSistema(r.getAttribute('data-c')); });
  });
}
function filaOT(o, conCosto){
  return '<div class="ot"><span class="o1">' + esc(o.ot) + '</span>'
    + '<span class="o3">' + esc(o.d) + '</span>'
    + '<span class="o2">' + esc(o.txt) + '</span>'
    + '<span class="o4">' + esc(o.cls) + ' &nbsp; ' + esc(o.act || '—')
    + (conCosto && o.cost ? ' &nbsp; S/ ' + fmt(o.cost) : ' &nbsp; ' + esc(SD[o.sis] || o.sis || ''))
    + '</span></div>';
}
function pintarDetalle(e){
  if(!$('detalle')) return;
  var s = null;
  e.sys.forEach(function(x){ if(x.c === sysActual) s = x; });
  if(!s){
    var ots = (e.ots || []).slice(0,7);
    $('detalle').innerHTML = '<div class="dt">' + esc(e.id) + ' · ' + esc(e.mod || e.fam) + '</div>'
      + '<div class="dm">ÓRDENES CERRADAS EN EL MES</div>'
      + '<div class="dp">Elige una pieza del modelo o un sistema de la lista para aislar su costo.</div>'
      + (ots.length ? '<div class="ots">' + ots.map(function(o){ return filaOT(o, false); }).join('') + '</div>'
                    : '<div class="dp">Sin órdenes cerradas registradas en el mes.</div>');
    return;
  }
  var pct = s.v / e.tot * 100;
  var rel = (e.ots || []).filter(function(o){ return o.sis === s.c; });
  $('detalle').innerHTML = '<div class="dt">' + esc(s.n) + '</div>'
    + '<div class="dm">' + esc(s.c) + ' &nbsp; ' + esc(e.id) + ' &nbsp; ' + esc(e.mod || '') + '</div>'
    + '<div class="dstats">'
    +   '<div><div class="l">COSTO MES</div><div class="v">' + fmt(s.v) + '</div></div>'
    +   '<div><div class="l">% DEL EQUIPO</div><div class="v">' + pct.toFixed(1) + '%</div></div>'
    +   '<div><div class="l">ÓRDENES</div><div class="v">' + (rel.length || '—') + '</div></div>'
    + '</div>'
    + (rel.length ? '<div class="ots">' + rel.map(function(o){ return filaOT(o, true); }).join('') + '</div>'
      : '<div class="dp">El consumo de este sistema entró por salidas de almacén sin una orden cerrada en el mes.</div>');
}

function elegirSistema(c){
  sysActual = (sysActual === c ? null : c);
  var e = byId[eqActual];
  pintarCamion(e); pintarEsquema(e); pintarLlantas(e); pintarSistemas(e); pintarDetalle(e);
  pedirCuadro();
}
function elegirEquipo(id){
  eqActual = id; sysActual = null;
  var e = byId[id];
  if(!e) return;
  var sel = $('selector'); if(sel) sel.value = id;
  var st = estado(e);
  htm('ficha', '<b>' + esc((e.marca || '') + ' ' + (e.mod || '')) + '</b>'
    + '<span>' + esc(e.fam) + '</span><span>' + esc(e.cond || '') + '</span>'
    + '<span class="estado ' + st[0] + '">' + st[1] + '</span>');
  txt('q-costo', 'S/ ' + fmtK(e.tot));
  txt('q-costo-d', 'material ' + fmt(e.mat) + ' / servicios ' + fmt(e.srv));
  txt('q-disp', e.disp.toFixed(1) + '%');
  cls('q-disp', 'v ' + (e.disp >= 92 ? 'bien' : 'alza'));
  txt('q-disp-d', e.disp >= 92 ? 'sobre referencia demo de 92.0%' : (92 - e.disp).toFixed(1) + ' puntos bajo referencia demo');
  txt('q-hrs', fmt(e.hrs));
  txt('q-cph', 'S/ ' + e.cph.toFixed(0));
  var cphProm = EQ.reduce(function(a,x){ return a+x.tot; },0) / EQ.reduce(function(a,x){ return a+x.hrs; },0);
  cls('q-cph', 'v ' + (e.cph > cphProm ? 'alza' : 'bien'));
  txt('q-cph-d', e.cph > cphProm ? 'sobre el promedio de la flota' : 'bajo el promedio de la flota');
  txt('q-av', e.av);

  var esCamion = (e.fam === 'ACARREO');
  ponerModo(esCamion ? modoPreferido : false, !esCamion);
  pintarCamion(e); pintarEsquema(e); pintarLlantas(e); pintarSistemas(e); pintarDetalle(e);
  pedirCuadro();
}
function ponerModo(quiere3d, forzar2d){
  var est = $('estudio'), esq = $('esquema');
  if(!est || !esq) return;
  modelo3d = quiere3d && HAY3D && !!rE && !forzar2d;
  est.hidden = !modelo3d;
  esq.hidden = modelo3d;
  att('v-3d', 'aria-pressed', modelo3d);
  att('v-2d', 'aria-pressed', !modelo3d);
  var b3 = $('v-3d'); if(b3) b3.disabled = !!forzar2d || !rE;
  var bg = $('v-giro'); if(bg) bg.disabled = !modelo3d;
  ['v-material','v-inspeccion','v-lateral','v-reset','v-mas','v-menos'].forEach(function(id){var b=$(id);if(b)b.disabled=!modelo3d;});
  if(modelo3d) setTimeout(function(){ ajustarEstudio(); pedirCuadro(); }, 30);
}

/* ══════════════════════════════════════════════════════════════════
   13 · curvas de nivel del cierre
   ══════════════════════════════════════════════════════════════════ */
function pintarCurvas(){
  if(!$('curvas')) return;
  var w = 1200, h = 620, s = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice">';
  for(var k=0; k<13; k++){
    var d = '', rr = 60 + k*34;
    for(var a=0; a<=64; a++){
      var th = a/64*Math.PI*2;
      var wob = Math.sin(th*3 + k*0.7)*13 + Math.cos(th*5 - k*0.4)*8;
      var x = 880 + Math.cos(th)*(rr + wob)*1.35;
      var y = 320 + Math.sin(th)*(rr + wob)*0.72;
      d += (a ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    s += '<path d="' + d + 'Z" fill="none" stroke="#3D6BC0" stroke-width="' + (k%4===0 ? 1.5 : 0.7) + '"></path>';
  }
  s += '</svg>';
  $('curvas').innerHTML = s;
}

/* ══════════════════════════════════════════════════════════════════
   14 · motor de scroll: rail, barra, capitulos, revelados
   ══════════════════════════════════════════════════════════════════ */
var caps = Array.prototype.slice.call(document.querySelectorAll('.cap'));
/* En el sitio de varias paginas cada capitulo oscuro fija su propia altura
   dentro del tajo (data-tajo); en la pagina unica el descenso lo manda el
   scroll y este valor queda en null. */
var TAJO_FIJO = (function(){
  var v = document.body && document.body.getAttribute('data-tajo');
  if(v === null || v === undefined || v === '') return null;
  var n = parseFloat(v);
  return isNaN(n) ? null : n;
})();
var yScroll = 0, pedido = false, ultimoT = 0, capActual = null;
var finActoI = 0, altoDoc = 0;

function medir(){
  var am = $('c-consola');
  finActoI = am ? am.offsetTop : window.innerHeight*4;
  altoDoc = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}
function pedirCuadro(){
  if(!pedido){ pedido = true; requestAnimationFrame(bucle); }
}
function actualizarScroll(){
  var p = clamp(yScroll / altoDoc, 0, 1);
  var pr = $('prog-rail'), pt = $('prog-top');
  if(pr) pr.style.height = (p * window.innerHeight * 0.72) + 'px';
  if(pt) pt.style.width = (p*100).toFixed(2) + '%';
  if(!caps.length) return TAJO_FIJO === null ? 0 : TAJO_FIJO;

  /* capitulo visible: el que cruza el tercio superior */
  var ref = yScroll + window.innerHeight*0.34, act = caps[0];
  for(var i=0; i<caps.length; i++){ if(caps[i].offsetTop <= ref) act = caps[i]; }
  if(act !== capActual){
    capActual = act;
    txt('capnom', act.getAttribute('data-cap'));
    htm('cota', '<b>' + act.getAttribute('data-cota') + '</b>&nbsp;&nbsp;'
      + act.getAttribute('data-cap').toUpperCase());
  }
  /* la barra cambia de piel sobre los capitulos claros */
  var enLuz = act.classList.contains('luz');
  var nav = $('nav'), rail = $('rail');
  if(nav){
    nav.classList.toggle('claro', enLuz);
    nav.classList.toggle('fondo', yScroll > 40 && !enLuz);
  }
  if(rail) rail.classList.toggle('enluz', enLuz);

  /* el tajo solo vive durante el acto I */
  var vis = (TAJO_FIJO !== null) ? true : (yScroll < finActoI);
  if(vis !== tajoVivo){
    tajoVivo = vis;
    var tj = $('tajo'), ci = $('cielo');
    if(tj) tj.classList.toggle('oculto', !vis);
    if(ci) ci.classList.toggle('oculto', !vis);
  }
  if(TAJO_FIJO !== null) return TAJO_FIJO;
  return clamp(yScroll / Math.max(1, finActoI - window.innerHeight), 0, 1);
}
function bucle(t){
  pedido = false;
  var dt = Math.min(48, t - ultimoT || 16); ultimoT = t;
  var pActo = actualizarScroll();
  var sigue = pasoContadores(dt);
  if(tajoVivo && rT){ renderTajo(t, pActo); sigue = true; }
  if(estudioVisible && modelo3d && rE){ renderEstudio(t); sigue = sigue || (gira && !REDUCIR) || arrastra; }
  if(sigue) pedirCuadro();
}
window.addEventListener('scroll', function(){ yScroll = window.pageYOffset || 0; pedirCuadro(); }, { passive:true });

var tRes;
window.addEventListener('resize', function(){
  clearTimeout(tRes);
  tRes = setTimeout(function(){ medir(); ajustarTajo(); ajustarEstudio(); pedirCuadro(); }, 140);
});

/* revelado de capitulos */
var obs = new IntersectionObserver(function(es){
  es.forEach(function(en){
    if(en.isIntersecting){
      en.target.classList.add('rev');
      if(en.target.id === 'c-hero') arrancarContadores();
      if(en.target.id === 'c-escala') arrancarEscala();
      if(en.target.id === 'c-costo') arrancarCosto();
      obs.unobserve(en.target);
    }
  });
}, { threshold:0.14, rootMargin:'0px 0px -8% 0px' });
caps.forEach(function(c){ obs.observe(c); });

function arrancarContadores(){
  contar($('m-costo'), TOTAL);
  contar($('m-eq'), N_FLOTA);
  contar($('m-sis'), N_SISTEMA);
  contar($('m-ot'), N_OT);
  pedirCuadro();
}
function arrancarEscala(){
  contar($('e-part'), FAM_ACA.eq / N_FLOTA * 100, 1, '%');
  contar($('e-costo'), FAM_ACA.tot / TOTAL * 100, 1, '%');
  pedirCuadro();
}
function arrancarCosto(){
  contar($('c-pct'), FASE_TOP.v / TOTAL * 100, 1);
  pedirCuadro();
}

/* ══════════════════════════════════════════════════════════════════
   15 · controles
   ══════════════════════════════════════════════════════════════════ */
esc_('v-3d', 'click', function(){ modoPreferido=true;ponerModo(true); });
esc_('v-2d', 'click', function(){ modoPreferido=false;ponerModo(false); });
esc_('v-giro', 'click', function(){
  gira = !gira; this.setAttribute('aria-pressed', gira); pedirCuadro();
});
esc_('pausa', 'click', function(){
  vivo = !vivo;
  this.textContent = vivo ? 'PAUSAR' : 'REANUDAR';
  cls('punto', 'punto ' + (vivo ? 'on' : 'off'));
  txt('reloj-2', vivo ? 'FLUJO ACTIVO' : 'FLUJO EN PAUSA');
});

/* ══════════════════════════════════════════════════════════════════
   16 · arranque
   ══════════════════════════════════════════════════════════════════ */
esc_('v-material','click',function(){
  realista=!realista;att('v-material','aria-pressed',realista);
  this.textContent=realista?'VER COSTO POR SISTEMA':'ACABADO REALISTA';
  pintarCamion(byId[eqActual]);pedirCuadro();
});
esc_('v-inspeccion','click',function(){
  inspeccion=!inspeccion;att('v-inspeccion','aria-pressed',inspeccion);
  this.textContent=inspeccion?'CERRAR TOLVA':'ABRIR TOLVA';
  var angle=inspeccion?-0.38:0;
  camion.children.forEach(function(m){
    if(!m.userData.tolva)return;
    var p=m.userData.original,dx=p.x-5.5,dy=p.y-2.8;
    m.position.set(5.5+dx*Math.cos(angle)-dy*Math.sin(angle),2.8+dx*Math.sin(angle)+dy*Math.cos(angle),p.z);
    m.rotation.z=m.userData.originalRotation+angle;
  });
  if(inspeccion)dist=Math.max(dist,32);
  pedirCuadro();
});
function detenerGiro(){gira=false;att('v-giro','aria-pressed',false);pedirCuadro();}
esc_('v-lateral','click',function(){rotY=0;rotX=0.1;dist=29;detenerGiro();});
esc_('v-reset','click',function(){rotY=2.35;rotX=0.27;dist=inspeccion?32:27;detenerGiro();});
esc_('v-mas','click',function(){dist=clamp(dist-2,16,46);pedirCuadro();});
esc_('v-menos','click',function(){dist=clamp(dist+2,16,46);pedirCuadro();});
pintarMosaico();
pintarFases();
pintarArticulos();
pintarListas();
pintarTicker();
pintarFiltros();
pintarTabla();
pintarCurvas();
pintarPulso();

htm('selector', EQ.map(function(e){
  return '<option value="' + esc(e.id) + '">' + esc(e.id + ' — ' + (e.mod || e.fam)) + '</option>';
}).join(''));
esc_('selector', 'change', function(){ elegirEquipo(this.value); });

if(HAY3D){
  try { iniciarEstudio(); } catch(err){ HAY3D = false; rE = null; }
}
if(HAY3D){
  try { iniciarTajo(); } catch(err){ rT = null; var tj0 = $('tajo'); if(tj0) tj0.style.display = 'none'; }
}
if(!rE){
  var est0 = $('estudio'); if(est0) est0.hidden = true;
  var b30 = $('v-3d'); if(b30) b30.disabled = true;
  var bg0 = $('v-giro'); if(bg0) bg0.disabled = true;
}

var primero = null;
EQ.forEach(function(e){ if(!primero && e.fam === 'ACARREO') primero = e.id; });
var pedido = null;
try {
  var q = (location.search || '').match(/[?&]eq=([^&]+)/);
  if(q) pedido = decodeURIComponent(q[1]);
} catch(err){ pedido = null; }
elegirEquipo(byId[pedido] ? pedido : (primero || EQ[0].id));

for(var i0=0; i0<9; i0++) nuevoMovimiento();
movHoy = 118 + 9; pintarPulso();

if(REDUCIR){
  vivo = false; gira = false;
  txt('pausa', 'REANUDAR');
  cls('punto', 'punto off');
  att('v-giro', 'aria-pressed', 'false');
  txt('reloj-2', 'FLUJO EN PAUSA');
}

(function latido(){
  seg++;
  if(vivo){
    if(seg % 4 === 0) nuevoMovimiento();
    txt('reloj', 'hace ' + (seg % 4) + ' s');
  } else {
    txt('reloj', 'en pausa');
  }
  setTimeout(latido, 1000);
})();

medir();
yScroll = window.pageYOffset || 0;
pedirCuadro();
window.addEventListener('load', function(){ medir(); ajustarTajo(); ajustarEstudio(); pedirCuadro(); });

})();
