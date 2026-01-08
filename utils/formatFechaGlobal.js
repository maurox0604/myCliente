/**
 * Utils para manejo de fechas en React Native
 * Manejo de fechas del picker y fechas actuales automáticas
 */

// ============================================
// FUNCIONES PARA FECHAS DEL CLIENTE (DISPOSITIVO)
// ============================================

/**
 * Obtiene la fecha y hora actual del dispositivo
 * @returns {string} Formato: YYYY-MM-DD HH:MM:SS
 */
export const getCurrentLocalDateTime = () => {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Obtiene solo la fecha actual (sin hora) del dispositivo
 * @returns {string} Formato: YYYY-MM-DD
 */
export const getCurrentLocalDate = () => {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// ============================================
// FUNCIONES PARA FECHA DE VENTA (PICKER O ACTUAL)
// ============================================

/**
 * Maneja la fecha de venta: si es null usa fecha actual, si es Date la formatea
 * @param {Date|null} fechaVenta - Fecha del picker o null
 * @param {boolean} includeTime - Incluir hora o solo fecha
 * @returns {string} Fecha formateada para MySQL
 */
export const formatFechaVenta = (fechaVenta, includeTime = true) => {
  let dateObj;
  
  // Si es null o undefined, usar fecha actual
  if (!fechaVenta) {
    dateObj = new Date();
  } 
  // Si ya es objeto Date
  else if (fechaVenta instanceof Date) {
    dateObj = fechaVenta;
  }
  // Si es string (del picker)
  else if (typeof fechaVenta === 'string') {
    dateObj = new Date(fechaVenta);
    // Validar que sea fecha válida
    if (isNaN(dateObj.getTime())) {
      console.warn('Fecha inválida, usando fecha actual');
      dateObj = new Date();
    }
  }
  // Si es número (timestamp)
  else if (typeof fechaVenta === 'number') {
    dateObj = new Date(fechaVenta);
  }
  // Caso inesperado
  else {
    console.warn('Tipo de fecha no reconocido, usando fecha actual');
    dateObj = new Date();
  }
  
  // Formatear fecha
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  if (!includeTime) {
    return `${year}-${month}-${day}`;
  }
  
  // Formatear hora
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Convierte fecha del picker a formato para mostrar (ej: "15/01/2024")
 * @param {Date|string|null} fechaVenta 
 * @param {string} format - 'short' (15/01/24), 'long' (15 Enero 2024)
 * @returns {string} Fecha formateada para mostrar
 */
export const formatFechaVentaForDisplay = (fechaVenta, format = 'short') => {
  let dateObj;
  
  if (!fechaVenta) {
    dateObj = new Date();
  } else if (fechaVenta instanceof Date) {
    dateObj = fechaVenta;
  } else {
    dateObj = new Date(fechaVenta);
  }
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Formato corto por defecto (DD/MM/YYYY)
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// ============================================
// FUNCIONES PARA FECHAS DEL SERVIDOR (RECIBIR)
// ============================================

/**
 * Convierte fecha ISO del servidor a hora local para mostrar
 * @param {string} serverDate - Fecha en formato ISO/UTC
 * @returns {string} Fecha local formateada
 */
export const formatServerDateToLocal = (serverDate) => {
  if (!serverDate) return '';
  
  const date = new Date(serverDate);
  
  // Ajustar por zona horaria local
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Formatea fecha del servidor para mostrar de manera amigable
 * @param {string} serverDate 
 * @returns {string} Fecha amigable (ej: "Hoy, 14:30" o "15 Ene 2024")
 */
export const formatServerDateForDisplay = (serverDate, showDate = false) => {
  if (!serverDate) return '';
  
  // Extraer componentes directamente del string ISO
  const date = new Date(serverDate);
  
  // Usar UTC para evitar cambios de zona horaria
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  
  // Convertir a formato 12h
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 se convierte en 12
  
  // Formatear hora
  const timeStr = `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
  
  // Si solo se necesita la hora
  if (!showDate) {
    return timeStr;
  }
  
  // Si también se necesita la fecha
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 
                     'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const monthName = monthNames[month];
  
  return `${day} ${monthName} ${year}, ${timeStr}`;
};
// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Valida si una fecha es válida
 * @param {any} fecha 
 * @returns {boolean}
 */
export const isValidDate = (fecha) => {
  if (!fecha) return false;
  
  const date = new Date(fecha);
  return !isNaN(date.getTime());
};

/**
 * Valida si una fecha es futura (no puede vender en el futuro)
 * @param {Date|string} fechaVenta 
 * @returns {boolean} true si es fecha futura
 */
export const isFutureDate = (fechaVenta) => {
  if (!fechaVenta) return false;
  
  const date = new Date(fechaVenta);
  const now = new Date();
  
  return date > now;
};

/**
 * Valida si una fecha es muy antigua (ej: más de 1 año)
 * @param {Date|string} fechaVenta 
 * @param {number} maxYears - Máximo años atrás permitidos
 * @returns {boolean} true si es muy antigua
 */
export const isTooOldDate = (fechaVenta, maxYears = 1) => {
  if (!fechaVenta) return false;
  
  const date = new Date(fechaVenta);
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - maxYears, now.getMonth(), now.getDate());
  
  return date < oneYearAgo;
};

// ============================================
// FUNCIONES PARA PICKER
// ============================================

/**
 * Formatea fecha para el picker (DateTimePicker necesita Date object)
 * @param {string|Date|null} fechaString 
 * @returns {Date} Objeto Date para el picker
 */
export const getDateForPicker = (fechaString) => {
  if (!fechaString) return new Date();
  
  if (fechaString instanceof Date) return fechaString;
  
  const date = new Date(fechaString);
  return isNaN(date.getTime()) ? new Date() : date;
};

/**
 * Crea un objeto con fecha y hora por separado para controles independientes
 * @param {Date|string|null} fecha 
 * @returns {{date: string, time: string}} Objeto con fecha y hora separados
 */
export const splitDateTime = (fecha) => {
  const dateObj = fecha ? new Date(fecha) : new Date();
  
  return {
    date: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
    time: `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
  };
};

/**
 * Combina fecha y hora separadas en un solo string
 * @param {string} dateStr - Formato YYYY-MM-DD
 * @param {string} timeStr - Formato HH:MM
 * @returns {string} Fecha completa YYYY-MM-DD HH:MM:00
 */
export const combineDateTime = (dateStr, timeStr) => {
  return `${dateStr} ${timeStr}:00`;
};

export default {
  // Fechas actuales
  getCurrentLocalDateTime,
  getCurrentLocalDate,
  
  // Fecha de venta
  formatFechaVenta,
  formatFechaVentaForDisplay,
  
  // Fechas del servidor
  formatServerDateToLocal,
  formatServerDateForDisplay,
  
  // Validación
  isValidDate,
  isFutureDate,
  isTooOldDate,
  
  // Picker
  getDateForPicker,
  splitDateTime,
  combineDateTime
};