const Auth = (() => {
  let _u=null;
  function init(){
    document.querySelectorAll(".tab-btn").forEach(b=>b.addEventListener("click",()=>{
      document.querySelectorAll(".tab-btn").forEach(x=>x.classList.remove("active"));
      document.querySelectorAll(".login-form").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      document.getElementById("form-"+b.dataset.tab).classList.add("active");
    }));
    document.getElementById("form-entrar").addEventListener("submit",e=>{e.preventDefault();_login();});
    document.getElementById("form-registrar").addEventListener("submit",e=>{e.preventDefault();_reg();});
    document.getElementById("btn-invitado").addEventListener("click",()=>{_u={username:"invitado",name:"Invitado",grado:"-",guest:true};App.startApp(_u);});
    document.getElementById("btn-logout").addEventListener("click",logout);
    const s=Storage.getSession();
    if(s&&s.username){const u=Storage.getUsers()[s.username];if(u){_u={username:s.username,name:u.name,grado:u.grado,guest:false};App.startApp(_u);}}
  }
  function _reg(){
    const name=document.getElementById("reg-name").value.trim(),grado=document.getElementById("reg-grado").value,
      user=document.getElementById("reg-user").value.trim().toLowerCase(),pass=document.getElementById("reg-pass").value,
      msg=document.getElementById("reg-msg");
    if(!name||!grado||!user||!pass){msg.textContent="Completa todos los campos.";return;}
    const users=Storage.getUsers();
    if(users[user]){msg.textContent="Ese usuario ya existe.";return;}
    users[user]={name,grado,pass,createdAt:new Date().toISOString()};
    Storage.saveUsers(users);Storage.setSession(user);
    _u={username:user,name,grado,guest:false};
    msg.style.color="green";msg.textContent="¡Cuenta creada!";
    setTimeout(()=>App.startApp(_u),400);
  }
  function _login(){
    const user=document.getElementById("login-user").value.trim().toLowerCase(),
      pass=document.getElementById("login-pass").value,msg=document.getElementById("login-msg"),
      u=Storage.getUsers()[user];
    if(!u||u.pass!==pass){msg.textContent="Usuario o contraseña incorrectos.";return;}
    Storage.setSession(user);_u={username:user,name:u.name,grado:u.grado,guest:false};
    msg.style.color="green";msg.textContent="¡Bienvenido!";
    setTimeout(()=>App.startApp(_u),300);
  }
  function logout(){Storage.clearSession();_u=null;location.reload();}
  function getCurrentUser(){return _u;}
  return{init,getCurrentUser,logout};
})();
