/* DOMUS MAGNA · App de Ventas (estático, sin build). Datos en localStorage de este dispositivo. */
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r1=n=>Math.round((+n||0)*10)/10, r2=n=>Math.round((+n||0)*100)/100;
const num=v=>{const n=parseFloat(String(v).replace(',','.'));return Number.isFinite(n)?n:0};
const money=n=>(+n||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const fecha=t=>new Date(t).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'});
const fechaH=t=>new Date(t).toLocaleString('es-MX',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};
const K={vis:'dmv-visitas',pre:'dmv-precios',ses:'dmv-sesion',vend:'dmv-vendedores'};
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}

/* ================= Catálogo CQ / Domus Magna =================
   g: inf (inferior, alto total 90 = zoclo 11.5 + casco 75 + cubierta 3.5; casco 60 / cubierta 63)
      alto (piso a techo menos vista superior) · sup (30 de fondo, 75 alto típico, al techo menos vista)
      vent (ventana/puerta en muro) · toma (agua/gas/contacto/apagador) · plan (piezas libres en planta) */
const CAT={
 inf_2p:{l:'Almacén 2 puertas',g:'inf',a:80,t:'2P',r:'Recomendado 60–100 cm.',bis:2},
 inf_1p:{l:'Almacén 1 puerta',g:'inf',a:40,t:'1P',r:'Recomendado 30–50 cm.',bis:1},
 tarja_2p:{l:'Tarja 2 puertas',g:'inf',a:100,t:'Tarja',r:'80–100 cm, siempre 2 puertas.',h:'Va bajo la tarja; el bote de basura junto a ella.',bis:2},
 caj_3:{l:'Cajonera 3 cajones',g:'inf',a:60,t:'C3',caj:3},
 caj_2:{l:'Cajonera 2 cajones',g:'inf',a:60,t:'C2',caj:2},
 caj_oculto:{l:'Cajonera cajón oculto',g:'inf',a:80,t:'CO',caj:2},
 caj_3_parrilla:{l:'Cajonera 3C parrilla',g:'inf',a:80,t:'C3P',caj:3,h:'Bajo la parrilla; campanero arriba del mismo ancho.'},
 especiero:{l:'Especiero con accesorio',g:'inf',a:15,t:'Esp',r:'Recomendado 15–20 cm.',h:'Junto a la estufa o en el remate de un tramo.'},
 basura:{l:'Bote de basura con accesorio',g:'inf',a:45,t:'Bas',h:'Típico junto a la tarja.'},
 horno_bajo:{l:'Horno bajo cubierta',g:'inf',a:75,t:'HB'},
 abierto_inf:{l:'Abierto inferior (repisas)',g:'inf',a:15,t:'Ab',r:'Desde 15 cm.',h:'En los remates.'},
 esq_esc:{l:'Esquinero escuadra',g:'inf',a:90,p:90,t:'Esq',fijo:1,h:'En la esquina L/U. 88×88 (90×90 en plano), no se estira, deja 2 cm atrás.'},
 esq_lin_der:{l:'Esquinero lineal derecho',g:'inf',a:110,t:'EsqD',bis:2,h:'En la esquina, 2 cm de holgura atrás.'},
 esq_lin_izq:{l:'Esquinero lineal izquierdo',g:'inf',a:110,t:'EsqI',bis:2,h:'En la esquina, 2 cm de holgura atrás.'},
 filler_inf:{l:'Filler inferior',g:'inf',a:5,t:'F',h:'Cierra sobrantes; en esquinas para que abran puertas y cajones.'},
 vista_inf:{l:'Vista / mampara inferior 1.5',g:'inf',a:1.5,t:'V',h:'MDF 15 mm.'},
 mampara_nevera:{l:'Mampara nevera 3×63',g:'inf',a:3,p:63,t:'M',h:'Al costado de la nevera o al final de la cubierta.'},
 nevera:{l:'Hueco de nevera',g:'alto',a:80,t:'Nev',h:'En el extremo del tramo, con mamparas. El hueco se mide por fuera.'},
 torre_horno:{l:'Torre de horno',g:'alto',a:60,t:'TH',h:'Piso a techo, 2 repisas o más.'},
 alacena:{l:'Alacena alta',g:'alto',a:40,t:'Ala',bis:1,h:'En el extremo del tramo, piso a techo, 2 repisas o más.'},
 sup_1p:{l:'Almacén superior 1 puerta',g:'sup',a:40,t:'S1',bis:1,led:1,r:'Recomendado 30–50 cm.'},
 sup_2p:{l:'Almacén superior 2 puertas',g:'sup',a:80,t:'S2',bis:2,led:1,r:'Recomendado 60–100 cm.'},
 campanero:{l:'Campanero',g:'sup',a:80,al:62,t:'Camp',bis:2,led:1,h:'Sobre la parrilla y del ancho de la campana. Deja ~13 cm de hueco; sin tapa inferior.'},
 sup_abierto:{l:'Almacén abierto superior',g:'sup',a:80,t:'Ab S',led:1,h:'En los remates, sin tapa.'},
 esq_sup:{l:'Esquinero superior',g:'sup',a:70,p:70,t:'Esq S',bis:1,led:1,h:'En la esquina.'},
 cava:{l:'Cava',g:'sup',a:60,t:'Cava',led:1},
 porta_micro:{l:'Porta microondas',g:'sup',a:60,al:45,t:'Micro',h:'Abierto abajo, sin tapa inferior.'},
 sobre_nevera:{l:'Sobre nevera',g:'sup',a:80,al:40,t:'S.Nev',bis:2,h:'Del ancho del hueco de la nevera, sin tapa.'},
 filler_sup:{l:'Filler superior',g:'sup',a:5,t:'F'},
 vista_sup:{l:'Vista / mampara superior 1.5',g:'sup',a:1.5,t:'V'},
 ventana:{l:'Ventana',g:'vent',a:90,al:120,y:105,t:'Vent'},
 puerta:{l:'Puerta / vano',g:'vent',a:80,al:210,y:0,t:'Pta'},
 agua:{l:'Toma de agua',g:'toma',a:10,al:10,y:50,t:'Agua'},
 gas:{l:'Toma de gas',g:'toma',a:10,al:10,y:50,t:'Gas'},
 contacto:{l:'Contacto',g:'toma',a:8,al:12,y:110,t:'Cto'},
 apagador:{l:'Apagador',g:'toma',a:8,al:12,y:120,t:'Apg'},
 barra:{l:'Barra',g:'plan',a:150,p:50,t:'Barra'},
 contra:{l:'Contra barra',g:'plan',a:120,p:40,t:'Contra'},
 comedor:{l:'Comedor',g:'plan',a:160,p:90,t:'Comedor'},
 plafon:{l:'Plafón',g:'plan',a:120,p:80,t:'Plafón'},
 plafon_dec:{l:'Plafón decorativo',g:'plan',a:100,p:60,t:'Plafón D'},
 spot:{l:'Spot',g:'plan',a:12,p:12,t:'•'},
 muro_seg:{l:'Muro (segmento)',g:'plan',a:100,p:12,t:'Muro'},
};
const WALLS=['A','B','C','D'], WN={A:'A · frente',B:'B · derecha',C:'C · fondo',D:'D · izquierda'};
const SUBS={inf:{l:'1 · Inferior',g:['inf','alto']},sup:{l:'2 · Superior',g:['sup']},vt:{l:'3 · Ventanas y tomas',g:['vent','toma']},plan:{l:'4 · Planta (barras, plafón, spots)',g:['plan']},obs:{l:'5 · Observaciones',g:[]}};
const layer=g=>g==='alto'?'inf':g;
const NOPRICE=new Set(['ventana','puerta','agua','gas','contacto','apagador','muro_seg']);

/* ================= Lista de precios (EJEMPLO) ================= */
const PRECIO_EJ=[
 ['inf_2p','Almacén inferior 2P','ml',6800],['inf_1p','Almacén inferior 1P','ml',7200],['tarja_2p','Mueble tarja 2P','ml',6800],
 ['caj_3','Cajonera 3 cajones','ml',9800],['caj_2','Cajonera 2 cajones','ml',9200],['caj_oculto','Cajonera cajón oculto','ml',10500],['caj_3_parrilla','Cajonera 3C parrilla','ml',9800],
 ['especiero','Especiero con accesorio','pieza',4200],['basura','Mueble bote de basura con accesorio','pieza',5600],['horno_bajo','Mueble horno bajo cubierta','pieza',5200],['abierto_inf','Abierto inferior','ml',4800],
 ['esq_esc','Esquinero escuadra','pieza',9500],['esq_lin_der','Esquinero lineal derecho','pieza',8200],['esq_lin_izq','Esquinero lineal izquierdo','pieza',8200],
 ['filler_inf','Filler inferior','pieza',450],['vista_inf','Vista / mampara inferior','pieza',650],['mampara_nevera','Mampara nevera 3×63','pieza',1300],
 ['nevera','Hueco nevera (mamparas y remates)','pieza',2500],['torre_horno','Torre de horno','pieza',16500],['alacena','Alacena alta','ml',14500],
 ['sup_1p','Almacén superior 1P','ml',5400],['sup_2p','Almacén superior 2P','ml',5200],['campanero','Campanero','ml',4800],['sup_abierto','Abierto superior','ml',4300],
 ['esq_sup','Esquinero superior','pieza',6200],['cava','Cava','pieza',6800],['porta_micro','Porta microondas','pieza',4600],['sobre_nevera','Sobre nevera','ml',3900],
 ['filler_sup','Filler superior','pieza',380],['vista_sup','Vista / mampara superior','pieza',550],
 ['barra','Barra','ml',8200],['contra','Contra barra','ml',7600],['comedor','Comedor','pieza',12500],['plafon','Plafón','m2',1700],['plafon_dec','Plafón decorativo','m2',2600],['spot','Spot LED (suministro e instalación)','pieza',650],
 ['cubierta_formica','Cubierta fórmica','ml',2600],['cubierta_cuarzo','Cubierta cuarzo','ml',7800],['salp_pvc','Backsplash PVC','ml',1100],['salp_cuarzo','Salpicadera cuarzo','ml',3400],
 ['led','Tira LED bajo superiores','ml',950],['cierre_lento','Herraje cierre lento premium (por mueble)','pieza',480],['alto_brillo','Frentes alto brillo superiores','ml',1500],['gola','Gola corrida (perfil)','ml',620],
 ['acc_giratorio','Accesorio giratorio esquinero','pieza',3800],['acc_basurero','Accesorio basurero extra','pieza',2400],['acc_especiero','Accesorio especiero extra','pieza',2100],
 ['instalacion','Instalación','ml',1150],['flete','Flete y maniobras','global',1500],
];
function seedPrecios(){const o={};PRECIO_EJ.forEach(([k,n,u,p])=>o[k]={n,u,p,ej:true});return o}

/* ================= Estado ================= */
const S={vis:LS.get(K.vis,[]),pre:LS.get(K.pre,null),user:LS.get(K.ses,null)};
if(!S.pre){S.pre=seedPrecios();LS.set(K.pre,S.pre)}else{const sd=seedPrecios();for(const k in sd)if(!S.pre[k])S.pre[k]=sd[k]}
const ui={vid:null,tab:'datos',sub:'inf',wall:'A',sel:null,showPU:false,q:'',fil:'todas'};
const cur=()=>S.vis.find(v=>v.id===ui.vid);
function save(){try{LS.set(K.vis,S.vis)}catch(e){toast('No se pudo guardar: memoria llena. Quita algunas fotos.')}}
const savePre=()=>LS.set(K.pre,S.pre);
const ESTADOS=['borrador','enviada','aprobada','rechazada'];

