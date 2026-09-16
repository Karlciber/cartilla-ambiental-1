const Storage = (() => {
  const USERS_KEY="vmec_users", SESSION_KEY="vmec_session"; let _t=null;
  const _r=(k,fb)=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):fb;}catch(e){return fb;}};
  const _w=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}};
  const getUsers=()=>_r(USERS_KEY,{});
  const saveUsers=u=>_w(USERS_KEY,u);
  const getProgress=uid=>_r("vmec_p_"+uid,{xp:0,modules:{},lastVisit:new Date().toISOString()});
  const saveProgress=(uid,p)=>{p.lastVisit=new Date().toISOString();return _w("vmec_p_"+uid,p);};
  const getSession=()=>_r(SESSION_KEY,null);
  const setSession=u=>_w(SESSION_KEY,{username:u,since:new Date().toISOString()});
  const clearSession=()=>localStorage.removeItem(SESSION_KEY);
  const scheduleAutosave=(uid,progress,delay=700)=>{
    if(_t)clearTimeout(_t);
    _t=setTimeout(()=>{saveProgress(uid,progress);App.showToast("✔ Progreso guardado");},delay);
  };
  return{getUsers,saveUsers,getProgress,saveProgress,getSession,setSession,clearSession,scheduleAutosave};
})();
