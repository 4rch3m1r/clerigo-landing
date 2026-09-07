# ─────────────────────────────────────────────────────────────────────────────
# Generador de Tarjetas Open Graph (1200x630) para Clérigo.io
# ─────────────────────────────────────────────────────────────────────────────
Add-Type -AssemblyName System.Drawing

$RAIZ = Split-Path -Parent $PSScriptRoot
$LOGO_PATH = Join-Path $RAIZ 'favicon.png'
if (-not (Test-Path $LOGO_PATH)) { Write-Error "No se encontró $LOGO_PATH"; exit 1 }

$ANCHO = 1200
$ALTO = 630

$FONDO      = [System.Drawing.Color]::FromArgb(255, 14, 14, 14)       # #0E0E0E
$FONDO_CARD = [System.Drawing.Color]::FromArgb(255, 22, 24, 28)       # #16181C
$ROJO       = [System.Drawing.Color]::FromArgb(255, 235, 16, 0)       # #EB1000
$ROJO_TINT  = [System.Drawing.Color]::FromArgb(40, 235, 16, 0)
$BLANCO     = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
$TINTA_SUAVE= [System.Drawing.Color]::FromArgb(255, 175, 185, 195)   # Slate gray
$TINTA_MUTED= [System.Drawing.Color]::FromArgb(255, 130, 140, 150)
$BORDE_SUAVE= [System.Drawing.Color]::FromArgb(35, 255, 255, 255)
$BORDE_PILL = [System.Drawing.Color]::FromArgb(60, 255, 255, 255)
$REJILLA    = [System.Drawing.Color]::FromArgb(8, 255, 255, 255)