function newVisit(){
 const d=new Date(),p=n=>String(n).padStart(2,'0');
 return {id:uid(),folio:`DM-${String(d.getFullYear()).slice(2)}${p(d.getMonth()+1)}${p(d.getDate())}-${Math.floor(Math.random()*900+100)}`,
  creado:Date.now(),vendedor:S.user?S.user.nombre:'',estado:'borrador',historial:[{t:Date.now(),estado:'borrador',nota:'Visita creada'}],
  cliente:{nombre:'',telefono:'',email:'',direccion:'',cita:''},fotos:[],pre:null,
  lev:{ancho:300,fondo:300,techo:250,vistaSup:10,muros:{A:{on:true,largo:300,nota:''},B:{on:false,largo:300,nota:''},C:{on:false,largo:300,nota:''},D:{on:false,largo:300,nota:''}}},
  items:[],acab:{frentesMat:'Melamina',frentesColor:'',supColor:'',cubierta:'formica',cubiertaColor:'',herraje:'normal',alcance:'ambas',gola:true,golaColor:'',luzLed:false,altoBrillo:false,plafonDec:false,plafonDecM2:0.48,plafonBarra:false,salpicadera:false,accBasurero:0,accEspeciero:0,accGiratorio:0},
  obs:'',cot:{lineas:[],iva:true,desc:0,anticipo:60,vigencia:15},firma:null};
}

/* ================= Precotización (cliente → ventas) ================= */
function decodePre(s){s=s.trim().replace(/-/g,'+').replace(/_/g,'/').replace(/\s/g,'');while(s.length%4)s+='=';
 const bin=atob(s),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes))}
function encodePre(o){const b=new TextEncoder().encode(JSON.stringify(o));let s='';b.forEach(x=>s+=String.fromCharCode(x));return btoa(s)}
function applyPre(v,p){
 if(!p||typeof p!=='object'||!p.config)throw new Error('El JSON no tiene el formato de precotización (falta "config").');
 const c=p.config,l=p.lead||{},a=v.acab;v.pre=p;
 v.cliente.nombre=v.cliente.nombre||l.nombre||'';v.cliente.telefono=v.cliente.telefono||l.telefono||'';
 v.cliente.email=v.cliente.email||l.email||'';v.cliente.direccion=v.cliente.direccion||l.direccion||'';v.cliente.cita=l.citaPreferida||v.cliente.cita||'';
 if(c.cubierta)a.cubierta=c.cubierta==='cuarzo'?'cuarzo':'formica';
 if(c.herraje)a.herraje=c.herraje==='cierre_lento_premium'?'cierre_lento_premium':'normal';
 if(c.alcance)a.alcance=c.alcance;
 a.luzLed=!!c.luzLedSuperiores;a.altoBrillo=!!c.altoBrillo||!!c.altoBrilloSuperiores;a.plafonDec=!!c.plafonDecorativo;a.plafonBarra=!!c.plafonSobreBarra;a.salpicadera=!!c.salpicadera;
 if(c.plafon&&c.plafon.anchoCm&&c.plafon.largoCm)a.plafonDecM2=r2(c.plafon.anchoCm*c.plafon.largoCm/1e4);
 const tipos={lineal:['A'],escuadra_l:['D','A'],u:['D','A','B'],paralela:['A','C'],isla:['A'],barra:['A'],contrabarra:['A'],dual:['D','A']};
 const reparto={1:[1],2:[.4,.6],3:[.3,.4,.3]};
 const ws=tipos[c.tipoCocina]||['A'],ml=num(c.metrosLineales)*100,L=v.lev;
 WALLS.forEach(w=>L.muros[w].on=ws.includes(w));
 if(ml>0){const rp=ws.length===2&&c.tipoCocina==='paralela'?[.5,.5]:reparto[ws.length];ws.forEach((w,i)=>L.muros[w].largo=Math.round(ml*rp[i]));
  L.ancho=Math.max(L.muros.A.largo,L.muros.C.on?L.muros.C.largo:0,200);
  const side=Math.max(L.muros.B.on?L.muros.B.largo:0,L.muros.D.on?L.muros.D.largo:0);L.fondo=Math.max(side,c.tipoCocina==='paralela'?240:300);
  WALLS.forEach(w=>{if(!L.muros[w].on)L.muros[w].largo=(w==='A'||w==='C')?L.ancho:L.fondo});}
 const extra={isla:'barra',barra:'barra',contrabarra:'contra',dual:'barra'}[c.tipoCocina];
 if(extra&&!v.items.some(i=>i.kind===extra)){const it=mkItem(v,extra);it.px=r1((L.ancho-it.ancho)/2);it.py=r1(L.fondo/2);v.items.push(it)}
 if(c.notas)v.obs=(v.obs?v.obs+'\n':'')+'Notas del cliente: '+c.notas;
 v.historial.push({t:Date.now(),estado:v.estado,nota:'Importada precotización web ('+(c.tipoCocina||'?')+', '+(c.metrosLineales||'?')+' ml)'});
}
const TIPO_N={lineal:'Lineal',u:'En U',paralela:'Paralela',escuadra_l:'Escuadra / L',isla:'Con isla',barra:'Con barra',contrabarra:'Con contrabarra',dual:'Dual'};

/* ================= Boceto: geometría ================= */
const M=30;
function mkItem(v,kind,wall){const c=CAT[kind];const it={id:uid(),kind,ancho:c.a,alto:c.al||(c.g==='sup'?75:c.g==='inf'?90:c.a),prof:c.p||(c.g==='sup'?30:c.g==='plan'?c.p:60)};
 if(c.g==='plan'){it.px=0;it.py=0;it.rot=0;return it}
 it.wall=wall||'A';it.y=c.y||0;if(c.bis===1)it.bisagra='izq';if(c.bis===2)it.bisagra='doble';if(c.led)it.led=!!v.acab.luzLed;
 if(c.g==='inf'||c.g==='alto'||c.g==='sup'){const r=layerItems(v,it.wall,layer(c.g)).reduce((m,o)=>Math.max(m,r1(o.x+o.ancho)),0);it.x=r}
 else it.x=Math.max(0,r1((wallLen(v,it.wall)-it.ancho)/2));
 return it}
const wallLen=(v,w)=>num(v.lev.muros[w].largo);
const layerItems=(v,w,ly)=>v.items.filter(i=>i.wall===w&&CAT[i.kind]&&layer(CAT[i.kind].g)===ly);
function box(v,it){const c=CAT[it.kind],H=num(v.lev.techo),vs=num(v.lev.vistaSup);
 if(c.g==='inf')return{x:it.x,y:0,w:it.ancho,h:90};if(c.g==='alto')return{x:it.x,y:0,w:it.ancho,h:H-vs};
 if(c.g==='sup')return{x:it.x,y:H-vs-it.alto,w:it.ancho,h:it.alto};return{x:it.x,y:it.y,w:it.ancho,h:it.alto}}
const MAG=8;
function magnet(x,w,edges){let best=null,bd=MAG;for(const e of edges){const d1=Math.abs(x-e);if(d1<=bd){bd=d1;best=e}const d2=Math.abs(x+w-e);if(d2<bd){bd=d2;best=e-w}}return r1(best===null?Math.round(x*2)/2:best)}
function edgesFor(v,it){const c=CAT[it.kind];
 if(c.g==='plan'){const L=v.lev,xs=[0,L.ancho],ys=[0,L.fondo];v.items.forEach(o=>{if(o!==it&&CAT[o.kind].g==='plan'){const d=pdims(o);xs.push(o.px,o.px+d.w);ys.push(o.py,o.py+d.h)}});return{xs,ys}}
 const xs=[0,wallLen(v,it.wall)];if(c.g!=='toma')layerItems(v,it.wall,layer(c.g)).forEach(o=>{if(o!==it)xs.push(r1(o.x),r1(o.x+o.ancho))});return{xs}}
const pdims=o=>o.rot?{w:o.prof,h:o.ancho}:{w:o.ancho,h:o.prof};
/* cambiar ancho sin traslapes: lo que estaba pegado o a la derecha en la misma capa se recorre */
function setAncho(v,it,w){w=r1(w);if(w<=0)return;const c=CAT[it.kind];if(c.g==='plan'||c.g==='toma'||c.g==='vent'){it.ancho=w;return}
 const oldR=r1(it.x+it.ancho),d=r1(w-it.ancho);layerItems(v,it.wall,layer(c.g)).forEach(o=>{if(o!==it&&o.x>=oldR-0.05)o.x=r1(o.x+d)});it.ancho=w}
function pegar(v,it,lado){const c=CAT[it.kind],others=layerItems(v,it.wall,layer(c.g)).filter(o=>o!==it);
 if(lado==='izq'){let e=0;others.forEach(o=>{const r=r1(o.x+o.ancho);if(r<=it.x+0.05&&r>e)e=r});it.x=e}
 else{let e=wallLen(v,it.wall);others.forEach(o=>{if(o.x>=it.x+it.ancho-0.05&&o.x<e)e=o.x});it.x=r1(e-it.ancho)}}
function compactar(v,w,ly){let x=0;layerItems(v,w,ly).sort((a,b)=>a.x-b.x).forEach(o=>{o.x=x;x=r1(x+o.ancho)});return x}
function cerrarSobrante(v,w,ly){const end=compactar(v,w,ly),L=wallLen(v,w),rest=r1(L-end);if(rest<=0)return rest;
 const pre=ly==='sup'?'sup':'inf';if(rest>1.5){const f=mkItem(v,'filler_'+pre,w);f.ancho=r1(rest-1.5);f.x=end;v.items.push(f)}
 const vi=mkItem(v,'vista_'+pre,w);vi.ancho=Math.min(1.5,rest);vi.x=r1(L-vi.ancho);v.items.push(vi);return rest}
function tramo(v,w,ly){const its=layerItems(v,w,ly).sort((a,b)=>a.x-b.x),L=wallLen(v,w),out={its,L,ocup:0,huecos:[],trasl:[],fin:0,sobra:0};
 let prev=null;its.forEach(o=>{out.ocup=r1(out.ocup+o.ancho);if(prev){const g=r1(o.x-(prev.x+prev.ancho));if(g>0.05)out.huecos.push([prev,o,g]);else if(g<-0.05)out.trasl.push([prev,o,-g])}else if(o.x>0.05)out.huecos.push([null,o,r1(o.x)]);prev=o});
 out.fin=prev?r1(prev.x+prev.ancho):0;out.sobra=r1(L-out.fin);return out}
