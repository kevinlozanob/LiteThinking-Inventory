import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_LEFT, TA_CENTER

# --- COLORES ---
COLOR_BG_DARK = colors.HexColor("#0D0D0D")
COLOR_BG_ACCENT = colors.HexColor("#1A1A1A")
COLOR_YELLOW = colors.HexColor("#E6C200")
COLOR_WHITE = colors.HexColor("#FFFFFF")
COLOR_GRAY_LIGHT = colors.HexColor("#F2F2F2")
COLOR_TEXT_MUTED = colors.HexColor("#888888")

# --- FUNCION SALVAVIDAS (SANITIZACIÓN) ---
def limpiar_texto(texto):
    """
    Elimina caracteres que no sean soportados por la codificación Latin-1
    (Como emojis o caracteres asiáticos) para evitar que ReportLab explote.
    Mantiene tildes y ñ.
    """
    if not isinstance(texto, str):
        return str(texto)
    
    # Truco: Codifica a Latin-1 (ignorando errores/emojis) y decodifica de nuevo
    return texto.encode('latin-1', 'ignore').decode('latin-1')

def draw_header_footer(canvas, doc):
    canvas.saveState()
    
    # --- HEADER ---
    path = canvas.beginPath()
    path.moveTo(0, 29.7*cm)
    path.lineTo(21*cm, 29.7*cm)
    path.lineTo(21*cm, 24*cm)
    path.lineTo(0, 25.5*cm) 
    path.close()
    canvas.setFillColor(COLOR_BG_DARK)
    canvas.drawPath(path, fill=1, stroke=0)

    canvas.setFillColor(COLOR_YELLOW)
    canvas.rect(0, 24*cm, 1.2*cm, 3*cm, fill=1, stroke=0)
    
    canvas.setFont("Helvetica-Bold", 26)
    canvas.setFillColor(COLOR_WHITE)
    canvas.drawString(2*cm, 27.5*cm, "INVENTARIO")
    
    canvas.setFont("Helvetica", 10)
    canvas.setFillColor(COLOR_YELLOW)
    canvas.drawString(2*cm, 27*cm, "NICKLCSDEV - LITE THINKING")

    canvas.setFont("Helvetica-Bold", 40)
    canvas.setFillColor(colors.Color(1, 1, 1, 0.05))
    canvas.drawRightString(20*cm, 26*cm, "REPORT")

    # --- FOOTER ---
    canvas.setFillColor(COLOR_BG_DARK)
    canvas.rect(0, 0, 21*cm, 1.5*cm, fill=1, stroke=0)
    
    canvas.setFillColor(COLOR_YELLOW)
    canvas.rect(0, 1.5*cm, 21*cm, 0.1*cm, fill=1, stroke=0)
    
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(COLOR_WHITE)
    canvas.drawString(1.5*cm, 0.7*cm, "CONFIDENTIAL DOCUMENT")
    
    page_num = f"{doc.page}"
    canvas.drawRightString(19.5*cm, 0.7*cm, page_num)
    
    canvas.restoreState()

def generar_pdf_inventario(productos, info_empresa_backup=None):
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=6*cm, 
        bottomMargin=3*cm,
        leftMargin=1.5*cm,
        rightMargin=1.5*cm
    )
    
    elements = []
    styles = getSampleStyleSheet()

    # Obtener nombre empresa de forma segura
    if productos:
        empresa_nombre = productos[0].empresa.nombre
    elif info_empresa_backup:
        empresa_nombre = info_empresa_backup.get('nombre', 'N/A')
    else:
        empresa_nombre = "N/A"
    
    # Limpiamos el nombre de la empresa también por si acaso tiene emojis
    empresa_nombre = limpiar_texto(empresa_nombre)

    fecha_hoy = datetime.now().strftime("%Y-%m-%d").upper()
    total_items = str(len(productos))

    info_data = [
        [
            Paragraph("<font color='#888888' size=8>EMPRESA</font>", styles['Normal']),
            Paragraph("<font color='#888888' size=8>FECHA DE EMISIÓN</font>", styles['Normal']),
            Paragraph("<font color='#888888' size=8>TOTAL ITEMS</font>", styles['Normal'])
        ],
        [
            Paragraph(f"<font color='#000000' size=12><b>{empresa_nombre}</b></font>", styles['Normal']),
            Paragraph(f"<font color='#000000' size=12><b>{fecha_hoy}</b></font>", styles['Normal']),
            Paragraph(f"<font color='#000000' size=12><b>{total_items}</b></font>", styles['Normal'])
        ]
    ]

    info_table = Table(info_data, colWidths=[9*cm, 5*cm, 4*cm])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(info_table)
    
    elements.append(Spacer(1, 1.5*cm))

    # --- MAIN TABLE ---
    headers = ['CÓDIGO', 'PRODUCTO', 'CARACTERÍSTICAS', 'PRECIO REF.']
    table_data = [headers]

    for p in productos:
        # --- AQUÍ OCURRE LA MAGIA ---
        # Pasamos todo por el filtro antes de meterlo al PDF
        nombre = limpiar_texto(p.nombre)
        code = limpiar_texto(p.codigo)
        
        chars_raw = limpiar_texto(p.caracteristicas)
        chars = chars_raw[:40] + "..." if len(chars_raw) > 40 else chars_raw
        
        precio_txt = "N/A"
        if p.precios and isinstance(p.precios, dict) and len(p.precios) > 0:
            k = list(p.precios.keys())[0]
            v = p.precios[k]
            precio_txt = f"{k} {v:,.0f}"

        row = [
            Paragraph(f"<font color='#666666' size=9>{code}</font>", styles['Normal']),
            Paragraph(f"<font color='#000000' size=10><b>{nombre}</b></font>", styles['Normal']),
            Paragraph(f"<font color='#666666' size=9>{chars}</font>", styles['Normal']),
            Paragraph(f"<font color='#000000' size=10><b>{precio_txt}</b></font>", styles['Normal']),
        ]
        table_data.append(row)

    col_widths = [3.5*cm, 6*cm, 5*cm, 3.5*cm]
    t = Table(table_data, colWidths=col_widths)

    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_BG_ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), COLOR_YELLOW),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'), 
        
        ('VALIGN', (0, 1), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 10),
        ('LINEBELOW', (0, 1), (-1, -1), 0.5, colors.HexColor("#E5E5E5")),
    ]))

    elements.append(t)
    
    # --- FOOTER SUMMARY ---
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph(
        " Generado Automaticamente", 
        ParagraphStyle('End', parent=styles['Normal'], alignment=TA_CENTER, textColor=COLOR_TEXT_MUTED, fontSize=8)
    ))

    doc.build(elements, onFirstPage=draw_header_footer, onLaterPages=draw_header_footer)
    buffer.seek(0)
    return buffer