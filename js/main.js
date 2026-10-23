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
