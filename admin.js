const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS='بيانات صحفية,فعاليات وأنشطة,أخبار الوزارة,مشاريع جديدة',ST='جديد,قيد المعالجة,مكتمل,مرفوض',PS='منشورة,مسودة';
const MODS={
news:{t:'الأخبار',i:'📰',g:'المحتوى',f:[['title','العنوان'],['date','التاريخ','date'],['cat','التصنيف','sel',CATS],['text','النص','area']],seed:()=>NEWS.map(n=>({title:n[0],date:n[1],cat:n[2],text:n[3]}))},
announcements:{t:'الإعلانات والمناقصات',i:'🔔',g:'المحتوى',f:[['title','العنوان'],['date','التاريخ','date'],['status','الحالة','sel','عاجل,ساري,منتهي'],['text','التفاصيل','area']],seed:()=>ANNOUNCE.map(a=>({title:a[0],date:a[1],status:a[2],text:a[3]}))},
decisions:{t:'القرارات والتشريعات',i:'📜',g:'المحتوى',f:[['no','الرقم'],['title','العنوان'],['date','التاريخ','date'],['kind','النوع','sel','قرار,تشريع,لائحة']],seed:()=>DECISIONS.map(d=>({no:d[0],title:d[1],date:d[2],kind:'قرار'}))},
circulars:{t:'التعاميم',i:'🗂',g:'المحتوى',f:[['no','الرقم'],['title','الموضوع'],['date','التاريخ','date'],['to','الجهة الموجّه إليها']],seed:()=>CIRCULARS.map(d=>({no:d[0],title:d[1],date:d[2],to:'جميع الإدارات'}))},
pages:{t:'الصفحات الثابتة',i:'📄',g:'المحتوى',f:[['title','العنوان'],['slug','الرابط'],['status','الحالة','sel',PS],['text','المحتوى','area']],seed:()=>[{title:'رؤيتنا ورسالتنا',slug:'about.html',status:'منشورة',text:''},{title:'الأسئلة الشائعة',slug:'faq.html',status:'منشورة',text:''},{title:'السياسات والخصوصية',slug:'privacy.html',status:'منشورة',text:''}]},
services:{t:'الخدمات الإلكترونية',i:'✨',g:'الخدمات والمشاريع',f:[['title','اسم الخدمة'],['icon','الأيقونة'],['text','الوصف','area']],seed:()=>SERVICES.map(s=>({title:s[1],icon:s[0],text:s[2]}))},
requests:{t:'طلبات الخدمات',i:'📂',g:'الخدمات والمشاريع',f:[['no','رقم الطلب'],['name','مقدّم الطلب'],['service','الخدمة'],['status','الحالة','sel',ST],['date','التاريخ','date'],['nid','الرقم الوطني'],['phone','الهاتف'],['email','البريد الإلكتروني'],['dept','الإدارة المعنية'],['reply','نص الرد','area']],seed:()=>REQUESTS.map(r=>({...r})),reply:1},
projects:{t:'المشاريع والمبادرات',i:'💼',g:'الخدمات والمشاريع',f:[['title','اسم المشروع'],['loc','الموقع'],['cat','التصنيف','sel','الزراعية,الحيوانية,البنية التحتية'],['year','السنة'],['pct','نسبة الإنجاز %','number']],seed:()=>PROJECTS.map(p=>({title:p[0],loc:p[1],cat:p[2],year:p[3],pct:p[4]}))},
depts:{t:'الإدارات والمكاتب',i:'🏢',g:'الهيكل التنظيمي',f:[['title','الاسم'],['kind','النوع','sel','إدارة,مكتب'],['mail','البريد'],['text','نبذة','area']],seed:()=>[...DEPTS.map(d=>({title:d[1],kind:'إدارة',mail:d[2],text:d[3]})),...OFFICES.map(d=>({title:d[1],kind:'مكتب',mail:d[2],text:d[3]}))]},
affil:{t:'الجهات التابعة',i:'🏛',g:'الهيكل التنظيمي',f:[['title','اسم الجهة'],['icon','الأيقونة']],seed:()=>AFFIL.map(a=>({title:a[1],icon:a[0]||'🏢'}))},
users:{t:'المستخدمون',i:'👥',g:'المستخدمون والصلاحيات',key:'adm_users',f:[['name','الاسم الكامل'],['username','اسم المستخدم'],['role','الدور','sel',()=>Object.entries(Auth.roles()).map(([k,r])=>k+'|'+r.name).join(',')],['status','الحالة','sel','نشط,موقوف'],['email','البريد الإلكتروني','email'],['pass','كلمة المرور (اتركها فارغة للإبقاء على الحالية)','password']],seed:()=>[],disp:{role:v=>Auth.roleName(v)}},
roles:{t:'الأدوار والصلاحيات',i:'🛡',g:'المستخدمون والصلاحيات',f:[],seed:()=>[],custom:1},
messages:{t:'رسائل المواطنين',i:'✉️',g:'التواصل',key:'contact_messages',f:[['name','الاسم'],['email','البريد'],['subject','الموضوع'],['msg','الرسالة','area']],seed:()=>[{name:'خالد أحمد',email:'khaled@example.ly',subject:'استفسار عن ترخيص',msg:'أرغب بمعرفة متطلبات ترخيص مشروع زراعي.'},{name:'سالم المصري',email:'salem@example.ly',subject:'اقتراح',msg:'اقتراح بتوسيع الخدمة البيطرية المتنقلة.'}]}};
const store=k=>MODS[k].key||'adm_'+k;
const load=k=>{try{const v=localStorage.getItem(store(k));if(v)return JSON.parse(v)}catch(_){}const s=MODS[k].seed();save(k,s);return s};
const save=(k,a)=>{try{localStorage.setItem(store(k),JSON.stringify(a))}catch(_){}};
let CUR='';const can=(a,k)=>Auth.can(k||CUR,a);
const ACT={view:'عرض',add:'إضافة',edit:'تعديل',del:'حذف'};
function shell(active,crumb){
 const groups=[...new Set(Object.values(MODS).map(m=>m.g))],U=Auth.user();
 $('aside').innerHTML=`<div class="lg"><img src="ministry-seal-light.png" alt="شعار الوزارة" width="42" height="42"><div>وزارة الزراعة<br><small>والثروة الحيوانية - ليبيا</small></div></div><a href="index.html" class="${active==='home'?'on':''}">▦ الرئيسية</a>`+groups.map(g=>[g,Object.entries(MODS).filter(([kk,m])=>m.g===g&&Auth.can(kk,'view'))]).filter(([,l])=>l.length).map(([g,l])=>`<h5>${g}</h5>`+l.map(([k,m])=>`<a href="module.html?m=${k}" class="${active===k?'on':''}">${m.i} ${m.t}</a>`).join('')).join('')+`<a href="index.html">↗ العودة للموقع</a><div class="help">❓ تحتاج إلى مساعدة؟<br><small>دليل استخدام لوحة الإدارة</small></div><div class="usr"><i>${esc(U.name[0])}</i><div>${esc(U.name)}<br><small>${esc(Auth.roleName(U.role))}</small></div></div><a href="#" id="lo">⎋ تسجيل الخروج</a>`;
 const nm=load('messages').length;
 $('#top').innerHTML=`<div>الإدارة › <b>${crumb}</b></div><div style="display:flex;gap:10px;align-items:center"><button class="thm" id="thm" aria-label="تبديل المظهر"></button><a href="module.html?m=messages" title="الرسائل">🔔 <span class="chip">${nm}</span></a></div>`;
 themeBtn();$('#lo').onclick=e=>{e.preventDefault();Auth.logout();location.href='login.html'};
}
function dash(){
 const n=load('news').length,p=load('projects'),m=load('messages').length,rq=load('requests').length;
 const wk=[['السبت',40,60],['الجمعة',55,80],['الخميس',38,58],['الأربعاء',48,70],['الثلاثاء',30,42],['الاثنين',42,62],['الأحد',28,40]];
 const top=[...p].sort((a,b)=>b.pct-a.pct).slice(0,3);
 const d=new Date().toLocaleDateString('ar-LY',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 $('#app').innerHTML=`<div class="prev">🛡 <b>وضع المعاينة</b> — بيانات تجريبية فقط. لا يوجد اتصال فعلي بقاعدة البيانات.</div><small>${d}</small><h1 style="color:var(--title)">مرحباً بك، ${esc(Auth.user().name)}</h1><p>إليك نظرة عامة على محتوى البوابة وأحدث ما يجري اليوم.</p>
 <div class="kpis"><div class="card kpi"><span>إجمالي الأخبار</span><b>${n}</b><span class="up">↗ 12.4%+ مقارنة بالشهر الماضي</span></div><div class="card kpi"><span>المشاريع والمبادرات</span><b>${p.length}</b><span class="up">+2 جديد</span></div><div class="card kpi"><span>رسائل جديدة</span><b>${String(m).padStart(2,'0')}</b><span>تحتاج إلى مراجعة · ${rq} طلبات خدمة</span></div><div class="card kpi"><span>عمليات البحث</span><b>2,846</b><span class="up">↗ 8.2%+</span></div></div>
 <div class="two"><div class="card"><small>ابدأ بسرعة</small><h3>إجراءات سريعة</h3><button class="qa" onclick="location='module.html?m=news&new=1'">➕ <span>إضافة خبر جديد</span></button><button class="qa" onclick="location='module.html?m=projects'">💼 <span>تحديث مشروع</span></button><button class="qa" onclick="location='module.html?m=messages'">✉️ <span>مراجعة الرسائل</span></button></div>
 <div class="card"><small>ملخص النشاط</small><h3>نظرة عامة على البوابة</h3><div class="chart">${wk.map(w=>`<div><i style="height:${w[1]}%"></i><i style="height:${w[2]}%"></i></div>`).join('')}</div><div class="lab">${wk.map(w=>`<span>${w[0]}</span>`).join('')}</div></div></div>
 <div class="two2"><div class="card"><small>المتابعة</small><h3>أبرز المشاريع</h3>${top.map(x=>`<p style="margin:12px 0 2px"><b>${esc(x.title)}</b> <small>${esc(x.loc)}</small></p><div class="bar-p"><i style="width:${x.pct}%"></i></div><small>${x.pct}%</small>`).join('')}</div>
 <div class="card"><small>سجل التغييرات</small><h3>آخر النشاطات</h3><p>📰 تم تحديث خبر «${esc(load('news')[0]?.title)}»<br><small>قبل 14 دقيقة</small></p><p>✉️ وصلت رسالة جديدة من أحمد سالم<br><small>قبل 42 دقيقة</small></p><p>💼 تم إنجاز مشروع «${esc(top[0]?.title)}»<br><small>قبل ساعتين</small></p><p>📄 تم نشر صفحة «الرؤية والرسالة»<br><small>أمس</small></p></div></div>
 <div class="card"><small>اهتمامات الزوار</small><h3>أكثر كلمات البحث استخداماً</h3>${[['دعم المزارعين',482],['الخدمات البيطرية',316],['تسجيل مزرعة',274],['الأسمدة الزراعية',193]].map(k=>`<span class="chip">${k[0]} · ${k[1]}</span>`).join('')}</div>`;
}
function rolesPage(M){
 let R=Auth.roles(),sel=new URLSearchParams(location.search).get('r')||'admin';if(!R[sel])sel='admin';const mayEdit=can('edit','roles');
 const names=Object.fromEntries(Object.entries(MODS).map(([k,m])=>[k,m.t]));
 const draw=()=>{R=Auth.roles();const r=R[sel],lock=r.locked||!mayEdit;
  $('#app').innerHTML=`<h1 style="color:var(--title)">${M.i} ${M.t}</h1><div class="tb">${Object.entries(R).map(([k,x])=>`<button class="btn ${k===sel?'':'alt'}" data-r="${k}">${esc(x.name)}</button>`).join('')}${can('add','roles')?'<button class="btn sm" id="nr">➕ دور جديد</button>':''}</div>
  <p class="sub">${r.locked?'🔒 دور مدير النظام يملك كل الصلاحيات ولا يمكن تعديله (لتفادي فقدان الوصول).':'حدّد ما يستطيع هذا الدور فعله في كل قسم.'}</p>
  <div class="tw"><table><thead><tr><th>القسم</th>${Auth.FULL.map(a=>`<th>${ACT[a]}</th>`).join('')}</tr></thead><tbody>${Auth.ALL.map(k=>`<tr><td>${MODS[k]?.i||''} ${esc(names[k]||k)}</td>${Auth.FULL.map(a=>`<td><input type="checkbox" class="cb" data-k="${k}" data-a="${a}" aria-label="${ACT[a]} ${esc(names[k]||k)}" ${(r.perms[k]||[]).includes(a)?'checked':''} ${lock?'disabled':''}></td>`).join('')}</tr>`).join('')}</tbody></table></div>
  ${!r.locked&&can('del','roles')?'<p><button class="btn del" id="dr">حذف هذا الدور</button></p>':''}`;
  document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{sel=b.dataset.r;draw()});
  document.querySelectorAll('.cb').forEach(c=>c.onchange=()=>{const R2=Auth.roles(),pm=R2[sel].perms,k=c.dataset.k,a=c.dataset.a;let s=new Set(pm[k]||[]);c.checked?s.add(a):s.delete(a);if(a!=='view'&&c.checked)s.add('view');if(a==='view'&&!c.checked)s=new Set();pm[k]=Auth.FULL.filter(x=>s.has(x));Auth.saveRoles(R2);draw()});
  const nr=$('#nr');if(nr)nr.onclick=()=>{const n=prompt('اسم الدور الجديد:');if(!n||!n.trim())return;const R2=Auth.roles(),id='r'+Date.now().toString(36);R2[id]={name:n.trim(),perms:Object.fromEntries(Auth.ALL.map(k=>[k,k==='users'||k==='roles'?[]:['view']]))};Auth.saveRoles(R2);sel=id;draw()};
  const dr=$('#dr');if(dr)dr.onclick=async()=>{const us=await Auth.users();if(us.some(u=>u.role===sel)){alert('لا يمكن حذف دور مرتبط بمستخدمين. غيّر أدوارهم أولاً.');return}if(!confirm('تأكيد حذف الدور؟'))return;const R2=Auth.roles();delete R2[sel];Auth.saveRoles(R2);sel='admin';draw()}};
 draw()}
