// Función para graficar el ciclo de Carnot
function graficarCarnot(n, R, Th, Tc, V1, V2, V3) {
  // Convertir a m^3
  const V1m3 = V1 * 1e-3;
  const V2m3 = V2 * 1e-3;
  const V3m3 = V3 * 1e-3;

  // Proceso 1-2: Isotérmica a Th
  let V_12 = [],
    P_12 = [];
  for (let V = V1m3; V <= V2m3; V += (V2m3 - V1m3) / 50) {
    V_12.push(V);
    P_12.push((n * R * Th) / V);
  }

  // Proceso 2-3: Adiabática (PV^γ = const)
  const gamma = 5 / 3; // para un gas monoatómico
  const P2 = (n * R * Th) / V2m3;
  const C = P2 * Math.pow(V2m3, gamma);
  let V_23 = [],
    P_23 = [];
  for (let V = V2m3; V <= V3m3; V += (V3m3 - V2m3) / 50) {
    V_23.push(V);
    P_23.push(C / Math.pow(V, gamma));
  }

  // Proceso 3-4: Isotérmica a Tc
  let V_34 = [],
    P_34 = [];
  for (let V = V3m3; V >= V2m3; V -= (V3m3 - V2m3) / 50) {
    V_34.push(V);
    P_34.push((n * R * Tc) / V);
  }

  // Proceso 4-1: Adiabática
  const P3 = (n * R * Tc) / V3m3;
  const C2 = P3 * Math.pow(V3m3, gamma);
  let V_41 = [],
    P_41 = [];
  for (let V = V3m3; V >= V1m3; V -= (V3m3 - V1m3) / 50) {
    V_41.push(V);
    P_41.push(C2 / Math.pow(V, gamma));
  }

  // Unir los puntos para el ciclo cerrado
  const V_total = V_12.concat(V_23, V_34, V_41, [V1m3]);
  const P_total = P_12.concat(P_23, P_34, P_41, [P_12[0]]);

  const trace = {
    x: V_total.map((v) => v * 1000), // convertir a litros para la gráfica
    y: P_total,
    mode: "lines+markers",
    name: "Ciclo de Carnot",
    line: { shape: "spline" },
  };

  const layout = {
    xaxis: { title: "Volumen (L)" },
    yaxis: { title: "Presión (Pa)" },
    title: "Ciclo de Carnot: P vs V",
    showlegend: false,
  };

  Plotly.newPlot("grafica", [trace], layout);
}

// Calcular y mostrar resultados numéricos
function calcularResultadosCarnot() {
  const n = simParams.n;
  const R = simParams.R;
  const Th = simParams.Th;
  const Tc = simParams.Tc;
  const V1 = simParams.V1;
  const V2 = simParams.V2;
  const V3 = simParams.V3;
  const gamma = 5 / 3;

  // Presiones en cada punto
  const P1 = (n * R * Th) / (V1 * 1e-3);
  const P2 = (n * R * Th) / (V2 * 1e-3);
  const P3 = (n * R * Tc) / (V3 * 1e-3);
  const P4 = (n * R * Tc) / (V2 * 1e-3);

  // Trabajo en cada proceso
  const W12 = n * R * Th * Math.log(V2 / V1); // isotérmica
  const W23 = (P3 * V3 * 1e-3 - P2 * V2 * 1e-3) / (gamma - 1); // adiabática
  const W34 = n * R * Tc * Math.log(V2 / V3); // isotérmica (compresión)
  const W41 = (P1 * V1 * 1e-3 - P4 * V2 * 1e-3) / (gamma - 1); // adiabática
  const Wneto = W12 + W23 + W34 + W41;

  // Calor suministrado
  const Qin = W12;

  // Calor expulsado
  const Qout = n * R * Tc * Math.log(V3 / V2);

  // Cambio de entropía durante la expulsión de calor
  const deltaS_out = Qout / Tc;

  // Rendimiento térmico
  const eta = 1 - Tc / Th;

  // Mostrar resultados
  document.getElementById("resultados-carnot").innerHTML = `
    <div style="line-height:1.5;">
      <b>Trabajo neto:</b> <span style='float:right;'>${Wneto.toFixed(
        2
      )} J</span><br>
      <b>Q<sub>in</sub> suministrado:</b> <span style='float:right;'>${Qin.toFixed(
        2
      )} J</span><br>
      <b>Q<sub>out</sub> expulsado:</b> <span style='float:right;'>${Qout.toFixed(
        2
      )} J</span><br>
      <b>ΔS<sub>out</sub>:</b> <span style='float:right;'>${deltaS_out.toFixed(
        4
      )} J/K</span><br>
      <b>Rendimiento η:</b> <span style='float:right;'>${(eta * 100).toFixed(
        2
      )} %</span>
      <hr style='margin:7px 0;'>
      <span style='font-size:0.93em;'><b>W₁₂:</b> ${W12.toFixed(
        2
      )} J &nbsp; <b>W₂₃:</b> ${W23.toFixed(2)} J<br><b>W₃₄:</b> ${W34.toFixed(
    2
  )} J &nbsp; <b>W₄₁:</b> ${W41.toFixed(2)} J</span>
    </div>
  `;
  if (window.MathJax) MathJax.typesetPromise();
}