const touching=(a,b)=>a.wall===b.wall&&(Math.abs(a.x+a.ancho-b.x)<0.06||Math.abs(b.x+b.ancho-a.x)<0.06);
function revision(v){const R=[],act=WALLS.filter(w=>v.lev.muros[w].on);
 act.forEach(w=>['inf','sup'].forEach(ly=>{const t=tramo(v,w,ly),n=ly==='inf'?'inferior':'superior';if(!t.its.length)return;
  t.trasl.forEach(([a,b,g])=>R.push(['e',`Muro ${w} ${n}: ${CAT[a.kind].t} y ${CAT[b.kind].t} se traslapan ${g} cm.`]));
  t.huecos.forEach(([a,b,g])=>R.push(['w',`Muro ${w} ${n}: hueco de ${g} cm ${a?'entre '+CAT[a.kind].t+' y ':'antes de '}${CAT[b.kind].t}.`]));
  if(t.sobra<-0.05)R.push(['e',`Muro ${w} ${n}: excede el muro por ${-t.sobra} cm.`]);
  else if(t.sobra>0.05)R.push(['w',`Muro ${w} ${n}: sobran ${t.sobra} cm. Ciérralo con filler + vista 1.5 (no se estira el mueble).`,w,ly]);
  else R.push(['o',`Muro ${w} ${n}: tramo cerrado (${t.ocup} cm).`])}));
 const by=k=>v.items.filter(i=>i.kind===k);
 by('tarja_2p').forEach(t=>{if(!by('basura').some(b=>touching(t,b)))R.push(['w','Tarja 2P: coloca el bote de basura junto a ella.'])});
 by('caj_3_parrilla').forEach(p=>{if(!by('campanero').some(c=>c.wall===p.wall&&Math.abs(c.x-p.x)<0.1&&Math.abs(c.ancho-p.ancho)<0.1))R.push(['w',`Cajonera parrilla (Muro ${p.wall}): falta campanero arriba del mismo ancho (${p.ancho} cm) y misma posición.`]);
  if(by('especiero').length&&!by('especiero').some(e=>touching(e,p)))R.push(['w','Especiero: va junto a la estufa (cajonera parrilla).'])});
 ['nevera','alacena','torre_horno','esq_esc'].forEach(k=>by(k).forEach(n=>{const L=wallLen(v,n.wall),lim=8;
  if(!(n.x<=lim||n.x+n.ancho>=L-lim))R.push(['w',`${CAT[k].l} (Muro ${n.wall}): va en el extremo del tramo${k==='esq_esc'?' / esquina':''}.`])}));
 by('nevera').forEach(n=>{if(!v.items.some(m=>(m.kind==='mampara_nevera'||m.kind==='vista_inf')&&touching(m,n)))R.push(['w','Nevera: agrega mampara 3×63 al costado.'])});
 return R}

/* ================= SVG: alzado y planta ================= */
const FILL={inf:'#E8D6BF',alto:'#D9C2A3',sup:'#F1E6D6',vent:'#DCEAF2',toma:'#fff'};
function elevSVG(v,w,o={}){const L=wallLen(v,w),H=num(v.lev.techo),vs=num(v.lev.vistaSup),W=Math.max(L,120)+M*2,Ht=H+M*2+26,sy=y=>M+H-y;
 let s=`<svg viewBox="0 0 ${W} ${Ht}" xmlns="http://www.w3.org/2000/svg" font-family="Manrope,sans-serif" data-w="${w}">`;
 s+=`<rect x="${M}" y="${M}" width="${L}" height="${H}" fill="#fff" stroke="#BDB3A4"/>`;
 s+=`<line x1="${M}" y1="${sy(90)}" x2="${M+L}" y2="${sy(90)}" stroke="#CFC6B8" stroke-dasharray="4 3"/><text x="${M+L+3}" y="${sy(90)+3}" font-size="7" fill="#736C62">90</text>`;
 s+=`<rect x="${M}" y="${M}" width="${L}" height="${vs}" fill="#EEE9E1" opacity=".7"/><text x="${M+3}" y="${M+vs-2}" font-size="7" fill="#736C62">vista sup ${vs}</text>`;
 s+=`<line x1="${M-8}" y1="${sy(0)}" x2="${M+L+8}" y2="${sy(0)}" stroke="#1C1A17" stroke-width="2"/>`;
 const its=v.items.filter(i=>i.wall===w&&CAT[i.kind].g!=='plan').sort((a,b)=>({vent:0,alto:1,inf:2,sup:3,toma:4}[CAT[a.kind].g]-{vent:0,alto:1,inf:2,sup:3,toma:4}[CAT[b.kind].g]));
 its.forEach(it=>{const c=CAT[it.kind],b=box(v,it),x=M+b.x,y=sy(b.y+b.h),sel=o.sel===it.id;
  const st=sel?'#B88A3E':'#6B4A33',sw=sel?2.4:1;let g=`<g class="it" data-id="${it.id}">`;
  if(c.g==='toma'){const cx=x+b.w/2,cy=y+b.h/2;g+=`<rect x="${x}" y="${y}" width="${b.w}" height="${b.h}" fill="${it.kind==='agua'?'#CFE6F5':it.kind==='gas'?'#FCE3C2':'#fff'}" stroke="${st}" stroke-width="${sw}" rx="2"/><text x="${cx}" y="${y-3}" font-size="7" text-anchor="middle" fill="#3D3832">${c.t} ${r1(it.y)}</text>`}
  else{g+=`<rect x="${x}" y="${y}" width="${b.w}" height="${b.h}" fill="${FILL[c.g]}" stroke="${st}" stroke-width="${sw}" ${c.g==='vent'?'stroke-dasharray="5 3"':''}/>`;
   if(c.g==='inf'&&b.w>4){g+=`<line x1="${x}" y1="${sy(11.5)}" x2="${x+b.w}" y2="${sy(11.5)}" stroke="#6B4A33" stroke-width=".6"/><rect x="${x}" y="${sy(90)}" width="${b.w}" height="3.5" fill="#BDB3A4"/>`}
   const top=y+(c.g==='inf'?3.5:0),bot=c.g==='inf'?sy(11.5):y+b.h,hh=bot-top;
   if(c.caj){for(let k=1;k<c.caj;k++){const yy=top+hh*(k===1&&c.caj===3?0.28:k/c.caj);g+=`<line x1="${x}" y1="${yy}" x2="${x+b.w}" y2="${yy}" stroke="#6B4A33" stroke-width=".6"/>`}}
   if(it.bisagra&&b.w>10){const dr=(x0,w0,h)=>h==='izq'?`<polyline points="${x0+w0},${top+3} ${x0+2},${top+hh/2} ${x0+w0},${bot-3}" fill="none" stroke="#6B4A33" stroke-width=".6" stroke-dasharray="3 2"/>`:`<polyline points="${x0},${top+3} ${x0+w0-2},${top+hh/2} ${x0},${bot-3}" fill="none" stroke="#6B4A33" stroke-width=".6" stroke-dasharray="3 2"/>`;
    if(it.bisagra==='doble'){g+=dr(x,b.w/2,'izq')+dr(x+b.w/2,b.w/2,'der')+`<line x1="${x+b.w/2}" y1="${top}" x2="${x+b.w/2}" y2="${bot}" stroke="#6B4A33" stroke-width=".5"/>`}else g+=dr(x,b.w,it.bisagra)}
   if(c.g==='sup'&&it.led)g+=`<line x1="${x+2}" y1="${y+b.h+1.5}" x2="${x+b.w-2}" y2="${y+b.h+1.5}" stroke="#E0B400" stroke-width="2.5"/>`;
   if(b.w>=12)g+=`<text x="${x+b.w/2}" y="${y+Math.min(b.h/2,40)}" font-size="${b.w<30?7:9}" font-weight="700" text-anchor="middle" fill="#1C1A17">${esc(c.t)}</text><text x="${x+b.w/2}" y="${y+Math.min(b.h/2,40)+10}" font-size="7.5" text-anchor="middle" fill="#3D3832">${r1(it.ancho)}</text>`;
   if(c.g==='vent')g+=`<text x="${x+b.w/2}" y="${y+b.h+9}" font-size="7" text-anchor="middle" fill="#3D3832">${r1(it.ancho)}×${r1(it.alto)} @${r1(it.y)}</text>`}
  s+=g+'</g>'});
 // cotas acumuladas del tramo inferior
 const t=tramo(v,w,'inf');t.its.forEach(o=>{s+=`<line x1="${M+o.x}" y1="${sy(0)+4}" x2="${M+o.x}" y2="${sy(0)+14}" stroke="#736C62" stroke-width=".6"/><text x="${M+o.x+1}" y="${sy(0)+22}" font-size="6.5" fill="#736C62">${r1(o.x)}</text>`});
 s+=`<text x="${M+L/2}" y="${Ht-3}" font-size="9" text-anchor="middle" font-weight="700" fill="#1C1A17">Muro ${w} · ${L} cm · techo ${H}</text></svg>`;return s}
function wrect(v,w,x,len,d0,d1){const W=num(v.lev.ancho),F=num(v.lev.fondo);
 if(w==='A')return{x:x,y:d0,w:len,h:d1-d0};if(w==='B')return{x:W-d1,y:x,w:d1-d0,h:len};if(w==='C')return{x:W-x-len,y:F-d1,w:len,h:d1-d0};return{x:d0,y:F-x-len,w:d1-d0,h:len}}
function planSVG(v,o={}){const W=num(v.lev.ancho),F=num(v.lev.fondo),P=46;let s=`<svg viewBox="${-P} ${-P} ${W+P*2} ${F+P*2}" xmlns="http://www.w3.org/2000/svg" font-family="Manrope,sans-serif">`;
 s+=`<rect x="0" y="0" width="${W}" height="${F}" fill="#fff" stroke="#CFC6B8" stroke-dasharray="6 4"/>`;
 WALLS.forEach(w=>{const m=v.lev.muros[w],full=(w==='A'||w==='C')?W:F;if(m.on){const r=wrect(v,w,0,Math.min(num(m.largo),full),-12,0);s+=`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#3D3832"/>`}
  const lp={A:[W/2,-22],B:[W+26,F/2],C:[W/2,F+30],D:[-26,F/2]}[w];s+=`<text x="${lp[0]}" y="${lp[1]}" font-size="12" font-weight="800" text-anchor="middle" fill="${m.on?'#1C1A17':'#B5AC9F'}">${w}</text>`});
 const ord={vent:0,alto:1,inf:2,sup:3,toma:4,plan:5};
 [...v.items].sort((a,b)=>ord[CAT[a.kind].g]-ord[CAT[b.kind].g]).forEach(it=>{const c=CAT[it.kind],sel=o.sel===it.id,st=sel?'#B88A3E':'#6B4A33',sw=sel?2.5:1;let r,extra='',lab=c.t;
  if(c.g==='plan'){const d=pdims(it);r={x:it.px,y:it.py,w:d.w,h:d.h}}
  else if(c.g==='vent')r=wrect(v,it.wall,it.x,it.ancho,-12,0);
  else if(c.g==='toma'){r=wrect(v,it.wall,it.x,Math.max(it.ancho,8),1,9)}
  else{const dep=c.g==='sup'?(it.prof||30):(it.prof||60);r=wrect(v,it.wall,it.x,it.ancho,0,dep);if(c.g==='inf'&&!c.p){const cu=wrect(v,it.wall,it.x,it.ancho,0,63);extra=`<rect x="${cu.x}" y="${cu.y}" width="${cu.w}" height="${cu.h}" fill="none" stroke="#A87A4F" stroke-width=".5"/>`}}
  const fill=c.g==='plan'?(it.kind==='spot'?'#F2D27A':it.kind.startsWith('plafon')?'rgba(200,155,109,.15)':'#E8D6BF'):c.g==='sup'?'rgba(241,230,214,.55)':c.g==='vent'?'#DCEAF2':c.g==='toma'?(it.kind==='agua'?'#9CCBEA':it.kind==='gas'?'#F2B66B':'#fff'):FILL[c.g];
  const dash=c.g==='sup'||it.kind.startsWith('plafon')?'stroke-dasharray="5 3"':'';
  const shape=it.kind==='spot'?`<circle cx="${r.x+r.w/2}" cy="${r.y+r.h/2}" r="${r.w/2}" fill="${fill}" stroke="${st}" stroke-width="${sw}"/>`:`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${fill}" stroke="${st}" stroke-width="${sw}" ${dash}/>`;
  const big=Math.min(r.w,r.h)>=14&&Math.max(r.w,r.h)>=26&&c.g!=='toma'&&c.g!=='vent'&&it.kind!=='spot';
  s+=`<g class="it" data-id="${it.id}">${extra}${shape}${big?`<text x="${r.x+r.w/2}" y="${r.y+r.h/2+3}" font-size="9" font-weight="700" text-anchor="middle" fill="#1C1A17">${esc(lab)}</text>`:''}</g>`});
 s+=`<text x="${W/2}" y="${F+44}" font-size="10" text-anchor="middle" fill="#5F584F">${W} × ${F} cm (planta)</text></svg>`;return s}

