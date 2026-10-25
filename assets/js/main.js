const CONTATO = {
  whatsapp: "https://wa.me/message/ZNQ4MEJ4PSWUA1",
  instagram: "https://www.instagram.com/zlootboxoficial/",
  email: "",
  github: "https://github.com/Emeer18"
};

const PROJETOS = {
  flashsplash: { nome: "FlashSplash", pasta: "prints/flashsplash" },
  markett: { nome: "Markett", pasta: "prints/markett", recorte: true },
  texflow: { nome: "TexFlow", pasta: "prints/texflow" }
};

const TECNOLOGIAS = [
  "Flutter", "Dart", "Java 21", "Spring Boot", "PostgreSQL", "REST API",
  "JWT", "Provider", "Maven", "Git e GitHub", "Render", "Android"
];

const EXTENSOES = ["png", "jpg", "jpeg", "webp"];
const MAX_PRINTS = 8;
const MIN_TELAS = 3;

const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function carregarImagem(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function descobrirPrints(pasta) {
  const achados = [];
  for (let i = 1; i <= MAX_PRINTS; i++) {
    const numero = String(i).padStart(2, "0");
    const resultados = await Promise.all(
      EXTENSOES.map(ext => carregarImagem(`${pasta}/${numero}.${ext}`))
    );
    const url = resultados.find(Boolean);
    if (!url) break;
    achados.push(url);
  }
  return achados;
}

function medirRazao(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(Math.min(0.75, Math.max(0.42, img.naturalWidth / img.naturalHeight)));
    img.onerror = () => resolve(0.5);
    img.src = url;
  });
}

function criarCelular(nome, url, indice, razao) {
  const celular = document.createElement("div");
  celular.className = "celular";
  celular.style.setProperty("--razao", razao);
  celular.setAttribute("role", "group");
  celular.setAttribute("aria-label", `${nome}, tela ${indice + 1}`);

  const tela = document.createElement("div");
  tela.className = "celular__tela";

  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = `Tela ${indice + 1} do ${nome}`;
    img.loading = "lazy";
    img.decoding = "async";
    tela.appendChild(img);
  } else {
    tela.innerHTML = `<div class="celular__vazio"><strong>${nome}</strong><span>print em breve</span></div>`;
  }

  celular.appendChild(tela);
  return celular;
}

