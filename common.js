// ---- DOM helpers ----
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));

// ---- Status / messages ----
function status(t,c=''){let e=$('#status');if(e){e.textContent=t;e.className='status '+c}}

// ---- Clipboard / files ----
async function copyText(t,btn){
  if(!t)return status('Nothing to copy.','error');
  try{
    await navigator.clipboard.writeText(t);
    status('Copied to clipboard.','success');
    if(btn){let old=btn.textContent;btn.textContent='Copied!';setTimeout(()=>btn.textContent=old,1200)}
  }catch{status('Copy failed. Select and copy manually.','error')}
}
function downloadText(n,t,type='text/plain'){
  let b=new Blob([t],{type}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=n;a.click();URL.revokeObjectURL(a.href)
}
function loadFile(cb){
  let i=document.createElement('input');
  i.type='file';i.accept='.json,.csv,.txt,.log,.md,.sql';
  i.onchange=()=>{let f=i.files[0];if(f){let r=new FileReader();r.onload=()=>cb(r.result);r.readAsText(f)}};
  i.click()
}
function enableDrop(el,cb){
  if(!el)return;
  ['dragover','dragenter'].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();el.classList.add('drag')}));
  ['dragleave','dragend','drop'].forEach(ev=>el.addEventListener(ev,()=>el.classList.remove('drag')));
  el.addEventListener('drop',e=>{
    e.preventDefault();
    let f=e.dataTransfer.files&&e.dataTransfer.files[0];
    if(!f)return;
    let r=new FileReader();r.onload=()=>cb(r.result);r.readAsText(f);
  });
}

// ---- CSV ----
function csvRows(s){
  let rows=[],row=[],cell='',q=false;
  for(let i=0;i<s.length;i++){
    let c=s[i];
    if(c==='"'){if(q&&s[i+1]==='"'){cell+='"';i++}else q=!q}
    else if(c===','&&!q){row.push(cell);cell=''}
    else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&s[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}
    else cell+=c
  }
  if(cell||row.length){row.push(cell);rows.push(row)}
  return rows.filter(r=>r.some(x=>x!==''))
}
function csvEsc(v){v=v==null?'':String(v);return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}

// ---- Base64 (URL-safe aware) ----
function b64(s){
  s=s.replace(/-/g,'+').replace(/_/g,'/');
  s+='='.repeat((4-s.length%4)%4);
  let bin=atob(s),a=Uint8Array.from(bin,c=>c.charCodeAt(0));
  return new TextDecoder().decode(a)
}

// ---- Misc ----
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function debounce(fn,ms=250){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

// ---- Theme ----
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  try{localStorage.setItem('dtb-theme',t)}catch(e){}
  let b=$('#themeToggle');if(b)b.textContent=t==='dark'?'☀':'◐';
}
function initTheme(){
  let t=document.documentElement.getAttribute('data-theme')||'light';
  applyTheme(t);
  let b=$('#themeToggle');
  if(b)b.onclick=()=>applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
}

// ---- Mobile nav ----
function initNav(){
  let t=$('#navtoggle'),n=$('#navlinks');
  if(t&&n)t.onclick=()=>n.classList.toggle('open');
}

// ---- Ctrl/Cmd+Enter runs the primary action on any tool page ----
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){
    let btn=$('#run');
    if(btn&&!btn.disabled){e.preventDefault();btn.click()}
  }
});

document.addEventListener('DOMContentLoaded',()=>{initTheme();initNav()});