/* ================= Cotización ================= */
function genLineas(v){const P=S.pre,a=v.acab,L=[];const add=(k,desc,cant)=>{const p=P[k]||{n:k,u:'pieza',p:0};if(cant>0)L.push({id:uid(),desc,cant:r2(cant),u:p.u,precio:p.p,k})};
 const ord={inf:0,alto:1,sup:2,plan:3};const its=v.items.filter(i=>!NOPRICE.has(i.kind)).sort((x,y)=>ord[CAT[x.kind].g]-ord[CAT[y.kind].g]||(x.wall||'').localeCompare(y.wall||'')||x.x-y.x);
 its.forEach(i=>{const c=CAT[i.kind],p=P[i.kind]||{u:'pieza'};const cant=p.u==='ml'?i.ancho/100:p.u==='m2'?i.ancho*i.prof/1e4:1;
  add(i.kind,`${c.l} · ${r1(i.ancho)} cm${c.g==='plan'?' × '+r1(i.prof)+' cm':' · Muro '+i.wall}`,cant)});
 const ml=g=>v.items.filter(i=>g.includes(CAT[i.kind].g)).reduce((s,i)=>s+i.ancho,0)/100;
 const mlInf=ml(['inf']),mlSup=ml(['sup']),mlAll=ml(['inf','alto','sup']);
 if(mlInf)add('cubierta_'+a.cubierta,`Cubierta ${a.cubierta==='cuarzo'?'cuarzo':'fórmica'}${a.cubiertaColor?' · '+a.cubiertaColor:''} (63 cm de fondo)`,mlInf);
 if(a.salpicadera&&mlInf)add(a.cubierta==='cuarzo'?'salp_cuarzo':'salp_pvc',a.cubierta==='cuarzo'?'Salpicadera de cuarzo':'Backsplash PVC',mlInf);
 const mlLed=v.items.filter(i=>CAT[i.kind].g==='sup'&&CAT[i.kind].led&&(i.led||a.luzLed)).reduce((s,i)=>s+i.ancho,0)/100;if(mlLed)add('led','Tira LED bajo muebles superiores',mlLed);
 if(a.herraje==='cierre_lento_premium'){const n=v.items.filter(i=>CAT[i.kind].bis||CAT[i.kind].caj).length;add('cierre_lento','Herraje cierre lento premium (bisagras y correderas)',n)}
 if(a.altoBrillo&&mlSup)add('alto_brillo','Frentes alto brillo en superiores',mlSup);
 if(a.gola&&mlAll)add('gola',`Gola corrida${a.golaColor?' · '+a.golaColor:''}`,ml(['inf','sup']));
 if(a.plafonDec&&!v.items.some(i=>i.kind==='plafon_dec'))add('plafon_dec','Plafón decorativo',num(a.plafonDecM2));
 if(a.accGiratorio)add('acc_giratorio','Accesorio giratorio (esquinero)',num(a.accGiratorio));
 if(a.accBasurero)add('acc_basurero','Accesorio basurero adicional',num(a.accBasurero));
 if(a.accEspeciero)add('acc_especiero','Accesorio especiero adicional',num(a.accEspeciero));
 if(mlAll)add('instalacion','Instalación de mobiliario',mlAll);
 add('flete','Flete y maniobras',1);return L}
function totales(v){const c=v.cot,sub=r2(c.lineas.reduce((s,l)=>s+num(l.cant)*num(l.precio),0)),desc=r2(sub*num(c.desc)/100),base=r2(sub-desc),iva=c.iva?r2(base*0.16):0,total=r2(base+iva),ant=r2(total*num(c.anticipo)/100);
 return{sub,desc,base,iva,total,ant,saldo:r2(total-ant),vence:(v.cot.fechaEmision||Date.now())+num(c.vigencia)*864e5}}

/* ================= Router / render ================= */
const app=$('#app');
function go(h){if(location.hash===h)render();else location.hash=h}
window.addEventListener('hashchange',render);
function topbar(){const t=$('#topAct');if(!S.user){t.innerHTML='';return}
 const ic=p=>`<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
 t.innerHTML=`<span class="who">${esc(S.user.nombre)}</span><a class="btn btn-ghost btn-sm tb" href="#/visitas" aria-label="Visitas">${ic('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>')}<span class="lbl">Visitas</span></a><a class="btn btn-ghost btn-sm tb" href="#/precios" aria-label="Lista de precios">${ic('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>')}<span class="lbl">Precios</span></a><button class="btn btn-ghost btn-sm tb" data-act="logout" aria-label="Salir">${ic('<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>')}<span class="lbl">Salir</span></button>`}
let rendering=false;
function render(){if(rendering)return;rendering=true;try{const ae=document.activeElement;if(ae&&ae.blur&&app.contains(ae))ae.blur();render0()}finally{rendering=false}}
function render0(){const h=location.hash||'#/visitas';topbar();
 if(!S.user){app.innerHTML=vLogin();return}
 const pend=sessionStorage.getItem('dmv-pre');if(pend){sessionStorage.removeItem('dmv-pre');try{const v=newVisit();applyPre(v,JSON.parse(pend));S.vis.unshift(v);save();toast('Precotización importada');return go(`#/v/${v.id}/datos`)}catch(e){toast('Enlace de precotización inválido: '+e.message)}}
 const p=h.slice(2).split('/');
 if(p[0]==='v'&&p[1]){ui.vid=p[1];const v=cur();if(!v)return go('#/visitas');const tab=p[2]||'datos';if(ui.tab!==tab){ui.sel=null}ui.tab=tab;app.innerHTML=vVisita(v);after(v);const st=$('.stepper'),cu=$('.stepper .cur');if(st&&cu)st.scrollLeft=cu.offsetLeft-st.clientWidth/2+cu.offsetWidth/2;return}
 if(p[0]==='precios'){app.innerHTML=vPrecios();return}
 app.innerHTML=vLista();}
function vLogin(){const vs=LS.get(K.vend,[]);return `<div class="wrap" style="max-width:460px"><div class="card box" style="margin-top:32px"><span class="eyebrow">Acceso vendedor</span><h1 style="font:600 30px var(--f-h);margin:8px 0 6px">Entrar a Ventas</h1>
 <p class="muted" style="margin-bottom:16px">Acceso local de este dispositivo (no es autenticación real). La primera vez se registra tu PIN.</p>
 <div class="field"><label for="lgN">Nombre del vendedor</label><div class="inp"><input id="lgN" list="lgL" autocomplete="name" placeholder="Ej. Oziel"></div><datalist id="lgL">${vs.map(x=>`<option value="${esc(x.nombre)}">`).join('')}</datalist></div>
 <div class="field"><label for="lgP">PIN (4 dígitos)</label><div class="inp"><input id="lgP" inputmode="numeric" maxlength="4" type="password" placeholder="••••"></div></div>
 <button class="btn btn-primary btn-block btn-lg" data-act="login">Entrar</button></div></div>`}
const TABS=[['datos','Cliente'],['lev','Levantamiento'],['boceto','Boceto'],['acab','Acabados'],['cot','Cotización'],['pdf','PDF cliente'],['estado','Estado']];
function vLista(){const q=ui.q.toLowerCase(),f=ui.fil;const vs=S.vis.filter(v=>(f==='todas'||v.estado===f)&&(!q||[v.cliente.nombre,v.cliente.telefono,v.folio,v.cliente.direccion].join(' ').toLowerCase().includes(q)));
 return `<div class="wrap"><div class="pg-h"><div><span class="eyebrow">Hola, ${esc(S.user.nombre)}</span><h1>Mis visitas</h1></div><div class="acts acts-l">
 <button class="btn btn-primary" data-act="nueva">+ Nueva visita</button><button class="btn btn-ghost" data-act="impPre">Importar precotización</button><button class="btn btn-ghost" data-act="impVis">Importar visita (.json)</button></div></div>
 <div class="row" style="margin-bottom:16px"><div class="inp sm" style="flex:1 1 260px"><input id="q" placeholder="Buscar por cliente, teléfono, folio o dirección" value="${esc(ui.q)}" aria-label="Buscar"></div>
 <div class="chips x">${['todas',...ESTADOS].map(e=>`<button class="chip ${f===e?'on':''}" data-act="fil" data-v="${e}">${e[0].toUpperCase()+e.slice(1)}</button>`).join('')}</div></div>
 ${vs.length?`<div class="vlist">${vs.map(v=>{const t=totales(v);return `<a class="card vcard" href="#/v/${v.id}/datos"><div class="row"><span class="tag st-${v.estado}">${v.estado}</span><span class="sp"></span><small>${v.folio}</small></div><b>${esc(v.cliente.nombre||'Sin nombre')}</b><small>${esc(v.cliente.telefono||'')} ${v.cliente.direccion?'· '+esc(v.cliente.direccion):''}</small><small>${fecha(v.creado)} · ${v.items.length} piezas en boceto${v.pre?' · desde precotización':''}</small>${v.cot.lineas.length?`<b style="font-family:var(--f-h)">${money(t.total)}</b>`:''}</a>`}).join('')}</div>`:`<div class="card box center muted">${S.vis.length?'Sin resultados.':'Aún no hay visitas. Crea una o importa la precotización del cliente.'}</div>`}
 <input type="file" id="fJson" accept=".json,application/json" hidden></div>`}
function stepper(v){const i=TABS.findIndex(t=>t[0]===ui.tab);return `<ol class="stepper vt no-print">${TABS.map(([k,n],j)=>`<li class="st ${j<i?'done':''} ${j===i?'cur':''}"><a class="st-b" href="#/v/${v.id}/${k}" style="text-decoration:none"><span class="st-n"><i>${j+1}</i><svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></span>${n}</a></li>`).join('')}</ol>`}
function vVisita(v){const body={datos:tDatos,lev:tLev,boceto:tBoceto,acab:tAcab,cot:tCot,pdf:tPdf,estado:tEstado}[ui.tab]||tDatos;
 return `<div class="wrap"><div class="pg-h no-print"><div><span class="eyebrow">${v.folio} · <span class="tag st-${v.estado}">${v.estado}</span></span><h1>${esc(v.cliente.nombre||'Nueva visita')}</h1></div><div class="acts"><button class="btn btn-ghost btn-sm" data-act="expVis">Exportar JSON</button><button class="btn btn-ghost btn-sm" data-act="delVis">Eliminar</button></div></div>${stepper(v)}${body(v)}${nav(v)}</div>`}
