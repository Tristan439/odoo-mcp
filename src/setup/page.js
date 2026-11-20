// The setup page (single self-contained HTML file, no external resources).

export function renderPage(token) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Odoo MCP</title>
<style>
:root{--bg:#f6f5f2;--card:#fff;--ink:#1d1d1f;--muted:#6b6b70;--line:#e3e1dc;--accent:#714b67;--accent-ink:#fff;--ok:#1f7a4d;--okbg:#e7f4ec;--err:#a1262b;--errbg:#fbeaea;--warn:#8a5a00;--warnbg:#fdf3dc}
@media (prefers-color-scheme:dark){:root{--bg:#141416;--card:#1e1e21;--ink:#ececf0;--muted:#a0a0a8;--line:#333338;--accent:#c79bbd;--accent-ink:#1a1a1a;--ok:#6fd39c;--okbg:#17301f;--err:#ff8a8f;--errbg:#3a1a1c;--warn:#f2c46b;--warnbg:#352a12}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px 80px}
header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
h1{font-size:24px;margin:0}
.lang button{background:none;border:1px solid var(--line);color:var(--muted);padding:4px 10px;border-radius:6px;cursor:pointer}
.lang button.on{color:var(--ink);border-color:var(--ink)}
.intro{color:var(--muted);margin:0 0 24px}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;margin-bottom:16px}
section.locked{opacity:.5;pointer-events:none}
h2{font-size:18px;margin:0 0 4px;display:flex;gap:10px;align-items:center}
.num{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--accent);color:var(--accent-ink);font-size:14px}
.sub{color:var(--muted);margin:0 0 16px;font-size:14px}
label{display:block;font-weight:600;font-size:14px;margin:12px 0 4px}
input[type=text],input[type=email],input[type=password],input[type=url]{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);font-size:16px}
.hint{font-size:13px;color:var(--muted);margin-top:4px}
details{margin:12px 0;font-size:14px}
summary{cursor:pointer;color:var(--accent);font-weight:600}
ol{padding-left:20px}
.btn{display:inline-block;background:var(--accent);color:var(--accent-ink);border:0;border-radius:8px;padding:10px 18px;font-size:15px;font-weight:600;cursor:pointer;margin-top:16px}
.btn.secondary{background:none;color:var(--accent);border:1px solid var(--accent)}
.btn:disabled{opacity:.5;cursor:wait}
.msg{margin-top:12px;padding:10px 12px;border-radius:8px;font-size:14px;display:none;white-space:pre-line}
.msg.ok{display:block;background:var(--okbg);color:var(--ok)}
.msg.err{display:block;background:var(--errbg);color:var(--err)}
.presets{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.presets button{background:var(--bg);border:1px solid var(--line);color:var(--ink);border-radius:999px;padding:6px 12px;font-size:14px;cursor:pointer}
.app{display:grid;grid-template-columns:1fr auto;gap:8px 12px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}
.app .t{font-weight:600}
.app .d{font-size:13px;color:var(--muted)}
.badge{font-size:11px;font-weight:700;background:var(--warnbg);color:var(--warn);padding:2px 6px;border-radius:4px;margin-left:6px;vertical-align:middle}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.seg button{background:none;border:0;padding:6px 10px;font-size:13px;color:var(--muted);cursor:pointer;border-right:1px solid var(--line)}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--accent);color:var(--accent-ink)}
.seg button[disabled]{cursor:not-allowed;opacity:.45}
.hidden-apps{font-size:13px;color:var(--muted);margin-top:8px}
code,pre{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px}
pre{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px;white-space:pre-wrap;word-break:break-all;margin:8px 0}
.client{border-top:1px solid var(--line);padding:14px 0}
.client h3{margin:0 0 4px;font-size:16px}
@media (max-width:560px){.app{grid-template-columns:1fr}.seg button{padding:6px 8px}}
</style>
</head>
<body>
<main>
<header><h1>🔌 Odoo MCP</h1><div class="lang"><button data-lang="fr">FR</button> <button data-lang="en">EN</button></div></header>
<p class="intro" data-t="intro"></p>

<section id="s1">
  <h2><span class="num">1</span><span data-t="s1"></span></h2>
  <p class="sub" data-t="s1sub"></p>
  <label for="url" data-t="url"></label>
  <input id="url" type="url" placeholder="https://monentreprise.odoo.com" autocomplete="url">
  <div class="hint" data-t="urlHint"></div>
  <label for="login" data-t="login"></label>
  <input id="login" type="email" autocomplete="username">
  <label for="key" data-t="key"></label>
  <input id="key" type="password" autocomplete="off">
  <div class="hint" id="keyHint"></div>
  <details><summary data-t="howKey"></summary><ol id="keySteps"></ol></details>
  <details><summary data-t="advanced"></summary>
    <label for="db" data-t="db"></label>
    <input id="db" type="text" autocomplete="off">
    <div class="hint" data-t="dbHint"></div>
  </details>
  <button class="btn" id="test" data-t="test"></button>
  <div class="msg" id="testMsg"></div>
</section>

