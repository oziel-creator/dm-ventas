# DOMUS MAGNA · App de Ventas (interna)

App estática (HTML/CSS/JS, sin build) para que el vendedor haga la visita, el levantamiento, el boceto (planta + alzados A–D), acabados, la cotización real, el PDF para el cliente con firma y el estado del proyecto. Datos en `localStorage` del dispositivo.

- Ligada a la precotización web (`cq-cotizador-prueba`): **Importar precotización** (pegar JSON, subir `.json`) o abrir `index.html?pre=<base64 del JSON>`.
- La **lista de precios viene con precios de ejemplo** (marcados “ejemplo”): ajustar en *Precios*.
- Línea visual: `base.css` = `handoff/site/styles.css` de la precotización.