function nav(v){const i=TABS.findIndex(t=>t[0]===ui.tab),addB=ui.tab==='boceto'&&SUBS[ui.sub].g.length;return `<div class="navbar no-print">${i>0?`<a class="btn btn-ghost nb-prev" href="#/v/${v.id}/${TABS[i-1][0]}" aria-label="Anterior: ${TABS[i-1][1]}">←<span class="lbl"> ${TABS[i-1][1]}</span></a>`:''}${addB?`<button class="btn btn-gold m-only" data-act="sheet">+ Agregar</button>`:''}<span class="sp"></span>${ui.tab==='pdf'?`<button class="btn btn-primary m-only" data-act="print">PDF</button>`:''}${i<TABS.length-1?`<a class="btn btn-primary" href="#/v/${v.id}/${TABS[i+1][0]}">${TABS[i+1][1]} →</a>`:''}</div>`}
const fld=(lab,path,val,o={})=>`<div class="field"><label>${lab}</label><div class="inp ${o.sm?'sm':''}"><input data-b="${path}" ${o.num?'data-num inputmode="decimal"':''} ${o.type?`type="${o.type}"`:''} value="${esc(val)}" placeholder="${esc(o.ph||'')}" ${o.rr?'data-rr':''}>${o.u?`<span class="unit">${o.u}</span>`:''}</div></div>`;
const chk=(lab,path,val,rr)=>`<label class="chk"><input type="checkbox" data-b="${path}" ${val?'checked':''} ${rr?'data-rr':''}> ${lab}</label>`;
function preCard(v){const p=v.pre;if(!p)return `<p class="muted" style="margin-bottom:10px">Si el cliente hizo su precotización en la web, impórtala para arrancar con sus datos.</p><button class="btn btn-ghost" data-act="impPreV">Importar precotización</button>`;
 const c=p.config||{},e=p.estimado||{};return `<div class="note ok" style="margin-bottom:10px">Viene de la precotización web del cliente.</div><dl class="kv"><dt>Tipo</dt><dd>${TIPO_N[c.tipoCocina]||esc(c.tipoCocina)}</dd><dt>Metros lineales</dt><dd>${esc(c.metrosLineales)}</dd><dt>Cubierta</dt><dd>${esc(c.cubierta)}</dd><dt>Herraje</dt><dd>${esc(c.herraje)}</dd><dt>Alcance</dt><dd>${esc(c.alcance)}</dd><dt>Estimado cliente</dt><dd>${e.min||e.max?money(e.min)+' – '+money(e.max):'—'}</dd><dt>Cita preferida</dt><dd>${esc(p.lead&&p.lead.citaPreferida||'—')}</dd>${(p.incluye||[]).length?`<dt>Incluye</dt><dd>${p.incluye.map(esc).join(', ')}</dd>`:''}</dl><button class="btn btn-ghost btn-sm" style="margin-top:10px" data-act="impPreV">Reemplazar con otra</button>`}
function tDatos(v){const c=v.cliente;return `<div class="grid2" style="gap:16px;align-items:start"><div class="card box"><h2>Datos del cliente</h2>${fld('Nombre','cliente.nombre',c.nombre,{ph:'Nombre completo',rr:0})}<div class="grid2">${fld('Teléfono','cliente.telefono',c.telefono,{type:'tel'})}${fld('Email','cliente.email',c.email,{type:'email'})}</div>${fld('Dirección del espacio','cliente.direccion',c.direccion,{ph:'Calle, número, colonia, municipio'})}${fld('Cita / fecha de visita','cliente.cita',c.cita)}</div>
 <div><div class="card box"><h2>Precotización del cliente</h2>${preCard(v)}</div><div class="card box"><h2>Fotos del espacio</h2><label class="drop" for="fFoto"><b>Agregar fotos</b><span class="muted">Se guardan reducidas en este dispositivo</span></label><input type="file" id="fFoto" accept="image/*" multiple hidden capture="environment"><div class="thumbs">${v.fotos.map((f,i)=>`<figure><img src="${f}" alt="Foto ${i+1}"><button data-act="delFoto" data-i="${i}" aria-label="Quitar">×</button></figure>`).join('')}</div></div></div></div><input type="file" id="fJson" accept=".json,application/json" hidden>`}
