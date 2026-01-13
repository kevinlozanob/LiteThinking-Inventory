import ExcelJS from 'exceljs';
import type { Producto } from '../services/productoService';

const EXAMPLE_DATA = {
  codigo: 'EJ-001',
  nombre: 'Zapato Deportivo Lite',
  caracteristicas: 'Talla 40, Color Negro, Ergonómico',
  precio: 150000,
  moneda: 'COP'
};

const BRAND_COLORS = {
  primary: 'FFE6C200', 
  dark: 'FF0D0D0D',    
  white: 'FFFFFFFF',
  gray: 'FFF2F2F2'
};

interface ParsedRow {
  data: Producto | null;
  rowNumber: number;
  error?: string;
}

const getImageBuffer = async (url: string): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 200; 
      canvas.height = 200; 
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      canvas.toBlob((blob) => {
        if (blob) {
          blob.arrayBuffer().then(resolve).catch(reject);
        } else {
          reject('Blob conversion failed');
        }
      }, 'image/png');
    };
    img.onerror = (e) => reject(e);
  });
};

export const generateAndDownloadTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Carga Inventario', {
    views: [{ showGridLines: false }]
  });

  worksheet.columns = [
    { key: 'codigo', width: 20 },
    { key: 'nombre', width: 35 },
    { key: 'caracteristicas', width: 45 },
    { key: 'precio', width: 20 },
    { key: 'moneda', width: 15 },
  ];

  try {
    const imageBuffer = await getImageBuffer('/FE.svg');
    const imageId = workbook.addImage({
      buffer: imageBuffer,
      extension: 'png',
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 60, height: 60 },
      editAs: 'oneCell'
    });
  } catch (e) {
    console.warn("No se pudo cargar el logo, generando sin imagen.", e);
  }

  worksheet.mergeCells('B2:E2');
  const titleCell = worksheet.getCell('B2');
  titleCell.value = 'PLANTILLA DE CARGA MASIVA - LITE THINKING';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: BRAND_COLORS.dark } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  worksheet.addRow([]); 
  worksheet.addRow([]); 
  worksheet.addRow([]); 

  const headerRow = worksheet.getRow(5);
  headerRow.values = ['CÓDIGO', 'NOMBRE DEL PRODUCTO', 'CARACTERÍSTICAS', 'PRECIO', 'MONEDA'];
  
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: BRAND_COLORS.dark }
    };
    cell.font = {
      name: 'Segoe UI',
      bold: true,
      color: { argb: BRAND_COLORS.primary },
      size: 11
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: BRAND_COLORS.primary } },
      bottom: { style: 'medium', color: { argb: BRAND_COLORS.primary } }
    };
  });
  headerRow.height = 30;

  const dataRow = worksheet.getRow(6);
  dataRow.values = [
    EXAMPLE_DATA.codigo,
    EXAMPLE_DATA.nombre,
    EXAMPLE_DATA.caracteristicas,
    EXAMPLE_DATA.precio,
    EXAMPLE_DATA.moneda
  ];

  dataRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF555555' } };
    cell.border = { bottom: { style: 'dotted', color: { argb: 'FFCCCCCC' } } };
    
    if (colNumber === 4) cell.numFmt = '#,##0.00';
  });

  
  for (let i = 6; i <= 100; i++) {
    worksheet.getCell(`D${i}`).dataValidation = {
      type: 'decimal',
      operator: 'greaterThan',
      formulae: ['0'],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Precio Inválido',
      error: 'El precio debe ser un número mayor a 0.'
    };

    worksheet.getCell(`E${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"COP,USD,EUR"'], 
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Moneda Inválida',
      error: 'Seleccione una moneda válida de la lista (COP, USD, EUR).'
    };
  }

  const noteCell = worksheet.getCell('B7');
  noteCell.value = 'Nota: Por favor reemplace el ejemplo o agregue filas nuevas hacia abajo. No modifique los encabezados.';
  noteCell.font = { size: 9, color: { argb: 'FF888888' }, italic: true };

  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'Plantilla_Inventario_LiteThinking.xlsx';
  anchor.click();
  
  window.URL.revokeObjectURL(url);
};

export const parseInventoryExcel = async (file: File, empresaNit: string): Promise<ParsedRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  let worksheet = workbook.getWorksheet('Carga Inventario');
  if (!worksheet) worksheet = workbook.getWorksheet(1);

  const results: ParsedRow[] = [];

  if (!worksheet) {
    throw new Error("El archivo Excel no tiene hojas válidas o formato incorrecto.");
  }


  worksheet.eachRow((row, rowNumber) => {

    const cellA = row.getCell(1).text?.toString().trim();
    
    if (!cellA || cellA.toUpperCase() === 'CÓDIGO' || cellA.toUpperCase() === 'CODIGO') return;

    const codigo = cellA;
    const nombre = row.getCell(2).text?.toString().trim();
    const caracteristicas = row.getCell(3).text?.toString().trim() || "Sin descripción";
    const precioRaw = row.getCell(4).value;
    const moneda = row.getCell(5).text?.toString().trim().toUpperCase() || 'COP';

    const isExampleRow = 
        codigo === EXAMPLE_DATA.codigo &&
        nombre === EXAMPLE_DATA.nombre &&
        Number(precioRaw) === EXAMPLE_DATA.precio;

    if (isExampleRow) {
        //console.log(`Fila ${rowNumber} ignorada: Es el ejemplo de la plantilla.`);
        return; 
    }

    if (!codigo || !nombre || !precioRaw) {
      results.push({
        data: null,
        rowNumber,
        error: "Faltan datos obligatorios (Código, Nombre o Precio)"
      });
      return;
    }

    let precio = 0;
    if (typeof precioRaw === 'object' && precioRaw !== null && 'result' in precioRaw) {
         precio = Number((precioRaw as any).result);
    } else {
         precio = Number(precioRaw);
    }

    if (isNaN(precio) || precio <= 0) {
        results.push({
            data: null,
            rowNumber,
            error: "El precio debe ser un número mayor a 0"
        });
        return;
    }

    if (!['COP', 'USD', 'EUR'].includes(moneda)) {
        results.push({
            data: null,
            rowNumber,
            error: `Moneda '${moneda}' no válida. Use COP, USD o EUR.`
        });
        return;
    }

    const producto: Producto = {
      codigo,
      nombre,
      caracteristicas,
      empresa: empresaNit,
      precios: {
        [moneda]: precio
      }
    };

    results.push({ data: producto, rowNumber });
  });

  return results;
};