// Source snapshot: Tuttocampo San Vitale 1995 Sq. B, Rosa/Staff, 24/09/2026.
// Suggestions are applied only by an online Admin, to exact existing names.
const birthdaySuggestions = {
 // Corrections supplied by the user on 24/09/2026.
 'Gugole Denis':'2004-09-26','Rossetto Andrea':'2008-05-01','Preci Stiven':'2006-04-08','Quaggiotto Omar':'2003-02-20',
 'Marchesini Elia Nicola':'1999-05-05','Rossetto Mathias':'2003-12-06','Cheikh Ahmed Tidiane':'2006-05-08',
 'Martin Edoardo':'2004-11-09',
 'Ganassin Pietro':'2003-10-13',
 // Birth year corrected and confirmed by the user: 1994.
 'Bettin Matteo':'1994-12-07',
 'Boateng Terry':'1990-07-12','Brun Bryan':'2003-04-09','Dambi Matteo':'1999-04-22',
 'Danda Riccardo':'2005-09-16','De Benedetto Simone':'2007-02-26','De Marchi Daniel':'1999-06-24',
 'Diakite Malick':'2003-09-02','Diakite Souleymane':'2004-05-02','Farris Valentino':'2005-06-23',
 'Ghiotto Andrea':'2000-05-04','Guandalini Lorenzo':'2005-03-12','Marchesini Elia':'1999-05-05',
 'Marcigaglia Filippo':'1999-05-26','Ndiaye Cheick':'2006-05-08','Piccinotti Mattia':'2004-07-07',
 'Portinari Riccardo':'2006-02-04','Rigolon Daniele':'2005-10-04','Rigolon Davide':'1997-12-26',
 'Rossetto Daniele':'1995-12-23','Rossetto Mattias':'2003-12-06','Tucci Jacopo':'2006-02-17'
};
let birthdayDismissedMemory = {};
function birthdayToday(now=new Date()) {
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(x=>[x.type,x.value]));
 return `${p.year}-${p.month}-${p.day}`;
}
function validBirthday(value,today=birthdayToday()) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||value>today)return false;
 const [y,m,d]=value.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d));
 return y>=1900&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;
}
function birthdayNames() {
 return [...new Set(state.players)].sort((a,b)=>a.localeCompare(b,'it'));
}
function getBirthday(name) {
 const dates=state.playerBirthDates;
 return dates&&Object.hasOwn(dates,name)&&typeof dates[name]==='string'?dates[name]:'';
}
function setBirthday(name,value) {
 state.playerBirthDates={...(state.playerBirthDates&&typeof state.playerBirthDates==='object'&&!Array.isArray(state.playerBirthDates)?state.playerBirthDates:{}),[name]:value};
}
function birthdaysOn(today=birthdayToday()) {
 return birthdayNames().filter(name=>validBirthday(getBirthday(name),today)&&getBirthday(name).slice(5)===today.slice(5)&&getBirthday(name)<today);
}
function birthdayDismissals() {
 try {const saved=JSON.parse(localStorage.getItem(STORAGE_KEY+'_birthday_dismissals')||'{}');return saved&&typeof saved==='object'?{...saved,...birthdayDismissedMemory}:birthdayDismissedMemory;}catch{return birthdayDismissedMemory;}
}
function renderBirthdayBanners(today=birthdayToday()) {
 const dismissed=birthdayDismissals();
 return birthdaysOn(today).filter(name=>dismissed[name]!==today).map(name=>`<aside class="birthday-banner" aria-label="Compleanno di ${escapeHtml(name)}"><span class="birthday-cake" aria-hidden="true">🎂</span><div><small>OGGI SI FESTEGGIA</small><strong>Auguri, ${escapeHtml(name)}!</strong><span>Compie ${Number(today.slice(0,4))-Number(getBirthday(name).slice(0,4))} anni 🎉</span></div><button type="button" data-dismiss-birthday="${escapeHtml(name)}" aria-label="Chiudi gli auguri per ${escapeHtml(name)}">×</button></aside>`).join('');
}
function refreshBirthdayBanners() {
 const root=document.getElementById('birthdayBanners');if(!root)return;
 const html=renderBirthdayBanners();if(root.innerHTML!==html)root.innerHTML=html;
 root.querySelectorAll('[data-dismiss-birthday]').forEach(button=>button.onclick=()=>{
  const name=button.dataset.dismissBirthday,today=birthdayToday();birthdayDismissedMemory[name]=today;
  const values=Object.fromEntries(Object.entries(birthdayDismissals()).filter(([,day])=>day===today));values[name]=today;
  try{localStorage.setItem(STORAGE_KEY+'_birthday_dismissals',JSON.stringify(values));}catch{}
  refreshBirthdayBanners();
 });
}
function renderBirthdaySettings() {
 return `<section class="card birthday-settings"><div class="section-title"><h2>🎂 Compleanni squadra e staff</h2></div><p class="small muted">Date facoltative. Per il 29 febbraio gli auguri compaiono negli anni bisestili.</p><div class="birthday-list">${birthdayNames().map(name=>`<div class="birthday-person"><div><strong>${escapeHtml(name)}</strong><span>${validBirthday(getBirthday(name))?getBirthday(name).split('-').reverse().join('/'):'Data da inserire'}</span></div><button type="button" class="btn secondary" data-birthday-edit="${escapeHtml(name)}" ${canMutate()?'':'disabled'}>Modifica</button></div>`).join('')}</div><div class="birthday-actions"><button class="btn secondary" id="importBirthdayDates" type="button" ${canMutate()?'':'disabled'}>Date da Tuttocampo</button></div></section>`;
}
function openBirthdayEditor(name) {
 if(!requireOnlineAdmin() || !birthdayNames().includes(name))return;
 openModal('Modifica giocatore',`<div class="form"><div class="field"><label for="editPlayerName">Nome e cognome</label><input id="editPlayerName" type="text" value="${escapeHtml(name)}" autocomplete="off"></div><div class="field"><label for="birthdayDate">Data di nascita (facoltativa)</label><input id="birthdayDate" type="date" min="1900-01-01" max="${birthdayToday()}" value="${validBirthday(getBirthday(name))?getBirthday(name):''}"></div><p class="small muted">Multe e pagamenti resteranno collegati al giocatore anche se cambi il nome.</p><div class="modal-actions"><button class="btn secondary" id="cancelBirthday" type="button">Annulla</button><button class="btn" id="saveBirthday" type="button">Salva</button></div></div>`);
 document.getElementById('cancelBirthday').onclick=closeModal;
 document.getElementById('saveBirthday').onclick=()=>{
  if(!requireOnlineAdmin())return;
  const person=name,value=document.getElementById('birthdayDate').value,newName=document.getElementById('editPlayerName').value.trim();
  if(!birthdayNames().includes(person))return showToast('Persona non più presente. Riapri la scheda.');
  if(value&&!validBirthday(value))return showToast('Inserisci una data di nascita valida.');
  if(!newName)return showToast('Inserisci il nome.');
  const error=renameBirthdayPlayer(person,newName,value);
  if(error)return showToast(error);
  saveState();closeModal();render();showToast('Giocatore aggiornato.');
 };
}
function renameBirthdayPlayer(oldName,newName,birthDate) {
 if(!canMutate())return 'Modifica consentita solo ad Admin online.';
 if(!state.players.includes(oldName)||!newName.trim())return 'Giocatore o nome non valido.';
 if(birthDate&&!validBirthday(birthDate))return 'Data di nascita non valida.';
 if(newName!==oldName) {
  const equal=n=>typeof n==='string'&&n!==oldName&&n.trim().toLocaleLowerCase('it')===newName.toLocaleLowerCase('it');
  const occupied=[...state.players,...state.fines.map(f=>f.player),...Object.values(state.payments||{}).flatMap(month=>Object.keys(month||{})),...Object.keys(state.playerBirthDates||{})];
  if(occupied.some(equal))return 'Nome già presente nella rosa o nello storico. Scegli un nome diverso.';
 }
 const next=structuredClone(state);
 next.players=next.players.map(n=>n===oldName?newName:n);
 next.fines.forEach(f=>{if(f.player===oldName)f.player=newName;});
 if(newName!==oldName)for(const [month,values] of Object.entries(next.payments||{})) {
  if(values&&Object.hasOwn(values,oldName)){
   next.payments[month]={...values,[newName]:values[oldName]};delete next.payments[month][oldName];
  }
 }
 next.playerBirthDates={...(next.playerBirthDates||{}),[newName]:birthDate};
 if(newName!==oldName)delete next.playerBirthDates[oldName];
 state=next;
 if(newName!==oldName){
  const dismissed=birthdayDismissals();if(Object.hasOwn(dismissed,oldName)){
   dismissed[newName]=dismissed[oldName];delete dismissed[oldName];birthdayDismissedMemory=dismissed;
   try{localStorage.setItem(STORAGE_KEY+'_birthday_dismissals',JSON.stringify(dismissed));}catch{}
  }
 }
 return '';
}
function openBirthdayImport() {
 if(!requireOnlineAdmin())return;
 const candidates=birthdayNames().filter(n=>!getBirthday(n)&&Object.hasOwn(birthdaySuggestions,n));
 openModal('Date da Tuttocampo',`<p>Importa solo le date mancanti dei nomi corrispondenti. Le date già inserite restano invariate.</p><div class="birthday-list">${candidates.map(n=>`<div class="birthday-person"><strong>${escapeHtml(n)}</strong><span>${birthdaySuggestions[n].split('-').reverse().join('/')}</span></div>`).join('')||'<p>Nessuna nuova corrispondenza certa.</p>'}</div><div class="modal-actions"><button class="btn secondary" id="cancelBirthdayImport" type="button">Annulla</button><button class="btn" id="saveBirthdayImport" type="button" ${candidates.length?'':'disabled'}>Importa ${candidates.length} date</button></div>`);
 document.getElementById('cancelBirthdayImport').onclick=closeModal;
 document.getElementById('saveBirthdayImport').onclick=()=>{
  if(!requireOnlineAdmin())return;
  const current=birthdayNames();let count=0;
  candidates.forEach(n=>{if(current.includes(n)&&!getBirthday(n)){setBirthday(n,birthdaySuggestions[n]);count++;}});
  if(count)saveState();closeModal();render();showToast(`${count} date importate.`);
 };
}
function bindBirthdayEvents() {
 refreshBirthdayBanners();
 document.querySelectorAll('[data-birthday-edit]').forEach(b=>b.onclick=()=>openBirthdayEditor(b.dataset.birthdayEdit));
 const imp=document.getElementById('importBirthdayDates');if(imp)imp.onclick=openBirthdayImport;
}
setInterval(refreshBirthdayBanners,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshBirthdayBanners();});
window.addEventListener('pageshow',refreshBirthdayBanners);
