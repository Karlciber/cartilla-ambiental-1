const Modules = (() => {
  function _mp(k){const p=App.getProgress();if(!p.modules[k])p.modules[k]={quizScore:null,quizDone:false,activities:{},visited:false};return p.modules[k];}
  function _vis(k){const m=_mp(k);if(!m.visited){m.visited=true;App.saveProgressDebounced();}}
  function _act(k,id,v){const m=_mp(k);m.activities[id]=v;App.saveProgressDebounced();}

  function _quiz(key,qs,el){
    const mp=_mp(key);const sa=mp.activities["quiz_answers"]||{};
    const w=document.createElement("div");w.className="card";
    w.innerHTML=`<h3>📝 Taller de comprensión <span class="badge">${qs.length} preguntas</span></h3>`;
    qs.forEach((q,qi)=>{
      const qd=document.createElement("div");qd.className="quiz-q";
      qd.innerHTML=`<p class="q-text">${qi+1}. ${q.pregunta}</p>`;
      q.opciones.forEach((op,oi)=>{
        const o=document.createElement("div");o.className="quiz-opt";
        if(sa[qi]===oi)o.classList.add("selected");o.textContent=op;
        o.addEventListener("click",()=>{qd.querySelectorAll(".quiz-opt").forEach(x=>x.classList.remove("selected"));o.classList.add("selected");sa[qi]=oi;mp.activities["quiz_answers"]=sa;App.saveProgressDebounced();});
        qd.appendChild(o);
      });w.appendChild(qd);
    });
    const btn=document.createElement("button");btn.className="btn-check";btn.textContent=mp.quizDone?"Revisar de nuevo":"Calificar taller";
    const fb=document.createElement("p");fb.className="quiz-feedback";
    btn.addEventListener("click",()=>{
      let c=0;qs.forEach((q,qi)=>{
        const opts=w.querySelectorAll(".quiz-q")[qi].querySelectorAll(".quiz-opt");
        opts.forEach((o,oi)=>{o.classList.remove("correct","incorrect");if(oi===q.correcta)o.classList.add("correct");else if(sa[qi]===oi)o.classList.add("incorrect");});
        if(sa[qi]===q.correcta)c++;
      });
      const s=Math.round(c/qs.length*100);fb.textContent=`Obtuviste ${c} de ${qs.length} correctas (${s}%).`;fb.style.color=s>=60?"#1f7a3f":"#d8453a";
      const first=!mp.quizDone;mp.quizScore=s;mp.quizDone=true;if(first)App.addXP(s>=60?30:10);
      App.saveProgressDebounced();App.refreshHeader();
    });
    w.appendChild(btn);w.appendChild(fb);el.appendChild(w);
  }

  function _ref(k,id,titulo,pregs,el){
    const mp=_mp(k);const w=document.createElement("div");w.className="activity";w.innerHTML=`<h4>✍️ ${titulo}</h4>`;
    pregs.forEach((p,i)=>{
      const pid=id+"_"+i;const pp=document.createElement("p");pp.innerHTML=`<strong>${p}</strong>`;
      const ta=document.createElement("textarea");ta.placeholder="Escribe tu respuesta aquí...";ta.value=mp.activities[pid]||"";
      ta.addEventListener("input",()=>_act(k,pid,ta.value));w.appendChild(pp);w.appendChild(ta);
    });el.appendChild(w);
  }

  function _chk(k,id,titulo,items,el){
    const mp=_mp(k);const saved=mp.activities[id]||{};const w=document.createElement("div");w.className="activity";
    w.innerHTML=`<h4>✅ ${titulo}</h4><p>Marca los elementos que ya tienes preparados:</p>`;
    items.forEach((item,i)=>{
      const row=document.createElement("label");row.style.cssText="display:block;margin-bottom:6px;";
      row.innerHTML=`<input type="checkbox" ${saved[i]?"checked":""}> ${item}`;
      row.querySelector("input").addEventListener("change",e=>{saved[i]=e.target.checked;mp.activities[id]=saved;App.saveProgressDebounced();});
      w.appendChild(row);
    });el.appendChild(w);
  }

  // Tarjetas de lugares clickeables con foto
  function _lugares(lugares,el){
    const grid=document.createElement("div");grid.className="grid-2";
    lugares.forEach(l=>{
      const card=document.createElement("div");card.className="legend-card lugar-card-clickeable";
      card.innerHTML=`<span class="legend-emoji">📍</span><div><strong>${l.nombre}</strong><p style="margin:4px 0 0;font-size:.85rem;">${l.desc}</p><small style="color:#2e7d32;font-weight:bold;font-size:.78rem;">📷 Clic para ver foto</small></div>`;
      if(l.foto){
        card.addEventListener("click",()=>{
          document.getElementById("lugar-modal-img").src=l.foto;
          document.getElementById("lugar-modal-img").alt=l.nombre;
          document.getElementById("lugar-modal-titulo").textContent=l.nombre;
          document.getElementById("lugar-modal-desc").textContent=l.desc;
          document.getElementById("lugar-modal").style.display="flex";
        });
      }
      grid.appendChild(card);
    });el.appendChild(grid);
  }

  function renderInicio(c){
    const u=Auth.getCurrentUser();const p=App.getProgress();
    c.innerHTML=`<div class="module-header"><h1>¡Bienvenido(a), ${u.name}! 🐝</h1><p>Explora los módulos de la cartilla ambiental del Colegio Luis Carlos Galán Sarmiento.</p></div>
    <div class="card tip"><p>El área de Ciencias Naturales y Educación Ambiental busca que tomes conciencia de la importancia de cuidar y preservar el medio ambiente.</p></div>
    <div class="lesson-nav-home" id="home-tiles"></div>`;
    const tiles=c.querySelector("#home-tiles");
    Object.keys(CARTILLA_DATA.modulos).forEach(k=>{
      const m=CARTILLA_DATA.modulos[k];const mp=p.modules[k];const done=mp&&mp.quizDone;
      const tile=document.createElement("div");tile.className="module-tile";
      tile.innerHTML=`<div class="tile-icon">${m.icon}</div><div class="tile-title">${m.titulo}</div><div class="tile-progress">${done?"✔ "+mp.quizScore+"%":"Sin completar"}</div>`;
      tile.addEventListener("click",()=>App.navigateTo(k));tiles.appendChild(tile);
    });
  }

  function renderGiron(c){
    const d=CARTILLA_DATA.giron;_vis("giron");
    c.innerHTML=`<div class="module-header"><h1>🏛️ Módulo I: Girón</h1><p>${d.intro}</p></div>
    <div class="card"><h3>Reseña histórica</h3><div class="timeline">
      <div class="timeline-item"><h4>Fundación — ${d.historia.fundacion}</h4><p>${d.historia.texto}</p></div>
      <div class="timeline-item"><h4>Consolidación colonial</h4><p>${d.historia.postfundacion}</p></div>
    </div></div>
    <div class="card"><h3>Los Guanes</h3><p>${d.guanes}</p>
      <table class="styled"><tr><th>Palabra guane</th><th>Significado</th></tr>${d.vocabularioGuane.map(v=>`<tr><td>${v.palabra}</td><td>${v.significado}</td></tr>`).join("")}</table>
    </div>
    <div class="card"><h3>📍 Lugares turísticos <small style="font-size:.8rem;font-weight:normal;color:#555"> — Haz clic en cada tarjeta para ver la foto</small></h3><div id="lug-grid"></div></div>
    <div class="card"><h3>Gastronomía</h3>${d.comidaTipica.map(f=>`<p><strong>${f.nombre}:</strong> ${f.desc}</p>`).join("")}</div>
    <div class="card"><h3>Leyendas de Girón</h3>${d.leyendas.map(l=>`<p><strong>${l.titulo}:</strong> ${l.texto}</p>`).join("")}</div>
    <div class="card"><h3>El Río de Oro</h3><p>${d.rioDeOro}</p></div>
    <div class="card"><h3>Fauna típica</h3><div class="grid-2">${d.fauna.map(f=>`<div class="legend-card"><span class="legend-emoji">🐦</span><div><strong>${f.nombre}</strong><p style="margin:4px 0 0;font-size:.88rem;">${f.desc}</p></div></div>`).join("")}</div></div>
    <div id="az"></div>`;
    _lugares(d.lugaresTuristicos,c.querySelector("#lug-grid"));
    const z=c.querySelector("#az");
    _ref("giron","r1","Actividad: tu lugar favorito",["¿Cuál de los lugares turísticos de Girón te gustaría visitar y por qué?"],z);
    _quiz("giron",d.quiz,z);
  }

  function renderAmbiental(c){const d=CARTILLA_DATA.ambiental;_vis("ambiental");
    c.innerHTML=`<div class="module-header"><h1>🌱 Módulo II: Proyecto Ambiental</h1><p>${d.intro}</p></div>
    <div class="card alert"><h3>Carta del año 2070</h3><p>${d.cartaDel2070}</p></div>
    <div class="card"><h3>Los páramos</h3><p>${d.paramos.texto}</p><p><strong>Amenazas:</strong> ${d.paramos.amenazas}</p><div class="card tip"><p><strong>Dato clave:</strong> ${d.paramos.datoClave}</p></div></div>
    <div class="card"><h3>Huella hídrica</h3><p>${d.huellaHidrica.texto}</p><ul>${d.huellaHidrica.datos.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="card"><h3>Comparendo Ambiental Escolar</h3><table class="styled"><tr><th>Conducta</th><th>Medida correctiva</th></tr>${d.comparendoAmbiental.map(x=>`<tr><td>${x.falta}</td><td>${x.sancion}</td></tr>`).join("")}</table></div>
    <div id="az"></div>`;
    const z=c.querySelector("#az");
    _ref("ambiental","p1","Taller: páramo de Santurbán",["¿Cuál es la problemática del páramo de Santurbán?","¿Soluciones desde el punto de vista de un gobernante?","¿Soluciones desde el punto de vista de un consumidor?"],z);
    _quiz("ambiental",d.quiz,z);
  }

  function renderRiesgos(c){const d=CARTILLA_DATA.riesgos;_vis("riesgos");
    c.innerHTML=`<div class="module-header"><h1>⚠️ Módulo III: Prevención de Riesgos</h1><p>${d.intro}</p></div>
    <div class="card"><h3>El Aedes aegypti</h3><p>${d.aedes.descripcion}</p><h4>Ciclo de vida</h4><div class="timeline">${d.aedes.ciclo.map((x,i)=>`<div class="timeline-item"><h4>Etapa ${i+1}</h4><p>${x}</p></div>`).join("")}</div><p><strong>Criaderos:</strong> ${d.aedes.criaderos}</p></div>
    <div class="card tip"><h3>Prevención</h3><ul>${d.aedes.prevencion.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="card alert"><h3>Síntomas y tratamiento</h3><ul>${d.aedes.sintomas.map(x=>`<li>${x}</li>`).join("")}</ul><ol>${d.aedes.tratamiento.map(x=>`<li>${x}</li>`).join("")}</ol></div>
    <div id="az"></div>`;
    const z=c.querySelector("#az");_chk("riesgos","mochila","Mi mochila de emergencia",d.mochilaEmergencia,z);_quiz("riesgos",d.quiz,z);
  }

  function renderVial(c){const d=CARTILLA_DATA.vial;_vis("vial");
    c.innerHTML=`<div class="module-header"><h1>🚦 Módulo IV: Seguridad Vial</h1><p>${d.intro}</p></div>
    <div class="card alert"><h3>Riesgo: colgarse de un vehículo</h3><p>${d.riesgoColgarse}</p></div>
    <div class="card"><h3>Señales de tránsito</h3><table class="styled"><tr><th>Tipo</th><th>Color</th><th>Función</th></tr>${d.senalesTransito.map(s=>`<tr><td>${s.tipo}</td><td>${s.color}</td><td>${s.funcion}</td></tr>`).join("")}</table></div>
    <div id="az"></div>`;
    const z=c.querySelector("#az");_ref("vial","v1","Taller de reflexión vial",d.preguntasReflexion,z);_quiz("vial",d.quiz,z);
  }

  function renderSaludable(c){const d=CARTILLA_DATA.saludable;_vis("saludable");
    c.innerHTML=`<div class="module-header"><h1>🥗 Módulo V: Vida Saludable</h1><p>${d.intro}</p></div>
    <div class="card"><h3>Tipos de violencia</h3><div class="grid-2">${d.tiposViolencia.map(t=>`<div class="legend-card"><span class="legend-emoji">⚖️</span><div><strong>${t.tipo}</strong><p style="margin:4px 0 0;font-size:.85rem;">${t.desc}</p></div></div>`).join("")}</div></div>
    <div class="card tip"><h3>El Violentómetro</h3><p><strong>Creado por:</strong> ${d.violentometro.creador}</p><p>${d.violentometro.descripcion}</p><div class="timeline">${d.violentometro.fases.map((f,i)=>`<div class="timeline-item"><h4>${i+1}. ${f}</h4></div>`).join("")}</div></div>
    <div class="card"><h3>Dilemas para reflexionar</h3>${d.dilemas.map(dl=>`<p><strong>${dl.nombre}:</strong> ${dl.texto}</p>`).join("")}</div>
    <div id="az"></div>`;
    const z=c.querySelector("#az");d.dilemas.forEach((dl,i)=>_ref("saludable","d"+i,dl.nombre,[dl.pregunta],z));_quiz("saludable",d.quiz,z);
  }

  function renderEmprendimiento(c){const d=CARTILLA_DATA.emprendimiento;_vis("emprendimiento");
    c.innerHTML=`<div class="module-header"><h1>💡 Módulo VI: Emprendimiento</h1><p>${d.intro}</p></div>
    <div class="card"><h3>Objetivos Ley 1014</h3><ul>${d.objetivosLey.map(o=>`<li>${o}</li>`).join("")}</ul></div>
    <div class="card"><h3>Feria Empresarial</h3><p>${d.feriaEmpresarial}</p><div class="grid-2">${d.proyectosDestacados.map(p=>`<div class="legend-card"><span class="legend-emoji">🛍️</span><div>${p}</div></div>`).join("")}</div></div>
    <div class="card tip"><h3>Ideas de emprendimiento</h3><ul>${d.ideasEmprendimientoEscolar.map(i=>`<li>${i}</li>`).join("")}</ul></div>
    <div id="az"></div>`;
    const z=c.querySelector("#az");_ref("emprendimiento","e1","Taller: mi propio emprendimiento",["¿Tienes algún emprendimiento o cuál harías?","¿Cómo emprenderías tu propio negocio?"],z);_quiz("emprendimiento",d.quiz,z);
  }

  function renderMapa3D(c){
    c.innerHTML=`<div class="module-header">
      <h1>🌍 Mapa 3D Interactivo de Girón</h1>
      <p>Cada lugar turístico aparece con su <strong>nombre visible directamente en el mapa</strong>. Haz clic en cualquier etiqueta para ver la foto y la información del lugar.</p>
    </div>
    <div class="card tip" style="padding:10px 16px;margin-bottom:14px;">
      <p style="margin:0;font-size:.88rem;">
        🖱️ <strong>Arrastra</strong> para rotar &nbsp;·&nbsp;
        🔍 <strong>Rueda del mouse</strong> para acercar/alejar &nbsp;·&nbsp;
        📍 <strong>Clic en el nombre</strong> del lugar para ver su foto
      </p>
    </div>
    <div class="viz-3d-box" id="mapa3d-canvas" style="height:520px;position:relative;">
      <div class="mapa-instruccion">📍 Haz clic en el nombre de cualquier lugar para ver la foto</div>
    </div>`;
    /* Esperar 2 frames extra para garantizar que el div ya tiene altura real */
    requestAnimationFrame(() => requestAnimationFrame(() =>
      ThreeScenes.initMapaGiron("mapa3d-canvas")
    ));
  }

  function renderProgreso(c){
    const p=App.getProgress();const ks=Object.keys(CARTILLA_DATA.modulos);
    const done=ks.filter(k=>p.modules[k]&&p.modules[k].quizDone).length;
    const scores=ks.map(k=>p.modules[k]&&p.modules[k].quizScore).filter(s=>s!=null);
    const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
    c.innerHTML=`<div class="module-header"><h1>📊 Mi Progreso</h1></div>
    <div class="progress-summary">
      <div class="stat-box"><div class="num">${p.xp}</div><div class="lab">Puntos XP</div></div>
      <div class="stat-box"><div class="num">${done}/${ks.length}</div><div class="lab">Módulos completados</div></div>
      <div class="stat-box"><div class="num">${avg}%</div><div class="lab">Promedio talleres</div></div>
    </div>
    <div class="card"><h3>Detalle por módulo</h3><div class="module-list-progress">${ks.map(k=>{
      const m=CARTILLA_DATA.modulos[k];const mp=p.modules[k];const sc=mp&&mp.quizDone?mp.quizScore:0;
      return `<div class="mod-row"><span class="name">${m.icon} ${m.titulo}</span>
        <div class="progressbar-track"><div class="progressbar-fill" style="width:${sc}%"></div></div>
        <span style="font-size:.8rem;color:#555;width:60px;text-align:right;">${mp&&mp.quizDone?sc+"%":"—"}</span></div>`;
    }).join("")}</div></div>`;
  }

  return{renderInicio,renderGiron,renderAmbiental,renderRiesgos,renderVial,renderSaludable,renderEmprendimiento,renderMapa3D,renderProgreso};
})();
