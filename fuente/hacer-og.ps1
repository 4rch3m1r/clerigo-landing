# ─────────────────────────────────────────────────────────────────────────────
# La imagen que sale cuando alguien pega un enlace de Clèrigo en WhatsApp,
# LinkedIn, Slack, X o iMessage.
#
# POR QUÉ EXISTE ESTO
# Las páginas llevaban desde el principio `og:image` apuntando a
# https://clerigo.io/og.png, y ese fichero NO existía: el servidor contesta a
# cualquier ruta con el HTML de la portada, así que el rastreador pedía una
# imagen y recibía una página. Resultado: la tarjeta salía sin foto en todas
# partes, y en WhatsApp muchas veces no salía tarjeta.
#
# Se dibuja aquí y no a mano para que se pueda rehacer: cambia el rótulo o el
# color en la tabla de abajo y salen las seis otra vez iguales entre sí.
#
#   powershell -ExecutionPolicy Bypass -File fuente/hacer-og.ps1
#
# LA LETRA. El sitio usa Source Sans 3, que no está instalada en Windows y no
# se va a instalar por una miniatura. Se dibuja con Segoe UI, que es de la
# misma familia de formas —humanista, sin gracias— y a este tamaño nadie
# compara los perfiles de las letras. Si algún día hace falta que sea exacta,
# se mete el .ttf de Source Sans 3 en fuente/ y se carga con
# PrivateFontCollection.
# ─────────────────────────────────────────────────────────────────────────────

Add-Type -AssemblyName System.Drawing

$RAIZ = Split-Path -Parent $PSScriptRoot
$LOGO = Join-Path $RAIZ 'favicon.png'
if (-not (Test-Path $LOGO)) { Write-Error "Falta $LOGO"; exit 1 }

# 1200 x 630 es la medida que piden Facebook, LinkedIn y X para la tarjeta
# grande. WhatsApp recorta a cuadrado desde el centro, así que lo importante
# —logotipo y nombre— va centrado en vertical y no pegado a un borde.
$ANCHO = 1200
$ALTO = 630

$FONDO      = [System.Drawing.Color]::FromArgb(255, 14, 14, 14)
$ROJO       = [System.Drawing.Color]::FromArgb(255, 235, 16, 0)
$TINTA      = [System.Drawing.Color]::FromArgb(255, 240, 240, 240)
$TINTA_2    = [System.Drawing.Color]::FromArgb(180, 240, 240, 240)
$REJILLA    = [System.Drawing.Color]::FromArgb(10, 255, 255, 255)

# fichero, rótulo de arriba, frase. Las frases salen de la propia página.
$TARJETAS = @(
  @{ f = 'og.png';          r = 'PLATAFORMA GRC';        t = "Gobernanza, Riesgo y Cumplimiento`nsin complicaciones" },
  @{ f = 'og-legal.png';    r = 'DOCUMENTOS LEGALES';    t = "Términos, Privacidad`ny Política de Cookies" },
  @{ f = 'og-precios.png';  r = 'PLANES Y PRECIOS';      t = "Elige solo lo que`ntu empresa necesita" },
  @{ f = 'og-marcos.png';   r = 'COBERTURA REGULATORIA'; t = "Módulos, marcos y reguladores.`nTodo en un solo entorno" },
  @{ f = 'og-contacto.png'; r = 'CONTACTO';              t = "El primer paso`nno cuesta nada" },
  @{ f = 'og-partners.png'; r = 'PROGRAMA DE PARTNERS';  t = "Conecta. Construye. Crece" },
  @{ f = 'og-confianza.png'; r = 'CENTRO DE CONFIANZA';  t = "Cómo se guardan`ny se protegen tus datos" }
)

