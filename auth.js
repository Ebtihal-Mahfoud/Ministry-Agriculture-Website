/* مصادقة تجريبية على جهة المتصفح فقط — لا تصلح للإنتاج. استبدلها بواجهة خلفية حقيقية. */
(function(){
var CONTENT=['news','announcements','decisions','circulars','pages','services','requests','projects','depts','affil','messages'],SYS=['users','roles'],ALL=CONTENT.concat(SYS);
var FULL=['view','add','edit','del'];
function defaults(){var a={},e={},v={};
 ALL.forEach(function(k){a[k]=FULL.slice()});
 CONTENT.forEach(function(k){e[k]=['view','add','edit'];v[k]=['view']});
 e.messages=['view','edit'];e.requests=['view','edit'];
 return{admin:{name:'مدير النظام',locked:true,perms:a},editor:{name:'محرر محتوى',perms:e},viewer:{name:'مشاهد',perms:v}}}
var J=function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
var S=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
async function hash(p){try{var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('malgmi|'+p));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')}catch(e){return 'p:'+btoa(unescape(encodeURIComponent(p)))}}
var A={ALL:ALL,CONTENT:CONTENT,SYS:SYS,FULL:FULL,hash:hash,
 roles:function(){var r=J('adm_roles',null);if(!r){r=defaults();S('adm_roles',r)}r.admin.perms=defaults().admin.perms;return r},
 saveRoles:function(r){S('adm_roles',r)},
 users:async function(){var u=J('adm_users',null);if(!u){u=[
  {name:'مدير النظام',username:'admin',email:'admin@malgmi.ly',role:'admin',status:'نشط',hash:await hash('admin123')},
  {name:'محرر المحتوى',username:'editor',email:'editor@malgmi.ly',role:'editor',status:'نشط',hash:await hash('editor123')},
  {name:'مشاهد',username:'viewer',email:'viewer@malgmi.ly',role:'viewer',status:'نشط',hash:await hash('viewer123')}];S('adm_users',u)}return u},
 saveUsers:function(u){S('adm_users',u)},
 user:function(){try{return JSON.parse(sessionStorage.getItem('adm_session'))}catch(e){return null}},
 login:async function(name,pass){
  var lk=J('adm_lock',{n:0,t:0});if(lk.t>Date.now())return{err:'محاولات كثيرة. حاول بعد '+Math.ceil((lk.t-Date.now())/1000)+' ثانية.'};
  var us=await A.users(),h=await hash(pass),u=us.find(function(x){return x.username===name.trim()&&x.hash===h});
  if(!u){lk.n++;if(lk.n>=5){lk={n:0,t:Date.now()+30000}}S('adm_lock',lk);return{err:'اسم المستخدم أو كلمة المرور غير صحيحة.'}}
  if(u.status!=='نشط')return{err:'هذا الحساب موقوف. راجع مدير النظام.'};
  S('adm_lock',{n:0,t:0});sessionStorage.setItem('adm_session',JSON.stringify({username:u.username,name:u.name,role:u.role}));return{ok:1}},
 logout:function(){sessionStorage.removeItem('adm_session')},
 can:function(k,a){var u=A.user();if(!u)return false;var r=A.roles()[u.role];return !!(r&&r.perms[k]&&r.perms[k].indexOf(a||'view')>-1)},
 roleName:function(id){var r=A.roles()[id];return r?r.name:id},
 base:function(){return location.pathname.indexOf('/admin/')>-1?'../':''},
 require:function(k){if(!A.user()||(k&&!A.can(k))){var n=location.pathname.split('/').pop()+location.search;location.replace(A.base()+'login.html'+(A.user()?'?denied=1':'?next='+encodeURIComponent(n)));return false}return true}};
window.Auth=A})();
