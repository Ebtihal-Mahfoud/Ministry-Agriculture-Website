const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS='بيانات صحفية,فعاليات وأنشطة,أخبار الوزارة,مشاريع جديدة',ST='جديد,قيد المعالجة,مكتمل',PS='منشورة,مسودة';
const MODS={
news:{t:'الأخبار',i:'📰',g:'المحتوى',f:[['title','العنوان'],['date','التاريخ','date'],['cat','التصنيف','sel',CATS],['text','النص','area']],seed:()=>NEWS.map(n=>({title:n[0],date:n[1],cat:n[2],text:n[3]}))},
announcements:{t:'الإعلانات',i:'🔔',g:'المحتوى',f:[['title','العنوان'],['date','التاريخ','date'],['text','النص','area']],seed:()=>[{title:'إعلان عن دورة تدريبية للمزارعين',date:'2026-10-20',text:'التسجيل مفتوح حتى نهاية الشهر.'},{title:'موعد توزيع البذور المدعومة',date:'2026-10-25',text:'يبدأ التوزيع بداية الأسبوع القادم.'}]},
decisions:{t:'القرارات والتشريعات',i:'📜',g:'المحتوى',f:[['no','الرقم'],['title','العنوان'],['date','التاريخ','date'],['kind','النوع','sel','قرار,تشريع,لائحة']],seed:()=>[{no:'112/2026',title:'تنظيم ترخيص المشاريع الزراعية',date:'2026-09-10',kind:'قرار'},{no:'45/2026',title:'لائحة الرعاية البيطرية',date:'2026-06-02',kind:'لائحة'}]},
circulars:{t:'التعاميم',i:'🗂',g:'المحتوى',f:[['no','الرقم'],['title','الموضوع'],['date','التاريخ','date'],['to','الجهة الموجّه إليها']],seed:()=>[{no:'7/2026',title:'تحديث إجراءات الصرف',date:'2026-10-01',to:'جميع الإدارات'}]},
pages:{t:'الصفحات الثابتة',i:'📄',g:'المحتوى',f:[['title','العنوان'],['slug','الرابط'],['status','الحالة','sel',PS],['text','المحتوى','area']],seed:()=>[{title:'رؤيتنا ورسالتنا',slug:'about.html',status:'منشورة',text:''},{title:'الأسئلة الشائعة',slug:'faq.html',status:'منشورة',text:''},{title:'السياسات والخصوصية',slug:'privacy.html',status:'منشورة',text:''}]},
services:{t:'الخدمات الإلكترونية',i:'✨',g:'الخدمات والمشاريع',f:[['title','اسم الخدمة'],['icon','الأيقونة'],['text','الوصف','area']],seed:()=>SERVICES.map(s=>({title:s[1],icon:s[0],text:s[2]}))},
requests:{t:'طلبات الخدمات',i:'📂',g:'الخدمات والمشاريع',f:[['name','مقدّم الطلب'],['service','الخدمة'],['date','التاريخ','date'],['status','الحالة','sel',ST]],seed:()=>[{name:'أحمد سالم',service:SERVICES[0][1],date:'2026-10-30',status:'جديد'},{name:'محمد علي',service:SERVICES[3][1],date:'2026-10-28',status:'قيد المعالجة'},{name:'سالم عمر',service:SERVICES[5][1],date:'2026-10-20',status:'مكتمل'}]},
projects:{t:'المشاريع والمبادرات',i:'💼',g:'الخدمات والمشاريع',f:[['title','اسم المشروع'],['loc','الموقع'],['cat','التصنيف','sel','الزراعية,الحيوانية,البنية التحتية'],['year','السنة'],['pct','نسبة الإنجاز %','number']],seed:()=>PROJECTS.map(p=>({title:p[0],loc:p[1],cat:p[2],year:p[3],pct:p[4]}))},
depts:{t:'الإدارات والمكاتب',i:'🏢',g:'الهيكل التنظيمي',f:[['title','الاسم'],['kind','النوع','sel','إدارة,مكتب'],['mail','البريد'],['text','نبذة','area']],seed:()=>[...DEPTS.map(d=>({title:d[1],kind:'إدارة',mail:d[2],text:d[3]})),...OFFICES.map(d=>({title:d[1],kind:'مكتب',mail:d[2],text:d[3]}))]},
affil:{t:'الجهات التابعة',i:'🏛',g:'الهيكل التنظيمي',f:[['title','اسم الجهة'],['icon','الأيقونة']],seed:()=>AFFIL.map(a=>({title:a[1],icon:a[0]}))},
messages:{t:'رسائل المواطنين',i:'✉️',g:'التواصل',key:'contact_messages',f:[['name','الاسم'],['email','البريد'],['subject','الموضوع'],['msg','الرسالة','area']],seed:()=>[{name:'خالد أحمد',email:'khaled@example.ly',subject:'استفسار عن ترخيص',msg:'أرغب بمعرفة متطلبات ترخيص مشروع زراعي.'},{name:'سالم المصري',email:'salem@example.ly',subject:'اقتراح',msg:'اقتراح بتوسيع الخدمة البيطرية المتنقلة.'}]}};
const store=k=>MODS[k].key||'adm_'+k;
const load=k=>{try{const v=localStorage.getItem(store(k));if(v)return JSON.parse(v)}catch(_){}const s=MODS[k].seed();save(k,s);return s};
const save=(k,a)=>{try{localStorage.setItem(store(k),JSON.stringify(a))}catch(_){}};
const role=()=>localStorage.getItem('adm_role')||'admin';
const can=a=>role()==='admin'||(role()==='editor'&&a!=='del');
function shell(active,crumb){
 const groups=[...new Set(Object.values(MODS).map(m=>m.g))],r=role();
 $('aside').innerHTML=`<div class="lg"><span style="font-size:1.6rem">🌾</span><div>وزارة الزراعة<br><small>والثروة الحيوانية - ليبيا</small></div></div><a href="index.html" class="${active==='home'?'on':''}">▦ الرئيسية</a>`+groups.filter(g=>!(r==='viewer'&&g==='الهيكل التنظيمي')).map(g=>`<h5>${g}</h5>`+Object.entries(MODS).filter(([,m])=>m.g===g).map(([k,m])=>`<a href="module.html?m=${k}" class="${active===k?'on':''}">${m.i} ${m.t}</a>`).join('')).join('')+`<a href="index.html">↗ العودة للموقع</a><div class="help">❓ تحتاج إلى مساعدة؟<br><small>دليل استخدام لوحة الإدارة</small></div><div class="usr"><i>م</i><div>مستخدم تجريبي<br><small>${{admin:'مدير النظام',editor:'محرر محتوى',viewer:'مشاهد'}[r]}</small></div></div>`;
 const nm=load('messages').length;
 $('#top').innerHTML=`<div>الإدارة › <b>${crumb}</b></div><div style="display:flex;gap:10px;align-items:center"><select id="role" aria-label="عرض الدور"><option value="admin">عرض الدور: مدير النظام</option><option value="editor">محرر محتوى</option><option value="viewer">مشاهد</option></select><button class="thm" id="thm" aria-label="تبديل المظهر"></button><a href="module.html?m=messages" title="الرسائل">🔔 <span class="chip">${nm}</span></a></div>`;
 themeBtn();$('#role').value=r;$('#role').onchange=e=>{localStorage.setItem('adm_role',e.target.value);location.reload()};
}
function dash(){
 const n=load('news').length,p=load('projects'),m=load('messages').length,rq=load('requests').length;
 const wk=[['السبت',40,60],['الجمعة',55,80],['الخميس',38,58],['الأربعاء',48,70],['الثلاثاء',30,42],['الاثنين',42,62],['الأحد',28,40]];
 const top=[...p].sort((a,b)=>b.pct-a.pct).slice(0,3);
 const d=new Date().toLocaleDateString('ar-LY',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 $('#app').innerHTML=`<div class="prev">🛡 <b>وضع المعاينة</b> — بيانات تجريبية فقط. لا يوجد اتصال فعلي بقاعدة البيانات.</div><small>${d}</small><h1 style="color:var(--title)">مرحباً بك، مدير النظام</h1><p>إليك نظرة عامة على محتوى البوابة وأحدث ما يجري اليوم.</p>
 <div class="kpis"><div class="card kpi"><span>إجمالي الأخبار</span><b>${n}</b><span class="up">↗ 12.4%+ مقارنة بالشهر الماضي</span></div><div class="card kpi"><span>المشاريع والمبادرات</span><b>${p.length}</b><span class="up">+2 جديد</span></div><div class="card kpi"><span>رسائل جديدة</span><b>${String(m).padStart(2,'0')}</b><span>تحتاج إلى مراجعة · ${rq} طلبات خدمة</span></div><div class="card kpi"><span>عمليات البحث</span><b>2,846</b><span class="up">↗ 8.2%+</span></div></div>
 <div class="two"><div class="card"><small>ابدأ بسرعة</small><h3>إجراءات سريعة</h3><button class="qa" onclick="location='module.html?m=news&new=1'">➕ <span>إضافة خبر جديد</span></button><button class="qa" onclick="location='module.html?m=projects'">💼 <span>تحديث مشروع</span></button><button class="qa" onclick="location='module.html?m=messages'">✉️ <span>مراجعة الرسائل</span></button></div>
 <div class="card"><small>ملخص النشاط</small><h3>نظرة عامة على البوابة</h3><div class="chart">${wk.map(w=>`<div><i style="height:${w[1]}%"></i><i style="height:${w[2]}%"></i></div>`).join('')}</div><div class="lab">${wk.map(w=>`<span>${w[0]}</span>`).join('')}</div></div></div>
 <div class="two2"><div class="card"><small>المتابعة</small><h3>أبرز المشاريع</h3>${top.map(x=>`<p style="margin:12px 0 2px"><b>${esc(x.title)}</b> <small>${esc(x.loc)}</small></p><div class="bar-p"><i style="width:${x.pct}%"></i></div><small>${x.pct}%</small>`).join('')}</div>
 <div class="card"><small>سجل التغييرات</small><h3>آخر النشاطات</h3><p>📰 تم تحديث خبر «${esc(load('news')[0]?.title)}»<br><small>قبل 14 دقيقة</small></p><p>✉️ وصلت رسالة جديدة من أحمد سالم<br><small>قبل 42 دقيقة</small></p><p>💼 تم إنجاز مشروع «${esc(top[0]?.title)}»<br><small>قبل ساعتين</small></p><p>📄 تم نشر صفحة «الرؤية والرسالة»<br><small>أمس</small></p></div></div>
 <div class="card"><small>اهتمامات الزوار</small><h3>أكثر كلمات البحث استخداماً</h3>${[['دعم المزارعين',482],['الخدمات البيطرية',316],['تسجيل مزرعة',274],['الأسمدة الزراعية',193]].map(k=>`<span class="chip">${k[0]} · ${k[1]}</span>`).join('')}</div>`;
}
function modulePage(){
 const k=new URLSearchParams(location.search).get('m'),M=MODS[k];if(!M){$('#app').innerHTML='<p>القسم غير موجود.</p>';return}
 shell(k,M.t);document.title=M.t;let q='',edit=-1;const cols=M.f.slice(0,4);
 $('#app').innerHTML=`<h1 style="color:var(--title)">${M.i} ${M.t}</h1><div class="tb"><input id="s" placeholder="🔍 بحث..."><button class="btn" id="add">➕ إضافة</button><small id="cnt"></small></div><div class="tw"><table><thead></thead><tbody></tbody></table></div><dialog id="dlg"><form method="dialog" id="fm"><h3 id="dt"></h3><div id="fl"></div><p style="margin-top:14px"><button class="btn" value="ok">حفظ</button> <button class="btn alt" value="x" formnovalidate>إلغاء</button></p></form></dialog>`;
 const draw=()=>{const a=load(k);const rows=a.map((r,i)=>[r,i]).filter(([r])=>!q||JSON.stringify(r).includes(q));
  $('thead').innerHTML=`<tr><th>#</th>${cols.map(c=>`<th>${c[1]}</th>`).join('')}<th></th></tr>`;
  $('tbody').innerHTML=rows.map(([r,i],n)=>`<tr><td>${n+1}</td>${cols.map(c=>`<td>${c[0]==='status'||c[0]==='kind'||c[0]==='cat'?`<span class="chip">${esc(r[c[0]])}</span>`:esc(String(r[c[0]]).slice(0,70))}</td>`).join('')}<td>${can('edit')?`<button class="btn sm" data-e="${i}">تعديل</button>`:''}${can('del')?`<button class="btn sm del" data-d="${i}">حذف</button>`:''}</td></tr>`).join('')||`<tr><td colspan="9">لا توجد سجلات.</td></tr>`;
  $('#cnt').textContent=rows.length+' سجل';$('#add').style.display=can('edit')?'':'none'};
 const open=i=>{edit=i;const r=i>=0?load(k)[i]:{};$('#dt').textContent=(i>=0?'تعديل: ':'إضافة: ')+M.t;
  $('#fl').innerHTML=M.f.map(([n,l,t,o])=>`<label>${l}</label>`+(t==='area'?`<textarea name="${n}" rows="3">${esc(r[n])}</textarea>`:t==='sel'?`<select name="${n}">${o.split(',').map(x=>`<option ${r[n]===x?'selected':''}>${x}</option>`).join('')}</select>`:`<input name="${n}" type="${t||'text'}" value="${esc(r[n])}">`)).join('');$('#dlg').showModal()};
 $('#fm').onsubmit=e=>{if(e.submitter?.value!=='ok')return;const o=Object.fromEntries(new FormData($('#fm')));const a=load(k);edit>=0?a[edit]={...a[edit],...o}:a.unshift(o);save(k,a);draw()};
 $('#s').oninput=e=>{q=e.target.value.trim();draw()};$('#add').onclick=()=>open(-1);
 $('tbody').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.e)open(+b.dataset.e);if(b.dataset.d&&confirm('تأكيد الحذف؟')){const a=load(k);a.splice(+b.dataset.d,1);save(k,a);draw()}};
 draw();if(new URLSearchParams(location.search).get('new')&&can('edit'))open(-1);
}
document.addEventListener('DOMContentLoaded',()=>{if(document.body.dataset.a==='home'){shell('home','لوحة المؤشرات');dash()}else modulePage()});
