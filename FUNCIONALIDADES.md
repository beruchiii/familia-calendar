# FamiliApp - Funcionalidades

**App familiar para organizar citas, notas y la vida diaria.**
PWA desplegada en Vercel: `familia-calendar.vercel.app`

---

## Splash Screen
- Pantalla de bienvenida con foto familiar circular animada
- Titulo "FamiliApp" y subtitulo "Tu familia, organizada"
- Barra de carga animada
- Aparece solo 1 vez por sesion (2 segundos)

---

## Calendario

### Vistas
- **Hoy**: citas del dia actual y proximos 7 dias
- **Dia**: vista detallada de un dia concreto
- **Semana**: vista semanal con indicador del dia actual
- **Mes**: calendario mensual con preview de eventos por dia
- **Agenda**: lista cronologica de todas las citas futuras

### Eventos / Citas
- Crear, editar y eliminar citas
- Titulo, fecha, hora, notas
- **Miembros de familia**: asignar Papa, Mama, Berardo Jr., Giselle, Chaplin (perro)
- **Categorias**: Medico, Fisio, Veterinario, Escuela, etc. con colores y emojis
- **Categorias personalizadas**: crear nuevas categorias
- **Eventos multi-dia**: una cita puede abarcar varios dias
- **Eventos recurrentes**: diario, semanal, bisemanal, mensual
- **Fotos**: adjuntar fotos a las citas (compresion automatica)
- **Documentos**: adjuntar PDFs, Word, Excel, imagenes (max 5MB)
- **Sincronizacion Google Calendar**: conectar y sincronizar con Google Calendar

### Filtros y Busqueda
- Filtrar citas por miembro de familia
- Busqueda por texto en titulo, notas y categorias
- Navegacion temporal con flechas (dia/semana/mes)

### Notificaciones
- Recordatorios automaticos para citas proximas

---

## Notas

### Editor de Notas
- Titulo (auto-relleno con nombre del miembro seleccionado)
- Contenido de texto libre
- **6 colores**: amarillo, azul, verde, rosa, morado, blanco
- **Miembros**: asignar nota a un miembro de la familia
- **Fijar/desfijar**: notas fijadas aparecen primero
- **Boton guardar grande** al final del editor

### Checklist / Tareas
- Crear listas de tareas dentro de una nota
- Marcar/desmarcar tareas completadas
- Contador de tareas completadas (ej: 1/3)

### Notas de Voz
- **Grabar audio** directamente desde la app
- **Reproducir** con boton play/pause
- **Velocidad de reproduccion**: 1x, 1.5x, 2x
- **Transcripcion automatica** con Web Speech API (español)
- Boton T para ver/ocultar la transcripcion del audio
- Compatibilidad: audio/mp4 (Safari/iOS), audio/webm, audio/ogg

### Adjuntos
- **Fotos**: subir y ver fotos en las notas (compresion a 800px, JPEG 0.7)
- **Documentos**: adjuntar archivos PDF, Word, Excel, texto (max 5MB)

### Gestion de Notas
- **Busqueda**: buscar por titulo, contenido o items del checklist
- **Multi-seleccion**: seleccionar varias notas a la vez
- **Borrado masivo**: eliminar varias notas de golpe
- **Doble confirmacion**: dos clicks para confirmar borrado (seguridad)
- **Long press**: mantener pulsada una nota para entrar en modo seleccion
- **Seleccionar todas**: boton para seleccionar/deseleccionar todas

### Vista de Notas
- Grid de tarjetas con colores
- Preview de foto, checklist (max 3 items), badges de audio/documentos
- Fecha y hora de ultima modificacion
- Badge del miembro asignado
- Pin visible en notas fijadas

---

## Interfaz

### Modo Oscuro
- Toggle modo claro/oscuro
- Todas las vistas adaptadas (calendario, notas, modales)
- Colores de notas adaptados al modo oscuro

### App Switcher
- Boton para cambiar entre Calendario y Notas
- Siempre visible en el header

### Responsive / PWA
- Diseño optimizado para movil (max 480px)
- Instalable como app nativa (PWA)
- Service Worker para funcionamiento offline
- Meta tags para iOS (apple-mobile-web-app)

---

## Datos y Sincronizacion
- **Firebase Firestore**: base de datos en la nube (tiempo real)
- **Sincronizacion entre dispositivos**: todos los miembros de la familia ven los mismos datos
- Cambios aparecen al instante en todos los dispositivos conectados
- Migracion automatica de datos locales a Firebase (primera vez)
- Proyecto Firebase: `familiapp-14ac9` (Plan Spark - gratuito)
- Servidor en Europa (eur3) para baja latencia
- Preferencia modo oscuro: `darkMode` (localStorage)

---

## Stack Tecnico
- **React 19** + Vite 8
- **Firebase Firestore** para sincronizacion en tiempo real
- **date-fns** para manejo de fechas (locale español)
- **lucide-react** para iconos
- **Web Speech API** para transcripcion de voz
- **MediaRecorder API** para grabacion de audio
- **Canvas API** para compresion de imagenes
- **Vercel** para despliegue automatico desde GitHub

---

## Miembros de la Familia
| Emoji | Nombre | Rol |
|-------|--------|-----|
| 👨 | Papa | Padre |
| 👩 | Mama | Madre |
| 👦 | Berardo Jr. | Hijo |
| 👧 | Giselle | Hija |
| 🐶 | Chaplin | Mascota |

---

*Desarrollado con Claude Code*