function tLev(v){const L=v.lev,vt=v.items.filter(i=>['vent','toma'].includes(CAT[i.kind].g));
 return `<div class="card box"><h2>Área y alturas</h2><div class="grid4">${fld('Ancho del área','lev.ancho',L.ancho,{num:1,u:'cm',rr:1})}${fld('Fondo del área','lev.fondo',L.fondo,{num:1,u:'cm',rr:1})}${fld('Altura a techo','lev.techo',L.techo,{num:1,u:'cm',rr:1})}${fld('Vista superior','lev.vistaSup',L.vistaSup,{num:1,u:'cm',rr:1})}</div><p class="help">Inferior: zoclo 11.5 + casco 75 + cubierta 3.5 = 90 cm · casco 60 / cubierta 63 de fondo. Superior: 30 de fondo × 75 alto, al techo menos la vista superior.</p></div>
 <div class="card box"><h2>Metros por muro</h2><p class="help" style="margin-bottom:8px">Activa los muros donde va mobiliario. El largo limita el muro en planta y define el alzado.</p><div class="scroll-x"><table class="tbl resp"><thead><tr><th>Muro</th><th>Con muebles</th><th class="n">Largo (cm)</th><th>Nota</th></tr></thead><tbody>${WALLS.map(w=>`<tr><td class="full"><b>Muro ${WN[w]}</b></td><td><label class="chk"><input type="checkbox" style="width:22px;height:22px" data-b="lev.muros.${w}.on" data-rr ${L.muros[w].on?'checked':''}><span class="m-only">Con muebles</span></label></td><td data-l="Largo (cm)"><input class="n" data-b="lev.muros.${w}.largo" data-num data-rr value="${L.muros[w].largo}" inputmode="decimal" aria-label="Largo muro ${w} en cm"></td><td class="full"><input data-b="lev.muros.${w}.nota" value="${esc(L.muros[w].nota)}" placeholder="Nota: ej. columna a 40 cm"></td></tr>`).join('')}</tbody></table></div></div>
 <div class="card box"><h2>Ventanas, tomas de agua y gas, contactos y apagadores</h2><div class="pal" style="margin-bottom:10px">${['ventana','puerta','agua','gas','contacto','apagador'].map(k=>`<button data-act="addVT" data-k="${k}">+ ${CAT[k].l}</button>`).join('')}</div>
 ${vt.length?`<div class="scroll-x"><table class="tbl resp"><thead><tr><th>Pieza</th><th>Muro</th><th class="n">X desde izq.</th><th class="n">Ancho</th><th class="n">Alto</th><th class="n">Altura desde piso</th><th></th></tr></thead><tbody>${vt.map(i=>`<tr><td class="full"><b>${CAT[i.kind].l}</b></td><td data-l="Muro"><select data-it="${i.id}" data-f="wall">${WALLS.map(w=>`<option ${i.wall===w?'selected':''}>${w}</option>`).join('')}</select></td>${['x','ancho','alto','y'].map(f=>`<td data-l="${{x:'X desde izq.',ancho:'Ancho',alto:'Alto',y:'Altura desde piso'}[f]} (cm)"><input class="n" data-it="${i.id}" data-f="${f}" value="${r1(i[f])}" inputmode="decimal" aria-label="${f}"></td>`).join('')}<td><button class="btn btn-ghost btn-sm" data-act="delIt" data-id="${i.id}">Quitar</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">Aún no hay piezas. También puedes colocarlas y arrastrarlas en el Boceto (paso 3).</p>'}</div>`}
function tBoceto(v){const act=WALLS.filter(w=>v.lev.muros[w].on);if(!act.includes(ui.wall))ui.wall=act[0]||'A';const sb=SUBS[ui.sub],sel=v.items.find(i=>i.id===ui.sel);
 const pal=sb.g.length?Object.keys(CAT).filter(k=>sb.g.includes(CAT[k].g)).map(k=>`<button data-act="add" data-k="${k}">+ ${CAT[k].l}<br><small class="muted">${CAT[k].a} cm</small></button>`).join(''):'';
 const R=revision(v);
 return `<div class="row" style="margin-bottom:12px"><div class="seg x">${Object.entries(SUBS).map(([k,s])=>`<button class="${ui.sub===k?'on':''}" data-act="sub" data-v="${k}">${s.l}</button>`).join('')}</div></div>
 ${ui.sub==='obs'?`<div class="card box"><h2>Observaciones</h2><textarea data-b="obs" rows="8" style="width:100%" placeholder="Detalles de obra, desniveles, columnas, colores, accesos, lo que el cliente pidió…">${esc(v.obs)}</textarea></div>`:''}
 <div class="bk"><div>${ui.sub!=='plan'&&ui.sub!=='obs'?`<div class="row" style="margin-bottom:8px"><span class="st-lbl">Alzado</span><div class="seg x">${act.map(w=>`<button class="${ui.wall===w?'on':''}" data-act="wall" data-v="${w}">Muro ${WN[w]}</button>`).join('')||'<span class="muted">Activa muros en Levantamiento</span>'}</div></div>${zctl('elev')}<div class="board" id="bElev" data-board="elev">${bsvg(v,'elev')}</div>`:''}
 <div class="row" style="margin:12px 0 8px"><span class="st-lbl">Vista en planta</span>${zctl('plan')}</div><div class="board" id="bPlan" data-board="plan">${bsvg(v,'plan')}</div></div>
 <div>${pal?`<div class="sheet-bg m-only ${ui.sheet?'open':''}" data-act="sheet"></div><div class="card box palcard ${ui.sheet?'open':''}"><div class="row"><h2 style="font-size:18px;margin:0">Agregar</h2><span class="sp"></span><button class="icon-btn m-only" data-act="sheet" aria-label="Cerrar">×</button></div><p class="help" style="margin-bottom:8px">${ui.sub==='plan'?'Se coloca en planta; arrástralo.':'Se agrega pegado al último mueble del Muro '+ui.wall+'.'}</p><div class="pal">${pal}</div></div>`:''}
 ${sel?editor(v,sel):`<div class="card box muted">Toca una pieza para editar su ancho, posición o bisagra. Arrástrala: se pega canto con canto (imán ${MAG} cm).</div>`}
 <div class="card box"><h2 style="font-size:18px">Revisión</h2>${R.length?`<ul class="chkl">${R.map(r=>`<li class="${r[0]}">${esc(r[1])}${r[2]?` <button class="btn-link" data-act="cerrar" data-w="${r[2]}" data-l="${r[3]}">Cerrar con filler + vista</button>`:''}</li>`).join('')}</ul>`:'<p class="muted">Sin piezas todavía.</p>'}</div></div></div>`}
function editor(v,it){const c=CAT[it.kind],g=c.g,i=(f,lab,u='cm')=>`<div class="field"><label>${lab}</label><div class="inp sm"><input data-it="${it.id}" data-f="${f}" value="${r1(it[f])}" inputmode="decimal"><span class="unit">${u}</span></div></div>`;
 return `<div class="card box"><span class="eyebrow">${esc(c.t)}</span><h2 style="font-size:19px;margin:4px 0 6px">${esc(c.l)}</h2>${c.r?`<p class="help">${c.r}</p>`:''}${c.h?`<p class="note" style="margin:8px 0">${c.h}</p>`:''}
 <div class="grid2">${i('ancho','Ancho')}${g==='plan'?i('prof','Fondo'):i('x','X desde la izquierda')}${g==='plan'?i('px','X en planta')+i('py','Y en planta'):''}${g==='sup'||g==='vent'||g==='toma'?i('alto','Alto'):''}${g==='vent'||g==='toma'?i('y','Altura desde piso'):''}</div>
 ${g==='inf'||g==='alto'||g==='sup'?`<p class="help">Fondo fijo: ${g==='sup'?(it.prof||30)+' cm':(c.p||60)+' cm'+(g==='inf'?' (cubierta 63)':'')} · Alto: ${r1(box(v,it).h)} cm${c.fijo?' · No se estira':''}</p>`:''}
 ${c.bis?`<div class="field" style="margin-top:8px"><label>Bisagra</label><div class="seg">${(c.bis===2?['izq','der','doble']:['izq','der']).map(b=>`<button class="${it.bisagra===b?'on':''}" data-act="bis" data-v="${b}">${{izq:'Izquierda',der:'Derecha',doble:'2 puertas'}[b]}</button>`).join('')}</div></div>`:''}
 ${c.led?chk('Tira LED bajo este mueble','_it.led',it.led,1):''}
 <div class="row" style="margin-top:10px">${g!=='plan'&&g!=='toma'&&g!=='vent'?`<button class="btn btn-ghost btn-sm" data-act="pegar" data-v="izq">⇤ Pegar izq.</button><button class="btn btn-ghost btn-sm" data-act="pegar" data-v="der">Pegar der. ⇥</button>`:''}${g==='plan'?`<button class="btn btn-ghost btn-sm" data-act="rot">Girar 90°</button>`:''}<button class="btn btn-ghost btn-sm" data-act="dup">Duplicar</button><button class="btn btn-ghost btn-sm" data-act="delIt" data-id="${it.id}">Eliminar</button></div></div>`}
function tAcab(v){const a=v.acab,opt=(path,val,cur,t,d)=>`<label class="opt"><input type="radio" name="${path}" data-b="${path}" value="${val}" ${cur===val?'checked':''}><span class="opt-in"><span class="opt-txt"><b>${t}</b><small>${d}</small></span><span class="opt-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></span></span></label>`;
 return `<div class="grid2" style="gap:16px;align-items:start"><div><div class="card box"><h2>Frentes</h2><div class="field"><label>Material</label><div class="inp"><select data-b="acab.frentesMat">${['Melamina','Alto brillo','Laca','Chapa de madera','Termoformado','PET mate'].map(m=>`<option ${a.frentesMat===m?'selected':''}>${m}</option>`).join('')}</select></div></div>${fld('Color / código inferiores','acab.frentesColor',a.frentesColor,{ph:'Ej. Nogal Terra'})}${fld('Color / código superiores','acab.supColor',a.supColor,{ph:'Ej. Blanco alto brillo'})}${chk('Alto brillo en superiores','acab.altoBrillo',a.altoBrillo)}</div>
 <div class="card box"><h2>Cubierta</h2><div class="opts opts-2">${opt('acab.cubierta','formica',a.cubierta,'Fórmica','Postformado, económico')}${opt('acab.cubierta','cuarzo',a.cubierta,'Cuarzo','Premium, salpicadera de cuarzo')}</div><div style="margin-top:12px">${fld('Color de cubierta','acab.cubiertaColor',a.cubiertaColor)}${chk('Salpicadera ('+(a.cubierta==='cuarzo'?'cuarzo':'backsplash PVC')+')','acab.salpicadera',a.salpicadera,1)}</div></div></div>
 <div><div class="card box"><h2>Herraje y jaladera</h2><div class="opts opts-2">${opt('acab.herraje','normal',a.herraje,'Normal','Bisagra y corredera estándar')}${opt('acab.herraje','cierre_lento_premium',a.herraje,'Cierre lento premium','Amortiguado en puertas y cajones')}</div><div style="margin-top:12px">${chk('Gola corrida (en lugar de jaladeras)','acab.gola',a.gola)}${fld('Color de gola','acab.golaColor',a.golaColor,{ph:'Ej. Negro mate'})}</div></div>
 <div class="card box"><h2>Iluminación y plafón</h2>${chk('Luz LED en todos los superiores','acab.luzLed',a.luzLed)}${chk('Plafón decorativo','acab.plafonDec',a.plafonDec,1)}${a.plafonDec?fld('Área de plafón decorativo (si no lo dibujas en planta)','acab.plafonDecM2',a.plafonDecM2,{num:1,u:'m²'}):''}${chk('Plafón sobre barra','acab.plafonBarra',a.plafonBarra)}<p class="help">Los spots y plafones también se dibujan en Boceto → Planta.</p></div>
 <div class="card box"><h2>Accesorios adicionales</h2><div class="grid3">${fld('Basurero','acab.accBasurero',a.accBasurero,{num:1,u:'pz'})}${fld('Especiero','acab.accEspeciero',a.accEspeciero,{num:1,u:'pz'})}${fld('Giratorio','acab.accGiratorio',a.accGiratorio,{num:1,u:'pz'})}</div><p class="help">Los muebles de basura y especiero del boceto ya incluyen su accesorio.</p></div></div></div>`}
function tCot(v){const c=v.cot,t=totales(v),ej=Object.values(S.pre).some(p=>p.ej);
 return `<div class="note" style="margin-bottom:12px">Pantalla del vendedor: aquí sí se ven precios unitarios.${ej?' Hay <b>precios de ejemplo</b> en la lista: ajústalos en <a href="#/precios">Lista de precios</a>.':''}</div>
 ${v.pre&&v.pre.estimado&&(v.pre.estimado.min||v.pre.estimado.max)?`<p class="help" style="margin-bottom:10px">Estimado que vio el cliente: ${money(v.pre.estimado.min)} – ${money(v.pre.estimado.max)}</p>`:''}
 <div class="card box"><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Partidas</h2><span class="sp"></span><button class="btn btn-primary btn-sm" data-act="gen">${c.lineas.length?'Regenerar desde boceto':'Generar desde boceto y acabados'}</button><button class="btn btn-ghost btn-sm" data-act="addLn">+ Partida</button></div>
 ${c.lineas.length?`<div class="scroll-x"><table class="tbl resp cot"><thead><tr><th style="min-width:240px">Descripción</th><th class="n">Cant.</th><th>Unidad</th><th class="n">P. unitario</th><th class="n">Importe</th><th></th></tr></thead><tbody>${c.lineas.map(l=>`<tr><td class="full"><input data-ln="${l.id}" data-f="desc" value="${esc(l.desc)}" aria-label="Descripción"></td><td data-l="Cantidad"><input class="n" data-ln="${l.id}" data-f="cant" value="${l.cant}" inputmode="decimal" aria-label="Cantidad"></td><td data-l="Unidad"><select data-ln="${l.id}" data-f="u" aria-label="Unidad">${['pieza','ml','m2','global'].map(u=>`<option ${l.u===u?'selected':''}>${u}</option>`).join('')}</select></td><td data-l="P. unitario"><input class="n" data-ln="${l.id}" data-f="precio" value="${l.precio}" inputmode="decimal" aria-label="Precio unitario"></td><td class="n" data-l="Importe" data-imp="${l.id}">${money(num(l.cant)*num(l.precio))}</td><td><button class="btn btn-ghost btn-sm" data-act="delLn" data-id="${l.id}" aria-label="Quitar">×</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">Genera las partidas a partir del boceto (una por mueble con su ancho) y de los acabados.</p>'}</div>
 <div class="grid2" style="gap:16px;align-items:start"><div class="card box"><h2>Condiciones</h2><div class="grid3">${fld('Descuento','cot.desc',c.desc,{num:1,u:'%',rr:1})}${fld('Anticipo','cot.anticipo',c.anticipo,{num:1,u:'%',rr:1})}${fld('Vigencia','cot.vigencia',c.vigencia,{num:1,u:'días',rr:1})}</div>${chk('Agregar IVA 16%','cot.iva',c.iva,1)}</div>
 <div class="card box" id="totBox">${totBox(t,c)}</div></div>`}
const totBox=(t,c)=>`<h2>Total</h2><div class="tot"><span>Subtotal</span><b>${money(t.sub)}</b>${t.desc?`<span>Descuento ${num(c.desc)}%</span><b>− ${money(t.desc)}</b>`:''}${c.iva?`<span>IVA 16%</span><b>${money(t.iva)}</b>`:''}<span class="big">Total</span><span class="big">${money(t.total)}</span><span>Anticipo ${num(c.anticipo)}%</span><b>${money(t.ant)}</b><span>Saldo</span><b>${money(t.saldo)}</b><span>Vigente hasta</span><b>${fecha(t.vence)}</b></div>`;
function tPdf(v){return tPdf0(v).replace(/<table class="tbl">/g,'<div class="scroll-x"><table class="tbl">').replace(/<\/table>/g,'</table></div>')}
function tPdf0(v){const c=v.cliente,a=v.acab,t=totales(v),act=WALLS.filter(w=>v.lev.muros[w].on),pu=ui.showPU;
 const rows=g=>v.items.filter(i=>g.includes(CAT[i.kind].g)).sort((x,y)=>x.wall.localeCompare(y.wall)||x.x-y.x);
 const tb=(its)=>`<table class="tbl"><thead><tr><th>Pieza</th><th>Muro</th><th class="n">X</th><th class="n">Ancho</th><th class="n">Alto</th><th class="n">Fondo</th><th>Bisagra / LED</th></tr></thead><tbody>${its.map(i=>`<tr><td>${CAT[i.kind].l}</td><td>${i.wall}</td><td class="n">${r1(i.x)}</td><td class="n">${r1(i.ancho)}</td><td class="n">${r1(box(v,i).h)}</td><td class="n">${CAT[i.kind].g==='sup'?(i.prof||30):(CAT[i.kind].p||60)}</td><td>${i.bisagra?{izq:'Izq.',der:'Der.',doble:'2P'}[i.bisagra]:''}${i.led?' · LED':''}</td></tr>`).join('')}</tbody></table>`;
 const inf=rows(['inf','alto']),sup=rows(['sup']),vt=rows(['vent','toma']),pl=v.items.filter(i=>CAT[i.kind].g==='plan');
 return `<div class="row no-print" style="margin-bottom:12px"><label class="chk"><input type="checkbox" data-act="pu" ${pu?'checked':''}> Mostrar precios unitarios al cliente</label><span class="sp"></span><button class="btn btn-primary" data-act="print">Imprimir / Guardar PDF</button></div>
 <article class="doc"><div class="doc-h"><div class="brand"><span class="mono"><svg viewBox="0 0 40 40" width="44" height="44"><rect x="1" y="1" width="38" height="38" rx="9" fill="#1C1A17"/><text x="20" y="26.5" text-anchor="middle" fill="#FAF7F2" style="font:700 17px Fraunces,serif">DM</text><path d="M11 31h18" stroke="#B88A3E" stroke-width="2"/></svg></span><span class="wordmark"><b>DOMUS MAGNA</b><small>Diseño de espacios que trascienden</small></span></div><div style="text-align:right;font-size:13px"><b>Cotización ${v.folio}</b><br>${fecha(v.cot.fechaEmision||Date.now())}<br>Asesor: ${esc(v.vendedor)}</div></div>
 <h2>Cliente</h2><dl class="kv"><dt>Nombre</dt><dd>${esc(c.nombre)||'—'}</dd><dt>Teléfono</dt><dd>${esc(c.telefono)||'—'}</dd><dt>Email</dt><dd>${esc(c.email)||'—'}</dd><dt>Dirección</dt><dd>${esc(c.direccion)||'—'}</dd></dl>
 <h2>Boceto</h2><div class="el"><figure>${planSVG(v)}<figcaption>Planta · ${v.lev.ancho}×${v.lev.fondo} cm · techo ${v.lev.techo} cm</figcaption></figure>${act.map(w=>`<figure>${elevSVG(v,w)}<figcaption>Alzado muro ${WN[w]}</figcaption></figure>`).join('')}</div>
 ${inf.length?`<h2>Mobiliario inferior</h2>${tb(inf)}`:''}${sup.length?`<h2>Mobiliario superior</h2>${tb(sup)}`:''}
 ${pl.length?`<h2>Barras, plafones y luces</h2><table class="tbl"><tbody>${pl.map(i=>`<tr><td>${CAT[i.kind].l}</td><td class="n">${r1(i.ancho)} × ${r1(i.prof)} cm</td></tr>`).join('')}</tbody></table>`:''}
 ${vt.length?`<h2>Ventanas, tomas y contactos</h2><table class="tbl"><thead><tr><th>Pieza</th><th>Muro</th><th class="n">X</th><th class="n">Ancho</th><th class="n">Alto</th><th class="n">Altura desde piso</th></tr></thead><tbody>${vt.map(i=>`<tr><td>${CAT[i.kind].l}</td><td>${i.wall}</td><td class="n">${r1(i.x)}</td><td class="n">${r1(i.ancho)}</td><td class="n">${r1(i.alto)}</td><td class="n">${r1(i.y)}</td></tr>`).join('')}</tbody></table>`:''}
 <h2>Acabados</h2><dl class="kv"><dt>Frentes</dt><dd>${esc(a.frentesMat)} ${esc(a.frentesColor)}${a.supColor?' · superiores '+esc(a.supColor):''}${a.altoBrillo?' · alto brillo en superiores':''}</dd><dt>Cubierta</dt><dd>${a.cubierta==='cuarzo'?'Cuarzo':'Fórmica'} ${esc(a.cubiertaColor)}${a.salpicadera?' · con salpicadera':''}</dd><dt>Herraje</dt><dd>${a.herraje==='cierre_lento_premium'?'Cierre lento premium':'Normal'}${a.gola?' · gola corrida '+esc(a.golaColor):''}</dd><dt>Iluminación</dt><dd>${a.luzLed?'LED en superiores':'—'}${a.plafonDec?' · plafón decorativo':''}${a.plafonBarra?' · plafón sobre barra':''}</dd></dl>
 ${v.obs?`<h2>Observaciones</h2><p style="white-space:pre-wrap;font-size:13.5px">${esc(v.obs)}</p>`:''}
 <h2>Cotización</h2>${v.cot.lineas.length?`<table class="tbl"><thead><tr><th>Concepto</th><th class="n">Cant.</th><th>Unidad</th>${pu?'<th class="n">P. unitario</th><th class="n">Importe</th>':''}</tr></thead><tbody>${v.cot.lineas.map(l=>`<tr><td>${esc(l.desc)}</td><td class="n">${l.cant}</td><td>${l.u}</td>${pu?`<td class="n">${money(l.precio)}</td><td class="n">${money(num(l.cant)*num(l.precio))}</td>`:''}</tr>`).join('')}</tbody></table><div style="max-width:360px;margin:12px 0 0 auto">${totBox(t,v.cot).replace('<h2>Total</h2>','')}</div>`:'<p class="muted">Sin partidas: genera la cotización en el paso 5.</p>'}
 <p style="font-size:12px;margin-top:10px">Anticipo de ${num(v.cot.anticipo)}% para iniciar fabricación. Cotización vigente ${num(v.cot.vigencia)} días (hasta ${fecha(t.vence)}). Medidas sujetas a rectificación en obra.</p>
 <h2>Firma de conformidad del cliente</h2>${v.firma?`<img src="${v.firma}" alt="Firma" style="max-width:360px;height:auto;border-bottom:1px solid #1C1A17">`:'<div style="height:70px;border-bottom:1px solid #1C1A17;max-width:360px"></div>'}<p style="font-size:12px">${esc(c.nombre)}</p></article>
 <div class="card box no-print" style="margin-top:16px;max-width:960px;margin-inline:auto"><h2>Firma en tablet</h2><canvas class="sig" id="sig"></canvas><div class="row" style="margin-top:8px"><button class="btn btn-ghost btn-sm" data-act="sigClr">Limpiar</button><button class="btn btn-primary btn-sm" data-act="sigOk">Guardar firma</button></div></div>`}
function tEstado(v){return `<div class="grid2" style="gap:16px;align-items:start"><div class="card box"><h2>Cambiar estado</h2><div class="chips" style="margin-bottom:12px">${ESTADOS.map(e=>`<button class="chip ${v.estado===e?'on':''}" data-act="setEst" data-v="${e}">${e}</button>`).join('')}</div><div class="field"><label for="estNota">Nota (opcional)</label><textarea id="estNota" rows="3" placeholder="Ej. Se envió PDF por WhatsApp"></textarea></div><button class="btn btn-primary" data-act="estOk">Guardar estado</button></div>
 <div class="card box"><h2>Línea de tiempo</h2><ul class="tl">${[...v.historial].reverse().map(h=>`<li><span class="tag st-${h.estado}">${h.estado}</span> <small class="muted">${fechaH(h.t)}</small><div>${esc(h.nota||'')}</div></li>`).join('')}</ul></div></div>`}
function vPrecios(){const ks=Object.keys(S.pre);return `<div class="wrap"><div class="pg-h"><div><span class="eyebrow">Configuración</span><h1>Lista de precios</h1></div><div class="acts"><button class="btn btn-ghost" data-act="resetPre">Restaurar ejemplo</button></div></div>
 <div class="note" style="margin-bottom:12px">Los precios marcados “ejemplo” son <b>precios de ejemplo, ajustar</b>. No son la lista real de Domus Magna. Se guardan en este dispositivo.</div>
 <div class="card box scroll-x"><table class="tbl resp"><thead><tr><th>Concepto</th><th>Unidad</th><th class="n">Precio (MXN)</th><th></th></tr></thead><tbody>${ks.map(k=>{const p=S.pre[k];return `<tr><td class="full"><input data-pk="${k}" data-f="n" value="${esc(p.n)}"></td><td data-l="Unidad"><select data-pk="${k}" data-f="u">${['ml','pieza','m2','global'].map(u=>`<option ${p.u===u?'selected':''}>${u}</option>`).join('')}</select></td><td data-l="Precio (MXN)"><input class="n" data-pk="${k}" data-f="p" value="${p.p}" inputmode="decimal"></td><td>${p.ej?'<span class="tag st-enviada">ejemplo</span>':'<span class="tag">ajustado</span>'}</td></tr>`}).join('')}</tbody></table></div></div>`}

/* ================= Eventos ================= */
function setPath(o,path,val){const ps=path.split('.');let t=o;for(let i=0;i<ps.length-1;i++)t=t[ps[i]];t[ps.at(-1)]=val}
function rer(){const y=scrollY;render();scrollTo(0,y)}
document.addEventListener('input',e=>{const el=e.target;
 if(el.id==='q'){ui.q=el.value;const p=el.selectionStart;rer();const n=$('#q');n.focus();n.setSelectionRange(p,p);return}
 const v=cur();
 if(el.dataset.b&&v&&el.type!=='checkbox'&&el.type!=='radio'&&el.tagName!=='SELECT'){setPath(v,el.dataset.b,'num' in el.dataset?num(el.value):el.value);save();if(el.dataset.b.startsWith('cot.')){const b=$('#totBox');if(b)b.innerHTML=totBox(totales(v),v.cot)}return}
 if(el.dataset.ln&&v){const l=v.cot.lineas.find(x=>x.id===el.dataset.ln);if(!l)return;l[el.dataset.f]=el.dataset.f==='desc'?el.value:num(el.value);save();const c=$(`[data-imp="${l.id}"]`);if(c)c.textContent=money(num(l.cant)*num(l.precio));const b=$('#totBox');if(b)b.innerHTML=totBox(totales(v),v.cot);return}
 if(el.dataset.pk){const p=S.pre[el.dataset.pk];p[el.dataset.f]=el.dataset.f==='p'?num(el.value):el.value;p.ej=false;savePre()}});
document.addEventListener('change',e=>{const el=e.target,v=cur();
 if(el.dataset.b&&v){let val=el.type==='checkbox'?el.checked:'num' in el.dataset?num(el.value):el.value;if(el.dataset.b==='_it.led'){const it=v.items.find(i=>i.id===ui.sel);if(it)it.led=val}else setPath(v,el.dataset.b,val);
  if(el.dataset.b==='acab.luzLed')v.items.forEach(i=>{if(CAT[i.kind].led)i.led=val});save();if('rr' in el.dataset||el.type==='radio')rer();return}
 if(el.dataset.it&&v){const it=v.items.find(i=>i.id===el.dataset.it);if(!it)return;const f=el.dataset.f;if(f==='wall')it.wall=el.value;else if(f==='ancho')setAncho(v,it,num(el.value));else it[f]=r1(num(el.value));save();rer();return}
 if(el.dataset.pk){rer();return}
 if(el.id==='fFoto'&&v){addFotos(v,el.files);return}
 if(el.id==='fJson'){const f=el.files[0];if(f)f.text().then(tx=>importJson(tx,el.dataset.mode,v)).catch(er=>toast(er.message));el.value='';return}});
function importJson(tx,mode,v){try{const o=JSON.parse(tx);
 if(mode==='vis'){if(!o.id||!o.items)throw new Error('No es un archivo de visita.');if(S.vis.some(x=>x.id===o.id))o.id=uid();S.vis.unshift(o);save();toast('Visita importada');return go(`#/v/${o.id}/datos`)}
 const t=v&&mode==='preV'?v:newVisit();applyPre(t,o);if(t!==v)S.vis.unshift(t);save();toast('Precotización importada');go(`#/v/${t.id}/datos`);rer()}catch(er){toast('No se pudo importar: '+er.message)}}
function preDialog(v){const d=document.createElement('dialog');d.className='card';d.style.cssText='max-width:560px;width:92vw;padding:20px;border:1px solid var(--line);border-radius:16px';
 d.innerHTML=`<h2 style="font:600 22px var(--f-h);margin-bottom:8px">Importar precotización</h2><p class="help" style="margin-bottom:8px">Pega el JSON que genera la app de clientes, o el enlace/código base64, o sube el archivo .json.</p><textarea id="preTx" rows="8" style="width:100%" placeholder='{"origen":"precotizacion_web", ...}'></textarea><div class="row" style="margin-top:10px"><button class="btn btn-ghost btn-sm" id="preF">Subir .json</button><span class="sp"></span><button class="btn btn-ghost btn-sm" id="preX">Cancelar</button><button class="btn btn-primary btn-sm" id="preOk">Importar</button></div>`;
 document.body.appendChild(d);d.showModal();const close=()=>{d.close();d.remove()};
 $('#preX',d).onclick=close;$('#preF',d).onclick=()=>{close();const f=$('#fJson');f.dataset.mode=v?'preV':'pre';f.click()};
 $('#preOk',d).onclick=()=>{let s=$('#preTx',d).value.trim();try{let o;if(s.startsWith('{'))o=JSON.parse(s);else{const m=s.match(/[?&]pre=([^&#\s]+)/);o=decodePre(decodeURIComponent(m?m[1]:s))}close();importJson(JSON.stringify(o),v?'preV':'pre',v)}catch(er){toast('Formato no válido: '+er.message)}}}
function addFotos(v,files){[...files].forEach(f=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const k=Math.min(1,800/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=img.width*k;c.height=img.height*k;c.getContext('2d').drawImage(img,0,0,c.width,c.height);v.fotos.push(c.toDataURL('image/jpeg',.72));save();rer()};img.src=r.result};r.readAsDataURL(f)})}
function download(name,obj){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,1)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const act=b.dataset.act,v=cur(),it=v&&v.items.find(i=>i.id===ui.sel);
 const A={
 login(){const n=$('#lgN').value.trim(),p=$('#lgP').value.trim();if(!n||!/^\d{4}$/.test(p))return toast('Escribe tu nombre y un PIN de 4 dígitos');const vs=LS.get(K.vend,[]),f=vs.find(x=>x.nombre.toLowerCase()===n.toLowerCase());if(f&&f.pin!==p)return toast('PIN incorrecto');if(!f){vs.push({nombre:n,pin:p});LS.set(K.vend,vs)}S.user={nombre:f?f.nombre:n};LS.set(K.ses,S.user);render()},
 logout(){S.user=null;localStorage.removeItem(K.ses);go('#/visitas')},
 nueva(){const n=newVisit();S.vis.unshift(n);save();go(`#/v/${n.id}/datos`)},
 impPre(){preDialog(null)},impPreV(){preDialog(v)},
 impVis(){const f=$('#fJson');f.dataset.mode='vis';f.click()},
 fil(){ui.fil=b.dataset.v;rer()},
 expVis(){download(`${v.folio}.json`,v)},
 delVis(){if(confirm('¿Eliminar esta visita de este dispositivo?')){S.vis=S.vis.filter(x=>x!==v);save();go('#/visitas')}},
 delFoto(){v.fotos.splice(+b.dataset.i,1);save();rer()},
 addVT(){const w=WALLS.find(x=>v.lev.muros[x].on)||'A';v.items.push(mkItem(v,b.dataset.k,w));save();rer()},
 sub(){ui.sub=b.dataset.v;ui.sel=null;rer()},
 sheet(){ui.sheet=!ui.sheet;rer()},
 zoom(){const k=b.dataset.k,z=ui.zoom[k]+(+b.dataset.v)*0.5;ui.zoom[k]=Math.min(3,Math.max(1,z));rer()},wall(){ui.wall=b.dataset.v;ui.sel=null;rer()},
 add(){const k=b.dataset.k,c=CAT[k];const n=mkItem(v,k,ui.wall);if(c.g==='plan'){n.px=r1(Math.max(0,(num(v.lev.ancho)-n.ancho)/2));n.py=r1(Math.max(0,(num(v.lev.fondo)-n.prof)/2))}v.items.push(n);ui.sel=n.id;ui.sheet=false;save();
  if(c.g!=='plan'){const t=tramo(v,ui.wall,layer(c.g));if(t.sobra<-0.05)toast(`No cabe: excede ${-t.sobra} cm el Muro ${ui.wall}`)}rer()},
 bis(){it.bisagra=b.dataset.v;save();rer()},pegar(){pegar(v,it,b.dataset.v);save();rer()},
 rot(){it.rot=it.rot?0:1;save();rer()},
 dup(){const n=JSON.parse(JSON.stringify(it));n.id=uid();const c=CAT[n.kind];if(c.g==='plan'){n.px+=10;n.py+=10}else if(c.g==='inf'||c.g==='alto'||c.g==='sup'){n.x=layerItems(v,n.wall,layer(c.g)).reduce((m,o)=>Math.max(m,r1(o.x+o.ancho)),0)}else n.x=r1(n.x+n.ancho+10);v.items.push(n);ui.sel=n.id;save();rer()},
 delIt(){v.items=v.items.filter(i=>i.id!==b.dataset.id);if(ui.sel===b.dataset.id)ui.sel=null;save();rer()},
 cerrar(){const r=cerrarSobrante(v,b.dataset.w,b.dataset.l);save();toast(`Cerrado: ${r} cm con filler + vista`);rer()},
 gen(){if(v.cot.lineas.length&&!confirm('Esto reemplaza las partidas actuales con las del boceto. ¿Continuar?'))return;v.cot.lineas=genLineas(v);v.cot.fechaEmision=Date.now();save();rer()},
 addLn(){v.cot.lineas.push({id:uid(),desc:'Concepto',cant:1,u:'pieza',precio:0});save();rer()},
 delLn(){v.cot.lineas=v.cot.lineas.filter(l=>l.id!==b.dataset.id);save();rer()},
 pu(){ui.showPU=b.checked;rer()},
 print(){window.print()},
 sigClr(){const c=$('#sig');c.getContext('2d').clearRect(0,0,c.width,c.height);v.firma=null;save();rer()},
 sigOk(){const c=$('#sig');if(!c.dataset.dirty)return toast('Firma vacía');v.firma=c.toDataURL('image/png');v.historial.push({t:Date.now(),estado:v.estado,nota:'Firma del cliente capturada'});save();toast('Firma guardada');rer()},
 setEst(){ui.estSel=b.dataset.v;$$('[data-act="setEst"]').forEach(x=>x.classList.toggle('on',x===b))},
 estOk(){const e=ui.estSel||v.estado,n=$('#estNota').value.trim();v.estado=e;v.historial.push({t:Date.now(),estado:e,nota:n||'Cambio de estado'});ui.estSel=null;save();toast('Estado guardado');rer()},
 resetPre(){if(confirm('¿Restaurar la lista de precios de ejemplo? Se pierden tus ajustes.')){S.pre=seedPrecios();savePre();rer()}},
 };if(A[act]){if(act!=='pu')e.preventDefault();A[act]()}});

/* ===== Tableros: arrastre con imán ===== */
let drag=null;
function svgPt(svg,e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
function after(v){
 const c=$('#sig');if(c){const r=c.getBoundingClientRect();c.width=r.width*2;c.height=r.height*2;const x=c.getContext('2d');x.scale(2,2);x.lineWidth=2.2;x.lineCap='round';x.strokeStyle='#1C1A17';
  if(v.firma){const im=new Image();im.onload=()=>x.drawImage(im,0,0,r.width,r.height);im.src=v.firma}
  let on=false;c.onpointerdown=e=>{on=true;c.setPointerCapture(e.pointerId);x.beginPath();x.moveTo(e.offsetX,e.offsetY)};c.onpointermove=e=>{if(!on)return;x.lineTo(e.offsetX,e.offsetY);x.stroke();c.dataset.dirty=1};c.onpointerup=()=>on=false}}
document.addEventListener('pointerdown',e=>{const bd0=e.target.closest('.board');if(!bd0)return;const v=cur();if(!v)return;
 const ae=document.activeElement;if(ae&&ae.matches&&ae.matches('input,select,textarea'))ae.blur(); /* el blur puede re-renderizar */
 const bd=document.getElementById(bd0.id);if(!bd)return;e.preventDefault();
 const hit=document.elementFromPoint(e.clientX,e.clientY),g=hit&&bd.contains(hit)?hit.closest('.it'):null;
 if(!g){drag={pan:1,bd:bd.id,sx:e.clientX,sy:e.clientY,sl:bd.scrollLeft,st:bd.scrollTop,moved:0};try{bd.setPointerCapture(e.pointerId)}catch(_){}return}
 const it=v.items.find(i=>i.id===g.dataset.id);if(!it)return;const svg=bd.querySelector('svg'),p=svgPt(svg,e),c=CAT[it.kind];
 if(bd.dataset.board==='plan'&&c.g!=='plan'){ui.sel=it.id;if(it.wall&&ui.sub!=='plan')ui.wall=it.wall;rer();return}
 ui.sel=it.id;try{bd.setPointerCapture(e.pointerId)}catch(_){}
 const H=num(v.lev.techo),pl=bd.dataset.board==='plan';drag={id:it.id,bd:bd.id,mode:bd.dataset.board,dx:pl?p.x-it.px:p.x-(M+it.x),dy:pl?p.y-it.py:p.y-(M+H-it.y-it.alto)};redraw(v)});
document.addEventListener('pointermove',e=>{if(!drag)return;const v=cur(),bd=document.getElementById(drag.bd);if(!v||!bd)return;
 if(drag.pan){const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=1;bd.scrollLeft=drag.sl-dx;bd.scrollTop=drag.st-dy;if(drag.moved&&bd.scrollHeight<=bd.clientHeight+1)scrollBy(0,-(e.movementY||0));return}const it=v.items.find(i=>i.id===drag.id),svg=bd.querySelector('svg'),p=svgPt(svg,e),c=CAT[it.kind];
 if(drag.mode==='plan'){const d=pdims(it),ed=edgesFor(v,it);it.px=magnet(p.x-drag.dx,d.w,ed.xs);it.py=magnet(p.y-drag.dy,d.h,ed.ys)}
 else{const L=wallLen(v,it.wall),ed=edgesFor(v,it);let x=p.x-drag.dx-M;x=Math.max(0,Math.min(L-it.ancho,x));it.x=magnet(x,it.ancho,ed.xs);
  if(c.g==='vent'||c.g==='toma'){const H=num(v.lev.techo);it.y=Math.max(0,Math.round((M+H-(p.y-drag.dy)-it.alto)*2)/2)}}
 redraw(v)});
const endDrag=()=>{if(!drag)return;const d=drag;drag=null;if(d.pan){if(!d.moved&&ui.sel){ui.sel=null;rer()}return}save();rer()};
document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);
function redraw(v){const e=$('#bElev'),p=$('#bPlan');if(e)e.innerHTML=bsvg(v,'elev');if(p)p.innerHTML=bsvg(v,'plan')}
ui.zoom={elev:1,plan:1};
function bsvg(v,k){const z=ui.zoom[k],s=k==='elev'?elevSVG(v,ui.wall,{sel:ui.sel}):planSVG(v,{sel:ui.sel});return s.replace('<svg ',`<svg style="width:${z*100}%;${z>1?'max-height:none':''}" `)}
const zctl=k=>`<span class="zctl"><button class="icon-btn" data-act="zoom" data-k="${k}" data-v="-1" aria-label="Alejar">−</button><b>${Math.round(ui.zoom[k]*100)}%</b><button class="icon-btn" data-act="zoom" data-k="${k}" data-v="1" aria-label="Acercar">+</button></span>`;

/* ===== Arranque: ?pre=<base64 json> desde la app de clientes ===== */
(function(){const q=new URLSearchParams(location.search),pre=q.get('pre');if(pre){try{sessionStorage.setItem('dmv-pre',JSON.stringify(decodePre(pre)))}catch(e){setTimeout(()=>toast('Enlace de precotización inválido'),300)}history.replaceState(null,'',location.pathname+(location.hash||'#/visitas'))}})();
window.DMV={S,CAT,mkItem,setAncho,magnet,edgesFor,pegar,tramo,genLineas,totales,encodePre,decodePre,applyPre,newVisit,save};
render();