function modulePage(){
 const k=new URLSearchParams(location.search).get('m'),M=MODS[k];if(!M){shell('', 'غير موجود');$('#app').innerHTML='<p>القسم غير موجود.</p>';return}
 if(!Auth.can(k,'view')){location.replace('login.html?denied=1');return}
 CUR=k;shell(k,M.t);document.title=M.t;let q='',edit=-1;if(M.custom)return rolesPage(M);
 const cols=M.f.filter(x=>x[2]!=='password').slice(0,4),opts=o=>(typeof o==='function'?o():o).split(',').map(x=>x.split('|')),disp=(c,v)=>M.disp&&M.disp[c]?M.disp[c](v):v;
 $('#app').innerHTML=`<h1 style="color:var(--title)">${M.i} ${M.t}</h1><div class="tb"><input id="s" placeholder="🔍 بحث..." aria-label="بحث"><button class="btn" id="add">➕ إضافة</button><small id="cnt"></small></div><div class="tw"><table><thead></thead><tbody></tbody></table></div><dialog id="dlg"><form method="dialog" id="fm"><h3 id="dt"></h3><div id="fl"></div><div class="err" id="fe" role="alert"></div><p style="margin-top:14px"><button class="btn" value="ok">حفظ</button> <button class="btn alt" value="x" formnovalidate>إلغاء</button></p></form></dialog>`;
 const draw=()=>{const a=load(k);const rows=a.map((r,i)=>[r,i]).filter(([r])=>!q||JSON.stringify({...r,hash:0}).includes(q));
  $('thead').innerHTML=`<tr><th>#</th>${cols.map(c=>`<th>${c[1]}</th>`).join('')}<th></th></tr>`;
  $('tbody').innerHTML=rows.map(([r,i],n)=>`<tr><td>${n+1}</td>${cols.map(c=>`<td>${['status','kind','cat','role'].includes(c[0])?`<span class="chip">${esc(disp(c[0],r[c[0]]))}</span>`:esc(String(r[c[0]]??'').slice(0,70))}</td>`).join('')}<td>${M.reply&&can('edit')?`<a class="btn sm" href="service-request.html?id=${encodeURIComponent(r.no)}">رد</a>`:''}${can('edit')?`<button class="btn sm" data-e="${i}">تعديل</button>`:''}${can('del')?`<button class="btn sm del" data-d="${i}">حذف</button>`:''}</td></tr>`).join('')||`<tr><td colspan="9">لا توجد سجلات.</td></tr>`;
  $('#cnt').textContent=rows.length+' سجل';$('#add').style.display=can('add')?'':'none'};
 const open=i=>{edit=i;const r=i>=0?load(k)[i]:{};$('#dt').textContent=(i>=0?'تعديل: ':'إضافة: ')+M.t;$('#fe').textContent='';
  $('#fl').innerHTML=M.f.map(([n,l,t,o])=>`<label for="f_${n}">${l}</label>`+(t==='area'?`<textarea id="f_${n}" name="${n}" rows="3">${esc(r[n])}</textarea>`:t==='sel'?`<select id="f_${n}" name="${n}">${opts(o).map(([v,t2])=>`<option value="${esc(v)}" ${r[n]===v?'selected':''}>${esc(t2||v)}</option>`).join('')}</select>`:t==='password'?`<input id="f_${n}" name="${n}" type="password" autocomplete="new-password" dir="ltr">`:`<input id="f_${n}" name="${n}" type="${t||'text'}" value="${esc(r[n])}">`)).join('');$('#dlg').showModal()};
 $('#fm').onsubmit=async e=>{if(e.submitter?.value!=='ok')return;e.preventDefault();const o=Object.fromEntries(new FormData($('#fm'))),a=load(k),fe=$('#fe'),f0=M.f[0][0];
  if(!String(o[f0]||'').trim()){fe.textContent='الحقل الأول مطلوب.';return}
  if(k==='users'){const me=Auth.user();o.username=o.username.trim();
   if(!/^[A-Za-z0-9_.-]{3,30}$/.test(o.username)){fe.textContent='اسم المستخدم: 3–30 حرفاً إنجليزياً أو أرقاماً.';return}
   if(a.some((u,i)=>u.username===o.username&&i!==edit)){fe.textContent='اسم المستخدم مستخدم مسبقاً.';return}
   if(edit<0&&String(o.pass||'').length<8){fe.textContent='كلمة المرور 8 أحرف على الأقل.';return}
   if(o.pass&&o.pass.length<8){fe.textContent='كلمة المرور 8 أحرف على الأقل.';return}
   const was=edit>=0?a[edit]:null;
   if(was&&was.username===me.username&&(o.status!=='نشط'||o.role!==was.role)){fe.textContent='لا يمكنك إيقاف حسابك أو تغيير دورك.';return}
   if(was&&was.role==='admin'&&(o.role!=='admin'||o.status!=='نشط')&&a.filter(u=>u.role==='admin'&&u.status==='نشط').length<2){fe.textContent='يجب أن يبقى مدير نظام نشط واحد على الأقل.';return}
   if(o.pass)o.hash=await Auth.hash(o.pass);delete o.pass}
  edit>=0?a[edit]={...a[edit],...o}:a.unshift(o);save(k,a);$('#dlg').close();draw()};
 $('#s').oninput=e=>{q=e.target.value.trim();draw()};$('#add').onclick=()=>open(-1);
 $('tbody').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.e)open(+b.dataset.e);if(b.dataset.d&&confirm('تأكيد الحذف؟')){const a=load(k),t=a[+b.dataset.d];
  if(k==='users'&&(t.username===Auth.user().username||(t.role==='admin'&&a.filter(u=>u.role==='admin').length<2))){alert('لا يمكن حذف هذا المستخدم.');return}
  a.splice(+b.dataset.d,1);save(k,a);draw()}};
 draw();if(new URLSearchParams(location.search).get('new')&&can('add'))open(-1);
}
document.addEventListener('DOMContentLoaded',async()=>{if(!Auth.require())return;await Auth.users();document.querySelector('.main').insertAdjacentHTML('beforeend',`<footer class="afoot">${SITE.dev} — جميع الحقوق محفوظة © ${SITE.year}</footer>`);if(document.body.dataset.a==='home'){CUR='news';shell('home','لوحة المؤشرات');dash()}else modulePage()});
