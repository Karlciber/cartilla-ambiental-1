/* ====================================================================
   three-scenes.js — Three.js r128
   Fix canvas negro: dimensiones reales con rAF doble + fallback al padre.
   ==================================================================== */
const ThreeScenes = (() => {

  let loginAnimId = null;
  let mapaState   = null;

  /* ─────────────────────────────────────────
     FONDO ANIMADO DEL LOGIN
  ───────────────────────────────────────── */
  function initLoginScene() {
    const container = document.getElementById("login-3d-container");
    if (!container || typeof THREE === "undefined") return;

    const w = window.innerWidth, h = window.innerHeight;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const group  = new THREE.Group();
    const colors = [0x4caf6b, 0xf5c542, 0x5aa9d6, 0x1f7a3f];
    for (let i = 0; i < 70; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.05 + Math.random() * 0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: colors[i % 4], transparent: true, opacity: 0.7 })
      );
      m.position.set((Math.random()-.5)*18, (Math.random()-.5)*12, (Math.random()-.5)*8);
      m.userData = { speed: 0.002 + Math.random()*0.004, offset: Math.random()*Math.PI*2 };
      group.add(m);
    }
    scene.add(group);

    (function animate() {
      loginAnimId = requestAnimationFrame(animate);
      group.children.forEach(m => {
        m.position.y += Math.sin(Date.now()*.001 + m.userData.offset) * .003;
        m.rotation.y += m.userData.speed;
      });
      group.rotation.y += .0008;
      renderer.render(scene, camera);
    })();

    window.addEventListener("resize", () => {
      const nw = window.innerWidth, nh = window.innerHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
  }

  function stopLoginScene() {
    if (loginAnimId) { cancelAnimationFrame(loginAnimId); loginAnimId = null; }
  }

  /* ─────────────────────────────────────────
     DATOS DE LUGARES TURÍSTICOS
  ───────────────────────────────────────── */
  const LUGARES = [
    { px: 2,  pz:-6, nombre:"Basílica Menor\nSan Juan Bautista",  foto:"assets/lugar_basilica.jpg",
      desc:"La iglesia más antigua de Girón, réplica de la Basílica de Santa María Mayor de Roma. Alberga el crucifijo del Señor de los Milagros." },
    { px: 5,  pz:-3, nombre:"Capilla Ntra.\nSra. de las Nieves",  foto:"assets/lugar_capilla.jpg",
      desc:"Arquitectura colonial levantada el 15 de mayo de 1757. Alberga una escultura de la Virgen tallada en madera con rostro de bronce." },
    { px: 7,  pz: 1, nombre:"Parroquia\nSanta Cruz",              foto:"assets/lugar_parroquia.jpg",
      desc:"Segunda parroquia en antigüedad del municipio, fundada el 24 de agosto de 1969." },
    { px: 3,  pz: 4, nombre:"Puentes\nColoniales",                foto:"assets/lugar_puentes.jpg",
      desc:"Girón conserva seis puentes coloniales en piedra de lajas: el Puente el Moro, San José y las Nieves, entre otros." },
    { px: 6,  pz: 6, nombre:"La Casona",                          foto:"assets/lugar_casona.jpg",
      desc:"Restaurante tradicional con ambiente rústico y gastronomía típica santandereana. Ícono gastronómico de Girón." },
    { px:-1,  pz:-7, nombre:"Parque\nPeralta",                    foto:"assets/lugar_peralta.jpg",
      desc:"Conocido como 'el de los enamorados' por su iluminación romántica. Allí se construyó el primer caserío de Girón." },
    { px: 0,  pz:-3, nombre:"Parque\nlas Nieves",                 foto:"assets/lugar_parque_nieves.jpg",
      desc:"Pequeña plaza en damero, sitio predilecto para matrimonios católicos en Santander." },
    { px: 1,  pz: 2, nombre:"Parque\nPrincipal",                  foto:"assets/lugar_parque_principal.jpg",
      desc:"Sitio del antiguo mercado dominical colonial. Corazón histórico de Girón rodeado de casas blancas con balcones." },
    { px:-2,  pz: 6, nombre:"Parque\nEl Gallineral",              foto:"assets/lugar_gallineral.jpg",
      desc:"El parque más extenso de la Villa de los Caballeros. Sus árboles cubiertos de musgo español son uno de los mayores atractivos." },
    { px: 9,  pz:-6, nombre:"El Poblado",                         foto:"assets/lugar_poblado.jpg",
      desc:"Principal puerta de entrada a Girón, con la 'Puerta Grande' como monumento característico y calles empedradas coloniales." },
    { px: 8,  pz: 4, nombre:"Cañón de\nlas Iguanas",              foto:"assets/lugar_canon.jpg",
      desc:"Cascadas y pozos naturales en la vereda Chocoa, ideal para caminatas y deportes extremos." },
    { px:-6,  pz: 1, nombre:"Mansión\ndel Fraile",                foto:"assets/lugar_mansion.jpg",
      desc:"Casa colonial donde nació Eloy Valenzuela, participante de la Expedición Botánica de José Celestino Mutis." },
  ];

  /* ─────────────────────────────────────────
     MAPA 3D — se construye dentro de rAF
     para garantizar dimensiones reales
  ───────────────────────────────────────── */
  function initMapaGiron(containerId) {
    if (typeof THREE === "undefined") {
      console.error("Three.js no cargado"); return;
    }

    /* Doble rAF: primero el navegador pinta el DOM, luego medimos */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => _buildMapa(containerId));
    });
  }

  function _buildMapa(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.style.position = "relative";
    container.style.overflow = "hidden";

    /* Medir con fallbacks */
    const W = container.offsetWidth  || container.parentElement?.offsetWidth  || 860;
    const H = container.offsetHeight || 520;

    if (W < 10 || H < 10) {
      /* Si aún no hay tamaño (Firefox lento), intentar una vez más */
      setTimeout(() => _buildMapa(containerId), 120);
      return;
    }

    /* ── Escena ── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); /* cielo azul */
    scene.fog = new THREE.Fog(0x87CEEB, 30, 80);

    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 200);
    camera.position.set(0, 11, 17);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = false;

    /* Limpiar e insertar canvas */
    container.innerHTML = "";
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
    container.appendChild(renderer.domElement);

    /* ── Luces ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const sun = new THREE.DirectionalLight(0xfff8e1, 0.95);
    sun.position.set(8, 15, 10);
    scene.add(sun);

    /* ── Terreno ── */
    const terreno = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 26),
      new THREE.MeshLambertMaterial({ color: 0x4caf6b })
    );
    terreno.rotation.x = -Math.PI / 2;
    scene.add(terreno);

    /* ── Río de Oro ── */
    const rio = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 26),
      new THREE.MeshLambertMaterial({ color: 0x42a5f5 })
    );
    rio.rotation.x = -Math.PI / 2;
    rio.position.set(-4.5, 0.01, 0);
    scene.add(rio);

    /* ── Arbustos decorativos ── */
    const bushMat = new THREE.MeshLambertMaterial({ color: 0x388e3c });
    for (let i = 0; i < 22; i++) {
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 + Math.random()*0.35, 6, 6),
        bushMat
      );
      b.position.set((Math.random()-0.5)*28, 0.3, (Math.random()-0.5)*22);
      scene.add(b);
    }

    /* ── Puntos de anclaje 3D (esfera pequeña visible) ── */
    const anchorMat  = new THREE.MeshLambertMaterial({ color: 0xf9a825 });
    const anchorGeo  = new THREE.SphereGeometry(0.22, 10, 10);
    const anchors = LUGARES.map(l => {
      const m = new THREE.Mesh(anchorGeo, anchorMat);
      m.position.set(l.px, 0.3, l.pz);
      m.userData.lugar = l;
      scene.add(m);
      return m;
    });

    /* ── Contenedor de etiquetas HTML ── */
    const labelsWrap = document.createElement("div");
    labelsWrap.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;" +
      "pointer-events:none;overflow:hidden;";
    container.appendChild(labelsWrap);

    const labelEls = LUGARES.map((lugar, i) => {
      const el = document.createElement("div");
      el.className = "mapa-label";
      el.innerHTML =
        `<span class="mapa-label-pin">📍</span>` +
        `<span class="mapa-label-text">${lugar.nombre.replace(/\n/g,"<br>")}</span>`;
      el.style.cssText =
        "position:absolute;transform:translate(-50%,-110%);" +
        "cursor:pointer;pointer-events:auto;user-select:none;" +
        "transition:transform 0.12s,box-shadow 0.12s;";
      el.addEventListener("mouseenter", () =>
        el.style.transform = "translate(-50%,-110%) scale(1.13)"
      );
      el.addEventListener("mouseleave", () =>
        el.style.transform = "translate(-50%,-110%) scale(1)"
      );
      el.addEventListener("click", () => _abrirModal(lugar));
      labelsWrap.appendChild(el);
      return { el, anchor: anchors[i] };
    });

    /* ── Instrucción flotante ── */
    const hint = document.createElement("div");
    hint.className = "mapa-instruccion";
    hint.textContent = "📍 Haz clic en el nombre del lugar para ver la foto";
    container.appendChild(hint);

    /* ── Proyección 3D → 2D para sincronizar etiquetas ── */
    const _v = new THREE.Vector3();
    function syncLabels() {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      labelEls.forEach(({ el, anchor }) => {
        _v.setFromMatrixPosition(anchor.matrixWorld);
        _v.project(camera);
        if (_v.z > 1) { el.style.display = "none"; return; }
        const px = (_v.x *  0.5 + 0.5) * rect.width;
        const py = (_v.y * -0.5 + 0.5) * rect.height;
        el.style.display = "flex";
        el.style.left = px + "px";
        el.style.top  = py + "px";
      });
    }

    /* ── Controles de cámara esférica ── */
    let drag = false, ox = 0, oy = 0;
    let theta = 0.45, phi = 1.05, rad = 19;

    function applyCamera() {
      camera.position.x = rad * Math.sin(phi) * Math.sin(theta);
      camera.position.y = rad * Math.cos(phi);
      camera.position.z = rad * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    }
    applyCamera();

    /* Mouse */
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("mousedown", e => {
      drag = true; ox = e.clientX; oy = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
    });
    window.addEventListener("mouseup", () => {
      drag = false;
      renderer.domElement.style.cursor = "grab";
    });
    renderer.domElement.addEventListener("mousemove", e => {
      if (!drag) return;
      theta -= (e.clientX - ox) * 0.005;
      phi   -= (e.clientY - oy) * 0.005;
      phi = Math.max(0.25, Math.min(1.35, phi));
      ox = e.clientX; oy = e.clientY;
      applyCamera();
    });
    renderer.domElement.addEventListener("wheel", e => {
      rad += e.deltaY * 0.013;
      rad = Math.max(7, Math.min(35, rad));
      applyCamera();
      e.preventDefault();
    }, { passive: false });

    /* Touch */
    let td = 0;
    renderer.domElement.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        drag = true; ox = e.touches[0].clientX; oy = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        td = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY);
      }
    }, { passive: true });
    renderer.domElement.addEventListener("touchend", () => drag = false);
    renderer.domElement.addEventListener("touchmove", e => {
      if (e.touches.length === 1 && drag) {
        theta -= (e.touches[0].clientX - ox) * 0.006;
        phi   -= (e.touches[0].clientY - oy) * 0.006;
        phi = Math.max(0.25, Math.min(1.35, phi));
        ox = e.touches[0].clientX; oy = e.touches[0].clientY;
        applyCamera();
      } else if (e.touches.length === 2) {
        const nd = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                              e.touches[0].clientY - e.touches[1].clientY);
        rad -= (nd - td) * 0.05;
        rad = Math.max(7, Math.min(35, rad));
        td = nd; applyCamera();
      }
    }, { passive: true });

    /* ── Loop de animación ── */
    let animId;
    (function loop() {
      animId = requestAnimationFrame(loop);
      const t = Date.now() * 0.0018;
      anchors.forEach((m, i) => {
        m.position.y = 0.3 + Math.sin(t + i * 0.75) * 0.09;
      });
      renderer.render(scene, camera);
      syncLabels();
    })();

    mapaState = { animId };

    /* ── ResizeObserver: reajusta canvas cuando el div cambia de tamaño ── */
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const nw = e.contentRect.width;
        const nh = e.contentRect.height;
        if (nw < 10 || nh < 10) continue;
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      }
    });
    ro.observe(container);
  }

  function stopMapaGiron() {
    if (mapaState) { cancelAnimationFrame(mapaState.animId); mapaState = null; }
  }

  /* ── Modal foto ── */
  function _abrirModal(lugar) {
    const nombre = lugar.nombre.replace(/\n/g, " ");
    document.getElementById("lugar-modal-img").src            = lugar.foto;
    document.getElementById("lugar-modal-img").alt            = nombre;
    document.getElementById("lugar-modal-titulo").textContent = nombre;
    document.getElementById("lugar-modal-desc").textContent   = lugar.desc;
    document.getElementById("lugar-modal").style.display      = "flex";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const ov = document.getElementById("lugar-modal");
    if (!ov) return;
    document.getElementById("lugar-modal-close")
      .addEventListener("click", () => ov.style.display = "none");
    ov.addEventListener("click", e => { if (e.target === ov) ov.style.display = "none"; });
  });

  return { initLoginScene, stopLoginScene, initMapaGiron, stopMapaGiron };
})();
