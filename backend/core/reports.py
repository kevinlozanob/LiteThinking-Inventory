import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def generar_pdf_inventario(productos):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    elements.append(Paragraph("Reporte de Inventario de Productos", styles['Title']))
    elements.append(Paragraph("<br/><br/>", styles['Normal']))
    
    data = [['Código', 'Nombre', 'Empresa', 'Precio (Ref)']]
    
    for prod in productos:
        
        precio_str = "N/A"
        
        if isinstance(prod.precios, dict) and prod.precios:
            key = 'USD' if 'USD' in prod.precios else list(prod.precios.keys())[0]
            val = prod.precios[key]
            precio_str = f"{key} {val}"
        
        data.append([
            str(prod.codigo),
            str(prod.nombre)[:30],
            str(prod.empresa.nombre)[:20],
            precio_str
        ])
        
    table = Table(data)
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ])
    table.setStyle(style)
    
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer