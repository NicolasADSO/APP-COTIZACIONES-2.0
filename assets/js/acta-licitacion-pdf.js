// assets/js/acta-licitacion-pdf.js
// Generador de Acta PDF basada en resultados del simulador de licitación
// Requiere jsPDF y jsPDF-AutoTable

function generarActaLicitacionPDF(proceso, cantidad, tiempo, presupuesto, resultados) {
  console.log("📄 Generando Acta de Licitación...");

  const jsPDFLib = window.jspdf || window.jsPDF;
  const jsPDF = jsPDFLib?.jsPDF || jsPDFLib;
  if (!jsPDF) {
    alert("Error: jsPDF no está cargado correctamente.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 20;

  // === ENCABEZADO CON LOGO ===
  //const logo = new Image();
  //logo.src = "assets/img/logo-sin-fondo.png"; // ajusta ruta si es necesario
  //doc.addImage(logo, "PNG", 20, 10, 25, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ACTA DE LICITACIÓN SIMULADA", 105, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Sistema BlaaFlow - Biblioteca Luis Ángel Arango", 105, 26, { align: "center" });

  doc.line(20, 32, 190, 32);

  // === DATOS DEL REQUERIMIENTO ===
  y = 40;
  doc.setFont("helvetica", "bold");
  doc.text("Datos del requerimiento:", 20, y);
  doc.setFont("helvetica", "normal");
  y += 7;
  doc.text(`Proceso solicitado: ${proceso.toUpperCase()}`, 20, y);
  y += 6;
  doc.text(`Cantidad estimada: ${cantidad.toLocaleString()} unidades`, 20, y);
  y += 6;
  doc.text(`Tiempo disponible: ${tiempo} días`, 20, y);
  y += 6;
  if (presupuesto) doc.text(`Presupuesto máximo: $${presupuesto.toLocaleString()}`, 20, y);

  // === TABLA AUTO ===
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Recursos sugeridos:", 20, y);
  y += 4;

  const tableData = resultados.map(r => [
    r.tipo,
    r.recurso,
    r.cantidad,
    `$${r.costo.toLocaleString()}`,
    r.just
  ]);

  doc.autoTable({
    startY: y,
    head: [["Tipo", "Recurso", "Cantidad", "Costo estimado", "Justificación"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [153, 15, 12], halign: "center" },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 45 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 55 }
    }
  });

  let finalY = doc.lastAutoTable.finalY + 5;

  const total = resultados.reduce((acc, r) => acc + r.costo, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Costo total estimado: $${total.toLocaleString()}`, 20, finalY);

  // === CONCLUSIÓN ===
  finalY += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  let msg = "El presente acta refleja la simulación del proceso solicitado con base en los recursos disponibles y los precios base definidos.";
  if (presupuesto && total > presupuesto)
    msg += " El costo supera el presupuesto, por lo que se recomienda ajustar los recursos o ampliar el tiempo estimado.";
  else if (presupuesto && total < presupuesto * 0.8)
    msg += " El costo está por debajo del presupuesto, lo que permite optimizar tiempos o agregar recursos adicionales.";

  doc.text(doc.splitTextToSize(msg, 170), 20, finalY);

  // === BLOQUE DE FIRMAS ===
  finalY += 30;
  doc.line(40, finalY, 90, finalY);
  doc.line(120, finalY, 170, finalY);
  finalY += 5;
  doc.setFontSize(9);
  doc.text("Responsable Técnico", 65, finalY, { align: "center" });
  doc.text("Responsable Administrativo", 145, finalY, { align: "center" });

  // === PIE DE PÁGINA ===
  doc.setFontSize(8);
  doc.text("Generado automáticamente por BlaaFlow © " + new Date().getFullYear(), 105, 285, { align: "center" });

  doc.save(`Acta_Licitacion_${proceso}_${new Date().toISOString().slice(0,10)}.pdf`);
}