function distanciaCircular(indice, ativo, total) {
  let d = indice - ativo;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

function montarPalco(elemento, telas) {
  const celulares = telas.map((tela, i) => criarCelular(tela.nome, tela.url, i, tela.razao));
  celulares.forEach(c => elemento.appendChild(c));

  const pontos = document.createElement("div");
  pontos.className = "palco__pontos";
  const botoes = telas.map((tela, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Ver tela ${i + 1}`);
    b.addEventListener("click", () => ativar(i, true));
    pontos.appendChild(b);
    return b;
  });
  elemento.appendChild(pontos);

  let ativo = Math.floor(telas.length / 2) > 0 && telas.length > 3 ? 0 : Math.min(1, telas.length - 1);
  let visivel = false;
  let pausado = false;
  let timer = null;

  function pintar() {
    celulares.forEach((celular, i) => {
      const d = distanciaCircular(i, ativo, telas.length);
      celular.dataset.d = Math.abs(d) > 2 ? "oculto" : String(Math.round(d));
    });
    botoes.forEach((b, i) => b.setAttribute("aria-current", String(i === ativo)));
  }

  function ativar(i, manual) {
    ativo = (i + telas.length) % telas.length;
    pintar();
    if (manual) reiniciar();
  }

  function reiniciar() {
    clearInterval(timer);
    if (reduzirMovimento || telas.length < 2) return;
    timer = setInterval(() => {
      if (visivel && !pausado) ativar(ativo + 1, false);
    }, 3800);
  }

  celulares.forEach((celular, i) => celular.addEventListener("click", () => ativar(i, true)));
  elemento.addEventListener("mouseenter", () => (pausado = true));
  elemento.addEventListener("mouseleave", () => (pausado = false));

  new IntersectionObserver(entradas => {
    visivel = entradas[0].isIntersecting;
  }, { threshold: 0.25 }).observe(elemento);

  pintar();
  reiniciar();
}

async function completarTelas(telas, nome) {
  const lista = await Promise.all(telas.map(async url => ({ nome, url, razao: await medirRazao(url) })));
  while (lista.length < MIN_TELAS) lista.push({ nome, url: null, razao: 0.5 });
  return lista;
}

async function iniciarPalcos() {
  const prints = {};
  await Promise.all(
    Object.entries(PROJETOS).map(async ([chave, projeto]) => {
      prints[chave] = await descobrirPrints(projeto.pasta);
    })
  );

  for (const elemento of document.querySelectorAll("[data-palco]")) {
    const chave = elemento.dataset.palco;
    if (chave === "hero") {
      const telas = await Promise.all(Object.entries(PROJETOS).map(async ([c, projeto]) => {
        const url = prints[c][0] || null;
        return { nome: projeto.nome, url, razao: url ? await medirRazao(url) : 0.5 };
      }));
      montarPalco(elemento, telas);
      continue;
    }
    const projeto = PROJETOS[chave];
    if (projeto.recorte) elemento.classList.add("palco--recorte");
    montarPalco(elemento, await completarTelas(prints[chave], projeto.nome));
  }
}

function iniciarFaixa() {
  const lista = document.getElementById("faixa");
  const itens = TECNOLOGIAS.map(t => `<li>${t}</li>`).join("");
  lista.innerHTML = itens;
  const copia = lista.cloneNode(true);
  copia.removeAttribute("id");
  copia.setAttribute("aria-hidden", "true");
  lista.parentElement.appendChild(copia);
}

function iniciarContato() {
  const area = document.getElementById("contato-acoes");
  const botoes = [];

  if (CONTATO.whatsapp) {
    const href = CONTATO.whatsapp.startsWith("http")
      ? CONTATO.whatsapp
      : `https://wa.me/${CONTATO.whatsapp.replace(/\D/g, "")}`;
    botoes.push({ texto: "WhatsApp", href, principal: true });
  }
  if (CONTATO.email) {
    botoes.push({ texto: "E-mail", href: `mailto:${CONTATO.email}`, principal: botoes.length === 0 });
  }
  if (CONTATO.instagram) {
    botoes.push({ texto: "Instagram", href: CONTATO.instagram, principal: false });
  }
  if (CONTATO.github) {
    botoes.push({ texto: "GitHub", href: CONTATO.github, principal: false });
  }

  area.innerHTML = botoes
    .map(b => `<a class="botao${b.principal ? "" : " botao--vazado"}" href="${b.href}" target="_blank" rel="noopener">${b.texto}</a>`)
    .join("");

  if (botoes.length === 0) {
    document.querySelectorAll('a[href="#contato"]').forEach(a => {
      if (a.classList.contains("botao")) a.hidden = true;
    });
    document.getElementById("contato").hidden = true;
  }
}

function iniciarReveal() {
  const itens = document.querySelectorAll(".rv");
  if (reduzirMovimento || !("IntersectionObserver" in window)) {
    itens.forEach(i => i.classList.add("visivel"));
    return;
  }
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visivel");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  itens.forEach(i => obs.observe(i));
}

function iniciarEfeitos() {
  const topo = document.getElementById("topo");
  const aoRolar = () => topo.classList.toggle("rolado", window.scrollY > 10);
  aoRolar();
  window.addEventListener("scroll", aoRolar, { passive: true });

  const fundo = document.querySelector(".fundo");
  if (!reduzirMovimento && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", e => {
      fundo.style.setProperty("--mx", `${e.clientX}px`);
      fundo.style.setProperty("--my", `${e.clientY}px`);
    }, { passive: true });
  }

  document.querySelectorAll(".cartao").forEach(cartao => {
    cartao.addEventListener("pointermove", e => {
      const r = cartao.getBoundingClientRect();
      cartao.style.setProperty("--x", `${e.clientX - r.left}px`);
      cartao.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  });
}

document.getElementById("ano").textContent = new Date().getFullYear();
iniciarFaixa();
iniciarContato();
iniciarReveal();
iniciarEfeitos();
iniciarPalcos();