<section id="s2" class="locked">
  <h2><span class="num">2</span><span data-t="s2"></span></h2>
  <p class="sub" data-t="s2sub"></p>
  <div class="presets" id="presets"></div>
  <div id="apps"></div>
  <div class="hidden-apps" id="hiddenApps"></div>
  <button class="btn" id="save" data-t="save"></button>
  <div class="msg" id="saveMsg"></div>
</section>

<section id="s3" class="locked">
  <h2><span class="num">3</span><span data-t="s3"></span></h2>
  <p class="sub" data-t="s3sub"></p>
  <div class="client"><h3>Claude Desktop</h3><div class="hint" data-t="cdHint"></div>
    <button class="btn" id="cd" data-t="cdBtn"></button><div class="msg" id="cdMsg"></div></div>
  <div class="client"><h3>Claude Code</h3><div class="hint" data-t="ccHint"></div><pre id="ccCmd"></pre>
    <button class="btn secondary" id="ccCopy" data-t="copy"></button></div>
  <div class="client"><h3>ChatGPT · claude.ai (web)</h3><div class="hint" data-t="webHint"></div></div>
  <button class="btn" id="quit" data-t="quit"></button>
  <div class="msg" id="quitMsg"></div>
</section>
</main>
<script>
const TOKEN = ${JSON.stringify(token)};
const T = {
fr:{intro:"Connecte ton Odoo à ton IA (Claude, ChatGPT…) et choisis exactement ce qu'elle peut voir. Tout reste sur ton ordinateur.",
s1:"Connexion à Odoo",s1sub:"Trois informations, c'est tout.",url:"Adresse de ton Odoo",urlHint:"Copie-la depuis ton navigateur quand tu es connecté à Odoo.",
login:"Ton courriel Odoo",key:"Clé API Odoo",keyKept:"Une clé est déjà enregistrée. Laisse vide pour la garder.",
howKey:"Comment créer ma clé API ? (1 minute)",steps:["Dans Odoo, clique sur ton avatar en haut à droite → <b>Mon profil</b> (ou Préférences).","Onglet <b>Sécurité du compte</b> → bouton <b>Nouvelle clé API</b>.","Confirme ton mot de passe, donne un nom (ex. « IA ») et choisis une durée.","Copie la clé et colle-la ici. Odoo ne la montre qu'une seule fois."],
advanced:"Options avancées",db:"Base de données (facultatif)",dbHint:"Laisse vide : elle est détectée automatiquement. À remplir seulement si on te le demande.",
test:"Tester la connexion",testing:"Test en cours…",connected:"✓ Connecté à Odoo {v} — base « {db} » — utilisateur {u}",
s2:"Ce que ton IA peut voir",s2sub:"Seules les apps installées dans ton Odoo sont affichées. Tu peux changer ça plus tard en relançant cette page.",
none:"Aucun",read:"Lire",write:"Modifier",full:"Tout",soon:"Bientôt disponible",sensitive:"SENSIBLE",
notInstalled:"Apps non installées (masquées) : ",save:"Enregistrer mes choix",saved:"✓ Enregistré dans {f}",
s3:"Connecter ton IA",s3sub:"Choisis l'app que tu utilises. Ensuite, redémarre-la et demande-lui : « Qu'est-ce que tu peux voir dans mon Odoo ? »",
cdHint:"Ajoute automatiquement Odoo dans Claude Desktop. Quitte complètement Claude Desktop et rouvre-le ensuite.",cdBtn:"Configurer Claude Desktop",cdDone:"✓ Ajouté. Quitte Claude Desktop complètement (pas seulement la fenêtre) et rouvre-le.",
ccHint:"Colle cette commande dans un terminal :",copy:"Copier la commande",copied:"Copié ✓",
webHint:"La connexion web (ChatGPT, claude.ai) arrive dans une prochaine version : elle demande un petit serveur en ligne.",
quit:"Terminer",bye:"C'est fait ! Tu peux fermer cet onglet."},
en:{intro:"Connect your Odoo to your AI (Claude, ChatGPT…) and choose exactly what it can see. Everything stays on your computer.",
s1:"Connect to Odoo",s1sub:"Three things, that's all.",url:"Your Odoo address",urlHint:"Copy it from your browser while logged in to Odoo.",
login:"Your Odoo email",key:"Odoo API key",keyKept:"A key is already saved. Leave empty to keep it.",
howKey:"How do I create my API key? (1 minute)",steps:["In Odoo, click your avatar (top right) → <b>My Profile</b> (or Preferences).","<b>Account Security</b> tab → <b>New API Key</b> button.","Confirm your password, give it a name (e.g. “AI”) and pick a duration.","Copy the key and paste it here. Odoo shows it only once."],
advanced:"Advanced options",db:"Database (optional)",dbHint:"Leave empty: it is detected automatically. Only fill it in if asked.",
test:"Test the connection",testing:"Testing…",connected:"✓ Connected to Odoo {v} — database “{db}” — user {u}",
s2:"What your AI can see",s2sub:"Only apps installed in your Odoo are shown. You can change this later by opening this page again.",
none:"None",read:"Read",write:"Edit",full:"Full",soon:"Coming soon",sensitive:"SENSITIVE",
notInstalled:"Apps not installed (hidden): ",save:"Save my choices",saved:"✓ Saved to {f}",
s3:"Connect your AI",s3sub:"Pick the app you use. Then restart it and ask: “What can you see in my Odoo?”",
cdHint:"Adds Odoo to Claude Desktop automatically. Fully quit Claude Desktop and open it again afterwards.",cdBtn:"Set up Claude Desktop",cdDone:"✓ Added. Fully quit Claude Desktop (not just the window) and open it again.",
ccHint:"Paste this command in a terminal:",copy:"Copy the command",copied:"Copied ✓",
webHint:"Web connection (ChatGPT, claude.ai) comes in a next version: it needs a small online server.",
quit:"Finish",bye:"All done! You can close this tab."}
};
let lang='fr', state=null, levels={}, installed={};
const $=(id)=>document.getElementById(id);
const tr=(k,v={})=>String(T[lang][k]??k).replace(/\\{(\\w+)\\}/g,(_,x)=>v[x]??'');
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path,body){const r=await fetch(path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Setup-Token':TOKEN},body:body?JSON.stringify(body):undefined});return r.json();}
function msg(id,ok,text){const el=$(id);el.className='msg '+(ok?'ok':'err');el.textContent=text;}
function applyLang(){document.documentElement.lang=lang;document.querySelectorAll('[data-t]').forEach(el=>el.textContent=tr(el.dataset.t));
document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
$('keySteps').innerHTML=T[lang].steps.map(s=>'<li>'+s+'</li>').join('');
$('keyHint').textContent=state?.connection.hasKey?tr('keyKept'):'';renderApps();renderPresets();}
function renderPresets(){if(!state)return;$('presets').innerHTML=Object.entries(state.presets).map(([k,p])=>'<button data-p="'+k+'">'+esc(p.label[lang])+'</button>').join('');
$('presets').querySelectorAll('button').forEach(b=>b.onclick=()=>{levels={...state.presets[b.dataset.p].levels};renderApps();});}
function renderApps(){if(!state)return;const shown=state.apps.filter(a=>installed[a.key]!==false);const hidden=state.apps.filter(a=>installed[a.key]===false);
$('apps').innerHTML=shown.map(a=>'<div class="app"><div><div class="t">'+a.icon+' '+esc(a.name[lang])+(a.sensitive?'<span class="badge">'+tr('sensitive')+'</span>':'')+'</div><div class="d">'+esc(a.desc[lang])+'</div></div><div class="seg" data-app="'+a.key+'">'+
['none','read','write','full'].map(l=>'<button data-l="'+l+'"'+(l==='write'||l==='full'?' disabled title="'+tr('soon')+'"':'')+' class="'+((levels[a.key]||'none')===l?'on':'')+'">'+tr(l)+'</button>').join('')+'</div></div>').join('');
$('hiddenApps').textContent=hidden.length?tr('notInstalled')+hidden.map(a=>a.name[lang]).join(', '):'';
$('apps').querySelectorAll('.seg button:not([disabled])').forEach(b=>b.onclick=()=>{levels[b.parentElement.dataset.app]=b.dataset.l;renderApps();});}
document.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;applyLang();});
$('test').onclick=async()=>{const b=$('test');b.disabled=true;b.textContent=tr('testing');
try{const r=await api('/api/test',{lang,url:$('url').value,login:$('login').value,apiKey:$('key').value,db:$('db').value});
if(r.ok){installed=r.installed||{};if(r.info.db&&!$('db').value)$('db').value=r.info.db;msg('testMsg',true,tr('connected',{v:r.info.version,db:r.info.db||'—',u:r.info.user}));$('s2').classList.remove('locked');renderApps();}
else{msg('testMsg',false,r.message);}}catch(e){msg('testMsg',false,String(e));}
b.disabled=false;b.textContent=tr('test');};
$('save').onclick=async()=>{const r=await api('/api/save',{lang,connection:{url:$('url').value,login:$('login').value,apiKey:$('key').value,db:$('db').value},access:{apps:levels}});
if(r.ok){msg('saveMsg',true,tr('saved',{f:r.file}));$('s3').classList.remove('locked');}else msg('saveMsg',false,r.error||r.message);};
$('cd').onclick=async()=>{const r=await api('/api/claude-desktop',{});r.ok?msg('cdMsg',true,tr('cdDone')):msg('cdMsg',false,r.message);};
$('ccCopy').onclick=async()=>{try{await navigator.clipboard.writeText(state.claudeCodeCommand);$('ccCopy').textContent=tr('copied');}catch{}};
$('quit').onclick=async()=>{await api('/api/quit',{});msg('quitMsg',true,tr('bye'));};
(async()=>{state=await api('/api/state');lang=state.lang||((navigator.language||'').startsWith('fr')?'fr':'en');levels={...state.access.apps};
$('url').value=state.connection.url;$('login').value=state.connection.login;$('db').value=state.connection.db;$('ccCmd').textContent=state.claudeCodeCommand;applyLang();})();
</script>
</body>
</html>`;
}
