// src/utils/cobranza.js
export const calcularEstadoCuenta = (caso, totalPagado) => {
  const hoy = new Date();
  const costoTotal = parseFloat(caso.costo_total || 0);
  const pagado = parseFloat(totalPagado || 0);
  const saldoRestante = costoTotal - pagado;

  // 1. Si ya liquidó la deuda total
  if (saldoRestante <= 0 && costoTotal > 0) {
    return { estatus: 'Liquidado', mensaje: 'Cuenta pagada en su totalidad', color: 'green', saldo: 0 };
  }

  // 2. Si aún no se presenta ante el juzgado (Estatus ID 4 en tu tabla)
  if (parseInt(caso.id_estatus) < 4) {
    return { 
      estatus: 'Preventivo', 
      mensaje: 'Esperando presentación ante juzgado para iniciar cobros', 
      color: 'grey', 
      saldo: saldoRestante 
    };
  }

  // 3. Lógica de primer mes de gracia tras presentación
  // Usamos la fecha_apertura como referencia si no tienes fecha_presentacion aún
  const inicioTramite = new Date(caso.fecha_apertura); 
  const fechaPrimerPago = new Date(inicioTramite);
  fechaPrimerPago.setMonth(inicioTramite.getMonth() + 1);

  if (hoy < fechaPrimerPago) {
    return { 
      estatus: 'Gracia', 
      mensaje: `Mes de gracia. Primer pago el: ${fechaPrimerPago.toLocaleDateString()}`, 
      color: 'blue', 
      saldo: saldoRestante 
    };
  }

  // 4. Lógica de días 1 y 16 (Cobranza activa)
  const dia = hoy.getDate();
  let mensajeCobro = '';
  
  if (dia >= 1 && dia <= 15) {
    mensajeCobro = 'Periodo de cobro: Día 1';
  } else {
    mensajeCobro = 'Periodo de cobro: Día 16';
  }

  return { 
    estatus: 'Cobranza', 
    mensaje: mensajeCobro, 
    color: 'orange darken-3', 
    saldo: saldoRestante 
  };

  
};