document.getElementById("carnotForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Validar antes de graficar
  const n = parseFloat(document.getElementById("n").value);
  const R = parseFloat(document.getElementById("R").value);
  const Th = parseFloat(document.getElementById("Th").value);
  const Tc = parseFloat(document.getElementById("Tc").value);
  const V1 = parseFloat(document.getElementById("V1").value);
  const V2 = parseFloat(document.getElementById("V2").value);
  const V3 = parseFloat(document.getElementById("V3").value);

  const errores = validarEntrada(n, R, Th, Tc, V1, V2, V3);
  if (errores.length > 0) {
    mostrarErrores(errores);
    return;
  }

  graficarCarnot(n, R, Th, Tc, V1, V2, V3);
});

// --- Simulación del pistón y partículas ---
const canvas = document.getElementById("simulacionPiston");
const ctx = canvas.getContext("2d");
let simParams = {
  n: 1,
  R: 8.314,
  Th: 500,
  Tc: 300,
  V1: 1,
  V2: 2,
  V3: 4,
};
const etapas = [
  {
    nombre: "Expansión isotérmica",
    color: "red",
    T: "Th",
    Vini: "V1",
    Vfin: "V2",
    placa: "caliente",
    descripcion: "El gas se expande absorbiendo calor",
  },
  {
    nombre: "Expansión adiabática",
    color: "orange",
    T: "desc",
    Vini: "V2",
    Vfin: "V3",
    placa: "ninguna",
    descripcion: "El gas se expande sin intercambio de calor",
  },
  {
    nombre: "Compresión isotérmica",
    color: "blue",
    T: "Tc",
    Vini: "V3",
    Vfin: "V2",
    placa: "fria",
    descripcion: "El gas se comprime expulsando calor",
  },
  {
    nombre: "Compresión adiabática",
    color: "cyan",
    T: "asc",
    Vini: "V2",
    Vfin: "V1",
    placa: "ninguna",
    descripcion: "El gas se comprime sin intercambio de calor",
  },
];
let etapaActual = 0;
let tEtapa = 0;
const duracionEtapa = 240; // Aumentar duración para mejor visualización
const numParticulas = 35; // Más partículas para mejor efecto
let particulas = [];
let animacionPausada = false;

function resetParticulas(temp, volumen) {
  particulas = [];
  const area = getPistonArea(volumen);
  for (let i = 0; i < numParticulas; i++) {
    particulas.push({
      x: area.x + 10 + Math.random() * (area.w - 20),
      y: area.y + 10 + Math.random() * (area.h - 20),
      vx: (Math.random() - 0.5) * Math.sqrt(temp) * 0.8,
      vy: (Math.random() - 0.5) * Math.sqrt(temp) * 0.8,
      radio: 4 + Math.random() * 3, // Partículas de diferentes tamaños
    });
  }
}

