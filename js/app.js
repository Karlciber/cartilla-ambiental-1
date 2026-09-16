const App = (() => {
  let _u=null,_p=null,_cur="inicio";
  function init(){Auth.init();ThreeScenes.initLoginScene();document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>navigateTo(b.dataset.module)));}
  function startApp(u){
    _u=u;_p=Storage.getProgress(u.username||"invitado");
    ThreeScenes.stopLoginScene();
    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("app-screen").classList.add("active");
    document.getElementById("user-pill").textContent=u.guest?"Invitado":`${u.name} · ${u.grado}`;
    refreshHeader();navigateTo("inicio");
  }
  function navigateTo(key){
    if(_cur==="mapa3d"&&key!=="mapa3d")ThreeScenes.stopMapaGiron();
    _cur=key;
    document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.module===key));
    document.getElementById("content").scrollTop=0;window.scrollTo(0,0);
    const m={inicio:Modules.renderInicio,giron:Modules.renderGiron,ambiental:Modules.renderAmbiental,
      riesgos:Modules.renderRiesgos,vial:Modules.renderVial,saludable:Modules.renderSaludable,
      emprendimiento:Modules.renderEmprendimiento,mapa3d:Modules.renderMapa3D,progreso:Modules.renderProgreso};
    (m[key]||Modules.renderInicio)(document.getElementById("content"));
  }
  function getProgress(){return _p;}
  function addXP(n){_p.xp=((_p.xp)||0)+n;showToast(`+${n} XP 🎉`);refreshHeader();saveProgressDebounced();}
  function saveProgressDebounced(){if(!_u||_u.guest)return;Storage.scheduleAutosave(_u.username,_p);}
  function refreshHeader(){document.getElementById("xp-count").textContent=_p?(_p.xp||0):0;}
  function showToast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2600);}
  document.addEventListener("DOMContentLoaded",init);
  return{startApp,navigateTo,getProgress,addXP,saveProgressDebounced,refreshHeader,showToast};
})();