$TARJETAS = @(
  @{
    Names = @('clerigo-og.png', 'og.png')
    Badge = 'PLATAFORMA GRC CON INTELIGENCIA ARTIFICIAL'
    Title = "Gobernanza, Riesgo y Cumplimiento`nUnificados en una Sola Plataforma"
    Desc  = "Automatiza auditorías, gestiona riesgos en tiempo real y asegura el cumplimiento normativo con IA generativa y control continuo."
    Badges = @('ISO 27001', 'SOC 2 Type II', 'HIPAA', 'GDPR', 'NIST CSF', 'SIMV')
  },
  @{
    Names = @('marcos-og.png', 'og-marcos.png')
    Badge = 'COBERTURA REGULATORIA Y NORMATIVA'
    Title = "23+ Marcos y Reguladores`nIntegrados y Actualizados"
    Desc  = "ISO 27001, SOC 2, HIPAA, GDPR, PCI-DSS, NIST, SIMV, Superintendencia de Bancos y marcos internacionales con mapeo cruzado automático."
    Badges = @('ISO 27001', 'SOC 2', 'NIST CSF', 'PCI-DSS', 'HIPAA', 'SB / SIMV')
  },
  @{
    Names = @('precios-og.png', 'og-precios.png')
    Badge = 'PLANES Y MODELO DE INVERSIÓN'
    Title = "Escalabilidad Transparente para`nEquipos de Cualquier Dimensión"
    Desc  = "Planes modulares desde $20/usuario/mes. Activa únicamente los módulos y marcos que tu organización necesita sin costes ocultos."
    Badges = @('Desde $20/mes', 'Sin Permanencia', 'Soporte 24/7', 'Nube o Dedicado')
  },
  @{
    Names = @('confianza-og.png', 'og-confianza.png')
    Badge = 'CENTRO DE SEGURIDAD Y CONFIANZA'
    Title = "Seguridad de Nivel Bancario,`nPrivacidad y Control Absoluto"
    Desc  = "Cifrado AES-256 en reposo y tránsito, aislamiento estricto de datos multitenant, auditorías periódicas y cumplimiento global garantizado."
    Badges = @('Cifrado AES-256', 'Zero Trust', 'Alta Disponibilidad 99.9%', 'GDPR')
  },
  @{
    Names = @('contacto-og.png', 'og-contacto.png')
    Badge = 'DEMOSTRACIÓN Y CONSULTORÍA'
    Title = "Agenda una Sesión Personalizada`ncon Nuestros Especialistas GRC"
    Desc  = "Descubre cómo Clérigo transforma la gestión de riesgos y auditoría en tu empresa con una demo en vivo guiada."
    Badges = @('Demo Inmediata', 'Evaluación Gratuita', 'Asesoría Experta')
  },
  @{
    Names = @('partners-og.png', 'og-partners.png')
    Badge = 'PROGRAMA GLOBAL DE PARTNERS'
    Title = "Alianzas Estratégicas para Firmas`nde Auditoría y Consultoría"
    Desc  = "Amplía tu oferta de servicios con la plataforma GRC líder para consultores, auditores y firmas de ciberseguridad."
    Badges = @('Revenue Share', 'Certificación Oficial', 'Portal de Partner')
  },
  @{
    Names = @('legal-og.png', 'og-legal.png')
    Badge = 'TRANSPARENCIA Y TÉRMINOS LEGALES'
    Title = "Términos del Servicio, Privacidad`ny Políticas de Tratamiento de Datos"
    Desc  = "Compromiso contractual riguroso con la protección de datos, acuerdos de nivel de servicio (SLA) y normativas internacionales."
    Badges = @('SLA 99.9%', 'DPA Certificado', 'Privacidad por Diseño')
  },
  @{
    Names = @('security-og.png')
    Badge = 'SEGURIDAD ENTERPRISE'
    Title = "Arquitectura de Seguridad Resiliente`ny Protección de Datos Continua"
    Desc  = "Descubre nuestros controles de seguridad, autenticación multifactor, SSO empresarial y monitoreo de amenazas 24/7."
    Badges = @('MFA / SSO', 'SOC 2 Type II', 'ISO 27001', 'Pentest Anual')
  },
  @{
    Names = @('compliance-og.png')
    Badge = 'CUMPLIMIENTO CONTINUO Y AUTOMATIZADO'
    Title = "Automatización Inteligente del`nCumplimiento Normativo"
    Desc  = "Evidencia continua, recolección automatizada y auditorías simplificadas para reducir hasta un 70% del tiempo de auditoría."
    Badges = @('Control Continuo', 'Evidencia Automática', 'Auditoría con IA')
  },
  @{
    Names = @('platform-og.png')
    Badge = 'ARQUITECTURA DE PLATAFORMA GRC'
    Title = "45+ Módulos Integrados para`nGobernanza, Riesgo y Cumplimiento"
    Desc  = "Riesgos, Procesos, Auditoría, Gestión Documental, Firma Digital XSign, Proveedores y Chatbot de Cumplimiento con IA."
    Badges = @('45+ Módulos', 'IA Integrada', 'API Abierta', 'Firma Digital')
  }
)

function New-RoundedRectangle {
  param($Rect, $Radius)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $size = New-Object System.Drawing.Size $diameter, $diameter
  $arc = New-Object System.Drawing.Rectangle $Rect.Location, $size

  $path.AddArc($arc, 180, 90)
  $arc.X = $Rect.Right - $diameter
  $path.AddArc($arc, 270, 90)
  $arc.Y = $Rect.Bottom - $diameter
  $path.AddArc($arc, 0, 90)
  $arc.X = $Rect.Left
  $path.AddArc($arc, 90, 90)
  $path.CloseFigure()
  return $path
}

