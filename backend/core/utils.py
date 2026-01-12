from datetime import datetime

def get_email_template(email_destino):
    fecha_hoy = datetime.now().strftime("%d/%m/%Y %H:%M")
    year = datetime.now().year
    
    color_primary = "#E6C200"
    color_bg = "#F4F4F5"
    color_card = "#FFFFFF"
    color_dark = "#0D0D0D"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: {color_bg};">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;">
            <tr>
                <td style="padding: 40px 0; text-align: center;">
                    
                    <!-- CONTAINER -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="margin: 0 auto; background-color: {color_card}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        
                        <!-- HEADER -->
                        <tr>
                            <td style="background-color: {color_dark}; padding: 30px; text-align: center;">
                                <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; letter-spacing: 2px;">
                                    CREDEN<span style="color: {color_primary};">TIALS</span>
                                </h1>
                                <p style="color: #888888; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px; margin-bottom: 0;">
                                    LITE THINKING
                                </p>
                            </td>
                        </tr>

                        <!-- BODY -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333333; margin-top: 0; font-size: 20px;">Reporte de Inventario Generado</h2>
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Hola,
                                </p>
                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Has solicitado la exportación del estado actual del inventario. El sistema ha procesado la información exitosamente.
                                </p>
                                
                                <!-- INFO BOX -->
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; margin: 20px 0;">
                                    <tr>
                                        <td style="padding: 15px;">
                                            <p style="margin: 5px 0; font-size: 14px; color: #555;">
                                                <strong>Fecha de corte:</strong> {fecha_hoy}
                                            </p>
                                            <p style="margin: 5px 0; font-size: 14px; color: #555;">
                                                <strong>Destinatario:</strong> {email_destino}
                                            </p>
                                            <p style="margin: 5px 0; font-size: 14px; color: #555;">
                                                <strong>Archivo:</strong> inventario.pdf (Adjunto)
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                    Por favor, descarga el archivo adjunto para visualizar los detalles.
                                </p>
                                
                                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                                    <p style="font-size: 12px; color: #999999; text-align: center;">
                                        Si no realizaste esta solicitud, por favor contacta al administrador del sistema.
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <!-- FOOTER -->
                        <tr>
                            <td style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
                                <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                                    © {year} Lite Thinking. Todos los derechos reservados.
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html_content