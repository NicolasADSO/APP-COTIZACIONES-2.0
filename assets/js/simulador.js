// === BASE DE DATOS SIMULADA ===
let preciosBase = JSON.parse(localStorage.getItem("preciosBase")) || {
  equipos: { escaner: 40000, prensa: 1500000 },
  personal: { operador: 100000, encuadernador: 2500000, inspector: 2800000 },
  insumos: { carpeta: 1000, pegamento: 50000 }
};

// === MANEJO DE TABS ===
const tabs = {
  simulador: document.getElementById("tabSimulador"),
  precios: document.getElementById("tabPrecios"),
  agregar: document.getElementById("tabAgregar"),
};
const secciones = {
  simulador: document.getElementById("seccionSimulador"),
  precios: document.getElementById("seccionPrecios"),
  agregar: document.getElementById("seccionAgregar"),
};

Object.keys(tabs).forEach(tab => {
  tabs[tab].onclick = () => {
    Object.keys(tabs).forEach(t => {
      tabs[t].classList.remove("active");
      secciones[t].classList.add("hidden");
    });
    tabs[tab].classList.add("active");
    secciones[tab].classList.remove("hidden");
    if (tab === "precios") renderPrecios();
  };
});

// === FORMULARIO DE SIMULADOR ===
document.getElementById("formSimulador").addEventListener("submit", (e) => {
  e.preventDefault();
  const proceso = document.getElementById("proceso").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const tiempo = parseInt(document.getElementById("tiempo").value);
  const presupuesto = parseInt(document.getElementById("presupuesto").value) || null;
  const tabla = document.getElementById("tablaResultados");
  tabla.innerHTML = "";

  let resultados = [];
  let total = 0;

  if (proceso === "digitalizacion") {
    const capacidadNecesaria = cantidad / tiempo;
    const escaners = Math.ceil(capacidadNecesaria / 20);
    const costoEquipos = escaners * (preciosBase.equipos.escaner || 40000) * tiempo;
    const personal = 1;
    const costoPersonal = personal * (preciosBase.personal.operador || 100000) * tiempo / 30;
    const insumos = cantidad;
    const costoInsumos = insumos * (preciosBase.insumos.carpeta || 1000);

    resultados = [
      { tipo: "Equipo", recurso: "Escáner Kodak i3200", cantidad: escaners, costo: costoEquipos, just: "20 documentos/día" },
      { tipo: "Personal", recurso: "Operador", cantidad: personal, costo: costoPersonal, just: "Controla escáneres" },
      { tipo: "Insumo", recurso: "Carpeta plástica", cantidad: insumos, costo: costoInsumos, just: "1 por documento" }
    ];
  } else if (proceso === "empaste") {
    resultados = [
      { tipo: "Equipo", recurso: "Prensa térmica", cantidad: 1, costo: preciosBase.equipos.prensa || 1500000, just: "Encuadernado" },
      { tipo: "Personal", recurso: "Encuadernador", cantidad: 1, costo: preciosBase.personal.encuadernador || 2500000, just: "Mano de obra" },
      { tipo: "Insumo", recurso: "Pegamento", cantidad: 10, costo: (preciosBase.insumos.pegamento || 50000) * 10, just: "Consumo estimado" }
    ];
  } else {
    resultados = [
      { tipo: "Personal", recurso: "Inspector de calidad", cantidad: 1, costo: preciosBase.personal.inspector || 2800000, just: "Revisión final" }
    ];
  }

  resultados.forEach(r => {
    total += r.costo;
    tabla.innerHTML += `
      <tr>
        <td>${r.tipo}</td>
        <td>${r.recurso}</td>
        <td>${r.cantidad}</td>
        <td>$${r.costo.toLocaleString()}</td>
        <td>${r.just}</td>
      </tr>
    `;
  });

  document.getElementById("resultado").classList.remove("hidden");
  document.getElementById("total").textContent = `Costo total estimado: $${total.toLocaleString()}`;

  let mensaje = "Con esta configuración, el proceso podría completarse dentro del tiempo previsto.";
  if (presupuesto && total > presupuesto)
    mensaje = `⚠️ El costo supera el presupuesto ($${presupuesto.toLocaleString()}).`;
  else if (presupuesto && total < presupuesto * 0.8)
    mensaje = `✅ Está por debajo del presupuesto, se puede optimizar tiempo o aumentar recursos.`;

  document.getElementById("recomendacionFinal").textContent = mensaje;

  // === NUEVO: BOTÓN PARA GENERAR ACTA PDF ===
  const btnPDF = document.getElementById("btnPDF");
  if (btnPDF) {
    btnPDF.onclick = () => {
      generarActaLicitacionPDF(proceso, cantidad, tiempo, presupuesto, resultados);
    };
  }
});

// === TABLA EDITABLE DE PRECIOS ===
function renderPrecios() {
  const tbody = document.getElementById("tablaPrecios");
  tbody.innerHTML = "";
  for (const categoria in preciosBase) {
    for (const item in preciosBase[categoria]) {
      tbody.innerHTML += `
        <tr class="editable">
          <td>${categoria}</td>
          <td>${item}</td>
          <td><input type="number" id="${categoria}_${item}" value="${preciosBase[categoria][item]}"></td>
        </tr>
      `;
    }
  }
}

document.getElementById("guardarPrecios").onclick = () => {
  for (const categoria in preciosBase) {
    for (const item in preciosBase[categoria]) {
      const input = document.getElementById(`${categoria}_${item}`);
      preciosBase[categoria][item] = parseInt(input.value) || 0;
    }
  }
  localStorage.setItem("preciosBase", JSON.stringify(preciosBase));
  alert("✅ Precios actualizados correctamente");
};

// === FORMULARIO DE AGREGAR NUEVO RECURSO ===
document.getElementById("formAgregar").addEventListener("submit", (e) => {
  e.preventDefault();
  const categoria = document.getElementById("categoria").value;
  const nombre = document.getElementById("nombreRecurso").value.trim().toLowerCase().replace(/\s+/g, "_");
  const precio = parseInt(document.getElementById("precioRecurso").value);
  const msg = document.getElementById("mensajeAgregar");

  if (!categoria || !nombre || !precio) return;

  preciosBase[categoria][nombre] = precio;
  localStorage.setItem("preciosBase", JSON.stringify(preciosBase));

  msg.innerHTML = `✅ Recurso agregado: <b>${nombre}</b> en categoría <b>${categoria}</b>.`;
  document.getElementById("formAgregar").reset();
});