function Render-OgImage {
  param($Config)

  $bmp = New-Object System.Drawing.Bitmap $ANCHO, $ALTO
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  # 1. Fondo Principal
  $bFondo = New-Object System.Drawing.SolidBrush $FONDO
  $g.FillRectangle($bFondo, 0, 0, $ANCHO, $ALTO)

  # 2. Rejilla Técnica Sutil (60px)
  $pRejilla = New-Object System.Drawing.Pen $REJILLA, 1
  for ($x = 0; $x -le $ANCHO; $x += 60) { $g.DrawLine($pRejilla, $x, 0, $x, $ALTO) }
  for ($y = 0; $y -le $ALTO; $y += 60) { $g.DrawLine($pRejilla, 0, $y, $ANCHO, $y) }

  # 3. Resplandor Rojo Suave en la Esquina Superior Izquierda y Derecha
  for ($i = 16; $i -ge 1; $i--) {
    $r = $i * 45
    $alfa = [int](38 / $i)
    if ($alfa -lt 1) { $alfa = 1 }
    $bGlow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alfa, 235, 16, 0))
    $g.FillEllipse($bGlow, -$r + 140, -$r + 60, $r * 2, $r * 2)
    $bGlow.Dispose()
  }

  for ($i = 10; $i -ge 1; $i--) {
    $r = $i * 35
    $alfa = [int](20 / $i)
    if ($alfa -lt 1) { $alfa = 1 }
    $bGlow2 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alfa, 235, 16, 0))
    $g.FillEllipse($bGlow2, $ANCHO - $r - 60, $ALTO - $r - 60, $r * 2, $r * 2)
    $bGlow2.Dispose()
  }

  # 4. Línea Roja Inferior Accent
  $bRojo = New-Object System.Drawing.SolidBrush $ROJO
  $g.FillRectangle($bRojo, 0, $ALTO - 6, $ANCHO, 6)

  # 5. Logotipo Clérigo (Crisp 84x84)
  $logoImg = [System.Drawing.Image]::FromFile($LOGO_PATH)
  $g.DrawImage($logoImg, 80, 68, 84, 84)
  $logoImg.Dispose()

  $tipo = [System.Drawing.StringFormat]::GenericTypographic

  # 6. Pill de Categoría / Sección (Badge)
  $fBadge = New-Object System.Drawing.Font 'Segoe UI', 13, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $badgeText = $Config.Badge.ToUpper()
  $badgeSize = $g.MeasureString($badgeText, $fBadge, [System.Drawing.PointF]::Empty, $tipo)
  $pillW = [int]($badgeSize.Width + 40)
  $pillH = 28
  $pillX = 184
  $pillY = 72

  $pillRect = New-Object System.Drawing.Rectangle $pillX, $pillY, $pillW, $pillH
  $pillPath = New-RoundedRectangle -Rect $pillRect -Radius 14
  $bPillFondo = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 24, 26, 30))
  $pPillBorde = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(70, 235, 16, 0)), 1
  $g.FillPath($bPillFondo, $pillPath)
  $g.DrawPath($pPillBorde, $pillPath)

  # Punto rojo en el badge
  $g.FillEllipse($bRojo, $pillX + 12, $pillY + 10, 8, 8)
  # Texto del badge
  $g.DrawString($badgeText, $fBadge, (New-Object System.Drawing.SolidBrush $BLANCO), ($pillX + 26), ($pillY + 6), $tipo)

  # 7. Nombre de Marca "Clérigo" al lado del logo
  $fNombre = New-Object System.Drawing.Font 'Segoe UI', 42, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $bBlanco = New-Object System.Drawing.SolidBrush $BLANCO
  $g.DrawString('Clérigo', $fNombre, $bBlanco, 184, 104, $tipo)

  # 8. Línea Divisoria Sutil
  $pLinea = New-Object System.Drawing.Pen $BORDE_SUAVE, 1
  $g.DrawLine($pLinea, 80, 175, $ANCHO - 80, 175)

  # 9. Título Principal (Grande, blanco, claro)
  $fTitulo = New-Object System.Drawing.Font 'Segoe UI', 42, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $cajaTitulo = New-Object System.Drawing.RectangleF 80, 202, ($ANCHO - 160), 120
  $g.DrawString($Config.Title, $fTitulo, $bBlanco, $cajaTitulo, $tipo)

  # 10. Descripción / Subtítulo
  $fDesc = New-Object System.Drawing.Font 'Segoe UI', 22, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $bSuave = New-Object System.Drawing.SolidBrush $TINTA_SUAVE
  $cajaDesc = New-Object System.Drawing.RectangleF 80, 345, ($ANCHO - 160), 75
  $g.DrawString($Config.Desc, $fDesc, $bSuave, $cajaDesc, $tipo)

  # 11. Badges de Confianza / Marcos (Pills inferiores)
  if ($Config.Badges -and $Config.Badges.Count -gt 0) {
    $fBadgePill = New-Object System.Drawing.Font 'Segoe UI', 13, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $badgeX = 80
    $badgeY = 445
    foreach ($badgeItem in $Config.Badges) {
      $bSize = $g.MeasureString($badgeItem, $fBadgePill, [System.Drawing.PointF]::Empty, $tipo)
      $bW = [int]($bSize.Width + 24)
      $bH = 32
      $bRect = New-Object System.Drawing.Rectangle $badgeX, $badgeY, $bW, $bH
      $bPath = New-RoundedRectangle -Rect $bRect -Radius 16
      
      $bBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(210, 28, 30, 35))
      $bBorder = New-Object System.Drawing.Pen $BORDE_PILL, 1
      $bTextBrush = New-Object System.Drawing.SolidBrush $BLANCO

      $g.FillPath($bBg, $bPath)
      $g.DrawPath($bBorder, $bPath)
      $g.DrawString($badgeItem, $fBadgePill, $bTextBrush, ($badgeX + 12), ($badgeY + 8), $tipo)

      $badgeX += $bW + 12

      $bBg.Dispose(); $bBorder.Dispose(); $bTextBrush.Dispose(); $bPath.Dispose()
    }
    $fBadgePill.Dispose()
  }

  # 12. Línea Divisoria Inferior Sutil
  $g.DrawLine($pLinea, 80, 500, $ANCHO - 80, 500)

  # 13. Footer: Dominio y Tagline institucional
  $fDom = New-Object System.Drawing.Font 'Segoe UI', 24, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString('clerigo.io', $fDom, $bRojo, 80, 528, $tipo)

  $fFoot = New-Object System.Drawing.Font 'Segoe UI', 16, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $bMuted = New-Object System.Drawing.SolidBrush $TINTA_MUTED
  $footText = "Enterprise GRC & Compliance Platform"
  $g.DrawString($footText, $fFoot, $bMuted, 210, 535, $tipo)

  # Tagline derecho: "Gobierno · Riesgo · Cumplimiento"
  $rightText = "Gobernanza · Riesgo · Cumplimiento"
  $rightSize = $g.MeasureString($rightText, $fFoot, [System.Drawing.PointF]::Empty, $tipo)
  $g.DrawString($rightText, $fFoot, $bMuted, ($ANCHO - 80 - $rightSize.Width), 535, $tipo)

  # Guardar en todas las rutas requeridas
  foreach ($nombre in $Config.Names) {
    # 1. En /public/og/
    $dest1 = Join-Path (Join-Path $RAIZ 'public\og') $nombre
    $bmp.Save($dest1, [System.Drawing.Imaging.ImageFormat]::Png)

    # 2. En /og/
    $dest2 = Join-Path (Join-Path $RAIZ 'og') $nombre
    $bmp.Save($dest2, [System.Drawing.Imaging.ImageFormat]::Png)

    # 3. Si tiene prefijo og- o es og.png o clerigo-og.png, también en la raíz
    if ($nombre -like 'og*' -or $nombre -eq 'clerigo-og.png') {
      $dest3 = Join-Path $RAIZ $nombre
      $bmp.Save($dest3, [System.Drawing.Imaging.ImageFormat]::Png)
    }

    $kb = [math]::Round((Get-Item $dest1).Length / 1KB)
    Write-Host "  [OK] $nombre -> 1200x630 (${kb} KB)"
  }

  # Liberar objetos GDI+
  $fBadge.Dispose(); $fNombre.Dispose(); $fTitulo.Dispose(); $fDesc.Dispose(); $fDom.Dispose(); $fFoot.Dispose()
  $bFondo.Dispose(); $bPillFondo.Dispose(); $pPillBorde.Dispose(); $bRojo.Dispose(); $bBlanco.Dispose(); $bSuave.Dispose(); $bMuted.Dispose()
  $pRejilla.Dispose(); $pLinea.Dispose(); $pillPath.Dispose(); $g.Dispose(); $bmp.Dispose()
}

Write-Host "Generando tarjetas Open Graph HD (1200x630) para Clérigo..."
foreach ($tarjeta in $TARJETAS) {
  Render-OgImage -Config $tarjeta
}
Write-Host "¡Todas las tarjetas OG se han generado exitosamente!"
