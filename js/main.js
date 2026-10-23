// ===== Modo oscuro =====
const raiz = document.documentElement;
const btnTema = document.getElementById("btn-tema");

function leerTema() {
  try { return localStorage.getItem("tema"); } catch (e) { return null; }
}
function aplicarTema(tema) {
  raiz.setAttribute("data-theme", tema);
  if (btnTema) btnTema.textContent = tema === "dark" ? "☀️" : "🌙";
  try { localStorage.setItem("tema", tema); } catch (e) {}
}
const prefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
aplicarTema(leerTema() || (prefiereOscuro ? "dark" : "light"));

if (btnTema) {
  btnTema.addEventListener("click", () => {
    aplicarTema(raiz.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
}

// ===== Menú en celular =====
const btnMenu = document.getElementById("btn-menu");
const menu = document.querySelector(".nav .menu");
if (btnMenu && menu) {
  btnMenu.addEventListener("click", () => menu.classList.toggle("abierto"));
}

// ===== Marcar la página actual en el menú =====
const paginaActual = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav .menu a").forEach((a) => {
  if (a.getAttribute("href") === paginaActual) a.classList.add("activo");
});

// ===== Barra de progreso y botón subir =====
const progreso = document.getElementById("progreso");
const btnSubir = document.getElementById("subir");
window.addEventListener("scroll", () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (progreso) progreso.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + "%";
  if (btnSubir) btnSubir.classList.toggle("visible", window.scrollY > 400);
});
if (btnSubir) btnSubir.addEventListener("click", () => window.scrollTo({ top: 0 }));

// ===== Animaciones al hacer scroll =====
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    const el = entrada.target;
    el.classList.add("visto");

    // Contadores animados
    el.querySelectorAll("[data-contar]").forEach((num) => {
      const meta = Number(num.dataset.contar);
      const sufijo = num.dataset.sufijo || "";
      let actual = 0;
      const paso = Math.max(1, Math.ceil(meta / 60));
      const intervalo = setInterval(() => {
        actual = Math.min(meta, actual + paso);
        num.textContent = actual.toLocaleString("es") + sufijo;
        if (actual === meta) clearInterval(intervalo);
      }, 25);
    });

    // Barras de porcentaje
    el.querySelectorAll(".barra-relleno").forEach((b) => {
      b.style.width = b.dataset.valor + "%";
    });

    observador.unobserve(el);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".revelar").forEach((el) => observador.observe(el));

// ===== Filtros de categorías (página de inventos) =====
document.querySelectorAll(".filtro").forEach((boton) => {
  boton.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach((b) => b.classList.remove("activo"));
    boton.classList.add("activo");
    const categoria = boton.dataset.filtro;
    document.querySelectorAll("[data-categoria]").forEach((item) => {
      item.classList.toggle("oculto", categoria !== "todos" && item.dataset.categoria !== categoria);
    });
  });
});

// ===== Buscador (página de personas) =====
const buscador = document.getElementById("buscador");
if (buscador) {
  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    document.querySelectorAll(".persona").forEach((p) => {
      const contenido = p.textContent.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      p.classList.toggle("oculto", !contenido.includes(texto));
    });
  });
}

// ===== Tarjetas que se voltean =====
document.querySelectorAll(".persona").forEach((p) => {
  p.addEventListener("click", () => p.classList.toggle("volteada"));
});

