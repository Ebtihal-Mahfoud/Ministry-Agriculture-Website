(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}
if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
document.documentElement.dataset.theme=t;
window.themeBtn=function(){var b=document.getElementById('thm');if(!b)return;
var d=document.documentElement,s=function(){b.textContent=d.dataset.theme==='dark'?'☀️ مظهر فاتح':'🌙 مظهر داكن'};s();
b.onclick=function(){var n=d.dataset.theme==='dark'?'light':'dark';d.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(e){}s()}}})();
