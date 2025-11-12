# Chord Simulación

Este proyecto es una simulación del protocolo Chord, un sistema de lookup peer-to-peer escalable.

## Prerrequisitos

- Node.js (versión 18 o superior)
- pnpm

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd chord-simulacion
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   ```

3. Compila el proyecto:
   ```bash
   pnpm build
   ```

## Uso

### Simulación en consola
Ejecuta una simulación completa del anillo Chord, incluyendo estabilización y prueba de almacenamiento/búsqueda de datos:
```bash
pnpm start
```

### Servidor API
Levanta el servidor backend que maneja la simulación del anillo:
```bash
pnpm api
```
El servidor estará disponible en http://localhost:3000

### Interfaz visual
Levanta la aplicación React con visualización interactiva del anillo Chord:
```bash
pnpm frontend
```
La aplicación estará disponible en http://localhost:1234 (o el puerto que indique Parcel)