function New-Tarjeta {
  param($Fichero, $Rotulo, $Frase)

  $bmp = New-Object System.Drawing.Bitmap -ArgumentList $ANCHO, $ALTO
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  # ── el fondo ──
  $bFondo = New-Object System.Drawing.SolidBrush $FONDO
  $g.FillRectangle($bFondo, 0, 0, $ANCHO, $ALTO)

  # ── la rejilla, como en la portada: 60 px ──
  $pRejilla = New-Object System.Drawing.Pen $REJILLA, 1
  for ($x = 0; $x -le $ANCHO; $x += 60) { $g.DrawLine($pRejilla, $x, 0, $x, $ALTO) }
  for ($y = 0; $y -le $ALTO; $y += 60) { $g.DrawLine($pRejilla, 0, $y, $ANCHO, $y) }

  # ── el resplandor rojo de la esquina, en capas: un degradado radial de
  #    verdad pide PathGradientBrush y para tres círculos no compensa ──
  for ($i = 12; $i -ge 1; $i--) {
    $r = $i * 46
    $alfa = [int](30 / $i)
    if ($alfa -lt 1) { $alfa = 1 }
    $bGlow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alfa, 235, 16, 0))
    $g.FillEllipse($bGlow, -$r + 120, -$r + 40, $r * 2, $r * 2)
    $bGlow.Dispose()
  }

  # ── la franja roja del borde de abajo ──
  $bRojo = New-Object System.Drawing.SolidBrush $ROJO
  $g.FillRectangle($bRojo, 0, $ALTO - 8, $ANCHO, 8)

  # ── el logotipo ──
  $logo = [System.Drawing.Image]::FromFile($LOGO)
  $g.DrawImage($logo, 80, 96, 96, 96)
  $logo.Dispose()

  # Medir con el formato tipográfico y no con el de por defecto: el de por
  # defecto añade un relleno a los lados de cada cadena —como un sexto de eme—
  # y con eso el espaciado de letras salía descuadrado y las tres piezas de la
  # izquierda no se alineaban entre sí aunque llevaran la misma x.
  $tipo = [System.Drawing.StringFormat]::GenericTypographic

  # ── el rótulo de arriba, en rojo y con las letras separadas ──
  $fRotulo = New-Object System.Drawing.Font 'Segoe UI', 20, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $x = 200.0
  foreach ($c in $Rotulo.ToCharArray()) {
    $s = [string]$c
    # El espacio se pone a mano: medido carácter a carácter se queda en nada y
    # «PLATAFORMA GRC» salía «PLATAFORMAGRC».
    if ($s -eq ' ') { $x += 11; continue }
    $g.DrawString($s, $fRotulo, $bRojo, $x, 116, $tipo)
    $x += $g.MeasureString($s, $fRotulo, [System.Drawing.PointF]::Empty, $tipo).Width + 3.5
  }

  # ── el nombre ──
  $fNombre = New-Object System.Drawing.Font 'Segoe UI', 76, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $bTinta = New-Object System.Drawing.SolidBrush $TINTA
  $g.DrawString('Clèrigo', $fNombre, $bTinta, 200, 140, $tipo)

  # ── la línea ──
  $pLinea = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(40, 255, 255, 255)), 1
  $g.DrawLine($pLinea, 200, 268, $ANCHO - 80, 268)

  # ── la frase ──
  $fFrase = New-Object System.Drawing.Font 'Segoe UI', 44, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $bTinta2 = New-Object System.Drawing.SolidBrush $TINTA_2
  $caja = New-Object System.Drawing.RectangleF 200, 310, ($ANCHO - 280), 200
  $g.DrawString($Frase, $fFrase, $bTinta2, $caja, $tipo)

  # ── el dominio ──
  $fDom = New-Object System.Drawing.Font 'Segoe UI', 24, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawString('clerigo.io', $fDom, $bRojo, 200, $ALTO - 100, $tipo)

  $destino = Join-Path $RAIZ $Fichero
  $bmp.Save($destino, [System.Drawing.Imaging.ImageFormat]::Png)

  foreach ($o in @($fRotulo, $fNombre, $fFrase, $fDom, $bFondo, $bRojo, $bTinta, $bTinta2, $pRejilla, $pLinea, $g, $bmp)) { $o.Dispose() }

  $kb = [math]::Round((Get-Item $destino).Length / 1KB)
  "  $Fichero  ·  $ANCHO x $ALTO  ·  $kb KB"
}

"Dibujando las tarjetas de vista previa:"
foreach ($t in $TARJETAS) { New-Tarjeta -Fichero $t.f -Rotulo $t.r -Frase $t.t }
"Listo."