function getPistonArea(volumen) {
  const minW = 80,
    maxW = 320;
  const minV = simParams.V1,
    maxV = simParams.V3;
  let wRaw = minW + ((maxW - minW) * (volumen - minV)) / (maxV - minV);
  const w = Math.max(minW, Math.min(maxW, wRaw));
  return { x: 100, y: 50, w: w, h: 200 };
}

function getTemp(etapa, t) {
  if (etapa.T === "Th") return simParams.Th;
  if (etapa.T === "Tc") return simParams.Tc;
  if (etapa.T === "desc") {
    return simParams.Th - (simParams.Th - simParams.Tc) * (t / duracionEtapa);
  }
  if (etapa.T === "asc") {
    return simParams.Tc + (simParams.Th - simParams.Tc) * (t / duracionEtapa);
  }
  return simParams.Th;
}

function getVol(etapa, t) {
  const Vini = simParams[etapa.Vini];
  const Vfin = simParams[etapa.Vfin];
  return Vini + (Vfin - Vini) * (t / duracionEtapa);
}

function drawPiston(volumen, temp, etapa) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fondo con gradiente
  let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#e0e7ef");
  grad.addColorStop(1, "#b3c6e0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const area = getPistonArea(volumen);

  // Dibujar cilindro con sombra
  ctx.save();
  ctx.shadowColor = "#8888";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = "#b0b0b0";
  ctx.lineWidth = 7;
  ctx.strokeRect(area.x, area.y, area.w, area.h);
  ctx.restore();

  // Gradiente del cilindro
  let gradCil = ctx.createLinearGradient(
    area.x,
    area.y,
    area.x + area.w,
    area.y + area.h
  );
  gradCil.addColorStop(0, "#e0e0e0");
  gradCil.addColorStop(0.5, "#b0b0b0");
  gradCil.addColorStop(1, "#e0e0e0");
  ctx.fillStyle = gradCil;
  ctx.fillRect(area.x, area.y, area.w, area.h);

  // Placa caliente (izquierda)
  if (etapa.placa === "caliente") {
    let gradHot = ctx.createLinearGradient(80, 40, 100, 260);
    gradHot.addColorStop(0, "#ff5e62");
    gradHot.addColorStop(1, "#ff9966");
    ctx.save();
    ctx.shadowColor = "#ff996688";
    ctx.shadowBlur = 16;
    ctx.fillStyle = gradHot;
    ctx.fillRect(80, 40, 20, 220);
    ctx.restore();

    // Termómetro en la placa caliente
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.fillRect(85, 230, 10, 20);
    ctx.fillStyle = "#ff5e62";
    ctx.fillRect(85, 230 + 20 - 16, 10, 16);
    ctx.beginPath();
    ctx.arc(90, 250, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff5e62";
    ctx.fill();
    ctx.restore();
  }

  // Placa fría (derecha)
  if (etapa.placa === "fria") {
    let gradCold = ctx.createLinearGradient(
      area.x + area.w,
      area.y - 10,
      area.x + area.w + 20,
      area.y + area.h + 10
    );
    gradCold.addColorStop(0, "#36d1c4");
    gradCold.addColorStop(1, "#1e90ff");
    ctx.save();
    ctx.shadowColor = "#1e90ff88";
    ctx.shadowBlur = 16;
    ctx.fillStyle = gradCold;
    ctx.fillRect(area.x + area.w, area.y - 10, 20, area.h + 20);
    ctx.restore();

    // Termómetro en la placa fría
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.fillRect(area.x + area.w + 5, area.y + area.h - 40, 10, 20);
    ctx.fillStyle = "#1e90ff";
    ctx.fillRect(area.x + area.w + 5, area.y + area.h - 24, 10, 16);
    ctx.beginPath();
    ctx.arc(area.x + area.w + 10, area.y + area.h - 4, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#1e90ff";
    ctx.fill();
    ctx.restore();
  }

  // Pistón con gradiente y sombra
  ctx.save();
  ctx.shadowColor = "#8888";
  ctx.shadowBlur = 12;
  let gradPiston = ctx.createLinearGradient(
    area.x + area.w - 10,
    area.y,
    area.x + area.w,
    area.y + area.h
  );
  gradPiston.addColorStop(0, "#b0b0b0");
  gradPiston.addColorStop(1, "#e0e0e0");
  ctx.fillStyle = gradPiston;
  ctx.fillRect(area.x + area.w - 10, area.y, 10, area.h);
  ctx.restore();

  // Dibujar partículas con colores según temperatura
  for (let p of particulas) {
    ctx.save();
    let tNorm = Math.max(
      0,
      Math.min(1, (temp - simParams.Tc) / (simParams.Th - simParams.Tc + 1e-6))
    );
    let color = `rgb(${Math.round(100 + 155 * tNorm)},${Math.round(
      100 + 80 * (1 - tNorm)
    )},${Math.round(200 - 100 * tNorm)})`;
    ctx.shadowColor = "#0005";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radio, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // Flechas de flujo de calor animadas
  if (etapa.placa === "caliente" || etapa.placa === "fria") {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = etapa.placa === "caliente" ? "#ff5e62" : "#1e90ff";
    ctx.lineWidth = 5;
    let arrowX, arrowY, dir;
    if (etapa.placa === "caliente") {
      arrowX = 100;
      arrowY = 150;
      dir = 1;
    } else {
      arrowX = area.x + area.w + 10;
      arrowY = area.y + area.h / 2;
      dir = -1;
    }
    let t = Date.now() / 500;
    let offset = Math.sin(t) * 10;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY - 30 + offset);
    ctx.lineTo(arrowX, arrowY + 30 + offset);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(arrowX - 7 * dir, arrowY + 25 + offset);
    ctx.lineTo(arrowX, arrowY + 30 + offset);
    ctx.lineTo(arrowX + 7 * dir, arrowY + 25 + offset);
    ctx.fillStyle = etapa.placa === "caliente" ? "#ff5e62" : "#1e90ff";
    ctx.fill();
    ctx.restore();
  }

  // Etiqueta de etapa con mejor diseño
  let etapaClass = "etapa-box";
  if (etapa.placa === "fria") etapaClass += " etapa-azul";
  if (etapa.color === "orange") etapaClass += " etapa-naranja";
  if (etapa.color === "cyan") etapaClass += " etapa-cyan";

  ctx.save();
  ctx.font = "bold 18px Arial";
  let boxW = ctx.measureText(etapa.nombre).width + 40;
  ctx.globalAlpha = 0.9;
  ctx.fillStyle =
    etapa.placa === "caliente"
      ? "#ff5e62"
      : etapa.placa === "fria"
      ? "#1e90ff"
      : etapa.color === "orange"
      ? "#ffb347"
      : "#43e97b";
  ctx.fillRect(canvas.width - boxW - 30, 18, boxW, 34);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff";
  ctx.fillText(etapa.nombre, canvas.width - boxW - 10, 42);
  ctx.restore();

  // Badges de temperatura y volumen mejorados
  ctx.save();
  ctx.font = "bold 16px Arial";

  // Badge de temperatura
  ctx.fillStyle = "#ff5e62";
  ctx.fillRect(18, 18, 90, 28);
  ctx.fillStyle = "#fff";
  ctx.fillText("T = " + temp.toFixed(0) + " K", 28, 38);

  // Badge de volumen
  ctx.fillStyle = "#1e90ff";
  ctx.fillRect(18, 52, 110, 28);
  ctx.fillStyle = "#fff";
  ctx.fillText("V = " + volumen.toFixed(2) + " L", 28, 72);

  // Badge de etapa actual
  ctx.fillStyle = "#333";
  ctx.fillRect(18, 86, 140, 28);
  ctx.fillStyle = "#fff";
  ctx.fillText("Etapa " + (etapaActual + 1) + "/4", 28, 106);

  ctx.restore();

  // Indicador de progreso de la etapa
  ctx.save();
  ctx.fillStyle = "#333";
  ctx.fillRect(18, 120, 140, 8);
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(18, 120, (140 * tEtapa) / duracionEtapa, 8);
  ctx.restore();
}

function updateParticulas(temp, volumen) {
  const area = getPistonArea(volumen);
  for (let p of particulas) {
    p.x += p.vx;
    p.y += p.vy;

    // Colisión con paredes del cilindro
    if (p.x < area.x + p.radio) {
      p.x = area.x + p.radio;
      p.vx *= -1;
    }
    if (p.x > area.x + area.w - p.radio) {
      p.x = area.x + area.w - p.radio;
      p.vx *= -1;
    }
    if (p.y < area.y + p.radio) {
      p.y = area.y + p.radio;
      p.vy *= -1;
    }
    if (p.y > area.y + area.h - p.radio) {
      p.y = area.y + area.h - p.radio;
      p.vy *= -1;
    }

    // Ajustar velocidad según temperatura
    p.vx += (Math.random() - 0.5) * 0.1 * Math.sqrt(temp) * 0.01;
    p.vy += (Math.random() - 0.5) * 0.1 * Math.sqrt(temp) * 0.01;
    const vMax = Math.sqrt(temp) * 0.8;
    p.vx = Math.max(Math.min(p.vx, vMax), -vMax);
    p.vy = Math.max(Math.min(p.vy, vMax), -vMax);
  }
}

function cicloAnimacion() {
  if (!animacionPausada) {
    const etapa = etapas[etapaActual];
    const temp = getTemp(etapa, tEtapa);
    const volumen = getVol(etapa, tEtapa);

    if (tEtapa === 0) resetParticulas(temp, volumen);
    updateParticulas(temp, volumen);
    drawPiston(volumen, temp, etapa);

    tEtapa++;
    if (tEtapa > duracionEtapa) {
      etapaActual = (etapaActual + 1) % etapas.length;
      tEtapa = 0;
    }
  }
  requestAnimationFrame(cicloAnimacion);
}

// Iniciar animación
cicloAnimacion();

// Controles de animación
function pausarAnimacion() {
  animacionPausada = !animacionPausada;
  const btnPausar = document.querySelector(
    'button[onclick="pausarAnimacion()"]'
  );
  if (animacionPausada) {
    btnPausar.innerHTML = "▶️ Reanudar";
    btnPausar.style.background = "linear-gradient(90deg, #4CAF50, #45a049)";
  } else {
    btnPausar.innerHTML = "⏸️ Pausar";
    btnPausar.style.background = "linear-gradient(90deg, #ff5e62, #ff9966)";
  }
}

function reiniciarAnimacion() {
  etapaActual = 0;
  tEtapa = 0;
  animacionPausada = false;

  // Restaurar texto del botón de pausar
  const btnPausar = document.querySelector(
    'button[onclick="pausarAnimacion()"]'
  );
  btnPausar.innerHTML = "⏸️ Pausar";
  btnPausar.style.background = "linear-gradient(90deg, #ff5e62, #ff9966)";
}

function actualizarSimParams() {
  simParams.n = parseFloat(document.getElementById("n").value);
  simParams.R = parseFloat(document.getElementById("R").value);
  simParams.Th = parseFloat(document.getElementById("Th").value);
  simParams.Tc = parseFloat(document.getElementById("Tc").value);
  simParams.V1 = parseFloat(document.getElementById("V1").value);
  simParams.V2 = parseFloat(document.getElementById("V2").value);
  simParams.V3 = parseFloat(document.getElementById("V3").value);
  calcularResultadosCarnot();
}

// --- Validación de valores de entrada ---
function validarEntrada(n, R, Th, Tc, V1, V2, V3) {
  const errores = [];

  // Validar que todos los valores sean positivos
  if (n <= 0) errores.push("n (moles) debe ser mayor que 0");
  if (R <= 0) errores.push("R debe ser mayor que 0");
  if (Th <= 0) errores.push("T<sub>h</sub> debe ser mayor que 0");
  if (Tc <= 0) errores.push("T<sub>c</sub> debe ser mayor que 0");
  if (V1 <= 0) errores.push("V<sub>1</sub> debe ser mayor que 0");
  if (V2 <= 0) errores.push("V<sub>2</sub> debe ser mayor que 0");
  if (V3 <= 0) errores.push("V<sub>3</sub> debe ser mayor que 0");

  // Validar temperaturas
  if (Th <= Tc) errores.push("T<sub>h</sub> debe ser mayor que T<sub>c</sub>");

  // Validar volúmenes (orden del ciclo de Carnot)
  if (V1 >= V2) errores.push("V<sub>1</sub> debe ser menor que V<sub>2</sub>");
  if (V2 >= V3) errores.push("V<sub>2</sub> debe ser menor que V<sub>3</sub>");

  // Validar valores extremos
  if (Th > 10000) errores.push("T<sub>h</sub> es demasiado alta (> 10000 K)");
  if (Tc < 1) errores.push("T<sub>c</sub> es demasiado baja (< 1 K)");
  if (V3 > 1000) errores.push("V<sub>3</sub> es demasiado grande (> 1000 L)");
  if (V1 < 0.01) errores.push("V<sub>1</sub> es demasiado pequeño (< 0.01 L)");

  return errores;
}

function mostrarErrores(errores) {
  const btnGraficar = document.querySelector(".form-btn-row button");
  const errorDiv = document.getElementById("error-mensajes") || crearErrorDiv();

  if (errores.length > 0) {
    btnGraficar.disabled = true;
    btnGraficar.style.opacity = "0.5";
    btnGraficar.style.cursor = "not-allowed";
    errorDiv.innerHTML =
      '<div style="color: #d32f2f; background: #ffebee; border: 1px solid #f44336; border-radius: 8px; padding: 12px; margin-top: 12px; font-size: 0.95em;"><strong>Errores de validación:</strong><ul style="margin: 8px 0 0 0; padding-left: 20px;">' +
      errores.map((error) => "<li>" + error + "</li>").join("") +
      "</ul></div>";
    errorDiv.style.display = "block";
  } else {
    btnGraficar.disabled = false;
    btnGraficar.style.opacity = "1";
    btnGraficar.style.cursor = "pointer";
    errorDiv.style.display = "none";
  }
}

function crearErrorDiv() {
  const errorDiv = document.createElement("div");
  errorDiv.id = "error-mensajes";
  errorDiv.style.display = "none";
  document.querySelector(".form-btn-row").appendChild(errorDiv);
  return errorDiv;
}

function validarYActualizar() {
  const n = parseFloat(document.getElementById("n").value) || 0;
  const R = parseFloat(document.getElementById("R").value) || 0;
  const Th = parseFloat(document.getElementById("Th").value) || 0;
  const Tc = parseFloat(document.getElementById("Tc").value) || 0;
  const V1 = parseFloat(document.getElementById("V1").value) || 0;
  const V2 = parseFloat(document.getElementById("V2").value) || 0;
  const V3 = parseFloat(document.getElementById("V3").value) || 0;

  const errores = validarEntrada(n, R, Th, Tc, V1, V2, V3);
  mostrarErrores(errores);

  // Solo actualizar simulación si no hay errores
  if (errores.length === 0) {
    actualizarSimParams();
  }
}

// Inicializar con valores por defecto
graficarCarnot(1, 8.314, 500, 300, 1, 2, 4);

// Validar valores iniciales
validarYActualizar();

// Calcular resultados iniciales
calcularResultadosCarnot();

// Event listener para actualización en tiempo real
document
  .getElementById("carnotForm")
  .addEventListener("input", validarYActualizar);