// ===== Quiz =====
const preguntas = [
  { p: "¿En qué año empezó oficialmente el siglo XXI?", o: ["2000", "2001", "1999", "2010"], c: 1,
    e: "El siglo XXI empezó el 1 de enero de 2001, porque no existió el año 0." },
  { p: "¿En qué año salió el primer iPhone?", o: ["2004", "2007", "2010", "2012"], c: 1,
    e: "Steve Jobs presentó el primer iPhone en enero de 2007." },
  { p: "¿Qué herramienta permite editar genes?", o: ["GPS", "Blockchain", "CRISPR", "Wi-Fi"], c: 2,
    e: "CRISPR fue desarrollada por Jennifer Doudna y Emmanuelle Charpentier (Nobel 2020)." },
  { p: "¿Cuál fue la primera criptomoneda?", o: ["Ethereum", "Bitcoin", "Dogecoin", "Litecoin"], c: 1,
    e: "Bitcoin apareció en 2009, creado por alguien con el seudónimo Satoshi Nakamoto." },
  { p: "¿Qué tecnología usaron las vacunas de Pfizer y Moderna contra el COVID?", o: ["ARN mensajero", "Rayos X", "Clonación", "Nanotubos"], c: 0,
    e: "Los estudios de Katalin Karikó y Drew Weissman sobre el ARN mensajero lo hicieron posible." },
  { p: "¿Qué empresa fabrica los chips más usados para la inteligencia artificial?", o: ["Samsung", "NVIDIA", "Nokia", "Sony"], c: 1,
    e: "NVIDIA, fundada por Jensen Huang, fabrica las GPU que entrenan la mayoría de las IA." },
  { p: "¿Qué acuerdo de 2015 busca frenar el cambio climático?", o: ["Acuerdo de Kioto", "Acuerdo de París", "Tratado de Roma", "Pacto de Lima"], c: 1,
    e: "En el Acuerdo de París casi todos los países se comprometieron a reducir sus emisiones." },
  { p: "¿Cómo se llama el programa de la NASA para volver a la Luna?", o: ["Apollo", "Géminis", "Artemis", "Voyager"], c: 2,
    e: "Artemis busca llevar de nuevo astronautas a la Luna, incluyendo a la primera mujer." },
];

const zonaQuiz = document.getElementById("quiz");
if (zonaQuiz) {
  let indice = 0;
  let puntos = 0;

  function mostrarPregunta() {
    const q = preguntas[indice];
    zonaQuiz.innerHTML = `
      <div class="tarjeta">
        <div class="quiz-progreso">Pregunta ${indice + 1} de ${preguntas.length} · Puntos: ${puntos}</div>
        <h3>${q.p}</h3>
        <div class="opciones">
          ${q.o.map((op, i) => `<button class="opcion" data-i="${i}">${op}</button>`).join("")}
        </div>
        <p class="explicacion"></p>
        <button class="boton oculto" id="siguiente">${indice < preguntas.length - 1 ? "Siguiente →" : "Ver resultado"}</button>
      </div>`;

    zonaQuiz.querySelectorAll(".opcion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const elegida = Number(btn.dataset.i);
        zonaQuiz.querySelectorAll(".opcion").forEach((b) => {
          b.disabled = true;
          if (Number(b.dataset.i) === q.c) b.classList.add("correcta");
        });
        if (elegida === q.c) {
          puntos++;
          zonaQuiz.querySelector(".explicacion").textContent = "✅ ¡Correcto! " + q.e;
        } else {
          btn.classList.add("incorrecta");
          zonaQuiz.querySelector(".explicacion").textContent = "❌ Incorrecto. " + q.e;
        }
        zonaQuiz.querySelector("#siguiente").classList.remove("oculto");
      });
    });

    zonaQuiz.querySelector("#siguiente").addEventListener("click", () => {
      indice++;
      indice < preguntas.length ? mostrarPregunta() : mostrarResultado();
    });
  }

  function mostrarResultado() {
    const porcentaje = Math.round((puntos / preguntas.length) * 100);
    let mensaje = "¡Sigue aprendiendo! Revisa las otras secciones y vuelve a intentarlo.";
    if (porcentaje >= 80) mensaje = "¡Excelente! Eres un experto del siglo XXI 🚀";
    else if (porcentaje >= 50) mensaje = "¡Muy bien! Sabes bastante del siglo XXI 👏";
    zonaQuiz.innerHTML = `
      <div class="tarjeta resultado">
        <p>Tu resultado</p>
        <div class="numero">${puntos}/${preguntas.length}</div>
        <p>${mensaje}</p>
        <button class="boton" id="reiniciar">Intentar de nuevo</button>
      </div>`;
    zonaQuiz.querySelector("#reiniciar").addEventListener("click", () => {
      indice = 0; puntos = 0; mostrarPregunta();
    });
  }

  mostrarPregunta();
}
