# MuunCode

![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.2.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-26.3.6-26A69A?style=flat-square)
![oxlint](https://img.shields.io/badge/oxlint-1.75.0-1A1A1A?style=flat-square)
![Octokit](https://img.shields.io/badge/Octokit-8.3.0-181717?style=flat-square&logo=github&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-5.10.1-000000?style=flat-square&logo=vercel&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11.21.0-F69220?style=flat-square&logo=pnpm&logoColor=white)

[English](#english) | [Español](#español)

## English

1. [Welcome](#welcome)
2. [What is MuunCode](#what-is-muuncode)
3. [What MuunCode enables today](#what-muuncode-enables-today)
4. [Tech stack](#tech-stack)
5. [Project status](#project-status)

### <a id="welcome"></a>1. WELCOME

Hello! I'm AzanoRivers, and it excites me to think you're building something
incredible. MuunCode exists to help people who want to create technology and put it
in everyone's hands, fast enough to leave our planet and reach the Moon. The sky
isn't the limit, but today's technologies are: slow, hard to learn, hard to work
with. That's why MuunCode is built so that, with easy and intuitive web
technologies, you can build solutions that can reach every sector. I wish you great
success in whatever you're building: think big, build bigger. With Colombian heart,
AzanoRivers.

### <a id="what-is-muuncode"></a>2. WHAT IS MUUNCODE

MuunCode is an Open Source Embedded Development Platform designed to radically
simplify firmware development by letting developers build embedded applications
using familiar Web technologies (HTML, CSS, JavaScript).

The mission is to make embedded development accessible to millions of web
developers, letting them focus on solving real world problems instead of learning
dozens of firmware specific tools. MuunCode does not try to teach developers
embedded programming, it brings embedded programming closer to the knowledge
developers already have.

### <a id="what-muuncode-enables-today"></a>3. WHAT MUUNCODE ENABLES TODAY

This repository covers the web IDE: the visual editor experience, code editing,
linting, panel/window management, GitHub backed file handling, and browser based
device flashing. Firmware compilation itself lives in a separate project this repo
will call over an API once it exists.

Built so far in this repository:

- Sign in with GitHub through a GitHub App, which doubles as account creation, no
  separate MuunCode login system.
- Repository selection and creation, including a first commit scaffold
  (`.MuunCode/workspace.json`, a bilingual `README.md` template, and a bilingual
  `GREETINGS.md`) so a freshly created repository is immediately usable from
  MuunCode.
- The first layers of the `/lab` editor shell: a VS Code inspired menu bar, a
  collapsible file explorer with drag and drop visuals, a right click context menu,
  and a shared modal system. Monaco, the panel layout system, and real file
  editing are not built yet.

### <a id="tech-stack"></a>4. TECH STACK

- React 19 with TypeScript, built with Vite.
- `dockview` for the panel/window layout, Monaco Editor for the code editing
  surface itself (both planned, not wired in yet).
- `esptool-js` for browser based device flashing over WebSerial (planned).
- GitHub REST/Git Data API via Octokit, called directly from the browser, no
  database: project files live in the developer's own GitHub repository.
- A small set of stateless Vercel serverless functions for the pieces that need a
  GitHub App client secret (OAuth token exchange and refresh).

### <a id="project-status"></a>5. PROJECT STATUS

MuunCode is under active, early development. The pieces described above are real
and working, but the platform is far from finished: this is a foundation, not a
finished product.

---

## Español

1. [Bienvenida](#bienvenida)
2. [Qué es MuunCode](#qué-es-muuncode)
3. [Qué permite hacer MuunCode hoy](#qué-permite-hacer-muuncode-hoy)
4. [Stack tecnológico](#stack-tecnológico)
5. [Estado del proyecto](#estado-del-proyecto)

### <a id="bienvenida"></a>1. BIENVENIDA

Hola! Soy AzanoRivers y me emociona pensar que estás construyendo algo increible.
MuunCode está pensado para ayudar a personas que quieran crear tecnología y ponerla
a manos de todos, de forma tan rapida que salga de nuestro planeta y llegue a la
luna. El cielo no es el limite, pero sí las tecnologías actuales, son lentas,
dificiles de aprender, de manejar, por eso MuunCode está diseñado para que con
tecnologías web, faciles e intuitivas de usar, puedas construir soluciones que
puedan llegar a todos los sectores.

Te deseo muchos exítos en lo que sea que estés construyendo, piensa alto, construye
en grande. Con Corazón Colombiano, AzanoRivers.

### <a id="qué-es-muuncode"></a>2. QUÉ ES MUUNCODE

MuunCode es una Plataforma de Desarrollo Embebido de Código Abierto, diseñada para
simplificar radicalmente el desarrollo de firmware, permitiendo a los
desarrolladores construir aplicaciones embebidas usando tecnologías Web conocidas
(HTML, CSS, JavaScript).

La misión es hacer que el desarrollo embebido sea accesible para millones de
desarrolladores web, dejándolos enfocarse en resolver problemas reales en lugar de
aprender docenas de herramientas específicas de firmware. MuunCode no busca
enseñar programación embebida, sino acercar la programación embebida al
conocimiento que los desarrolladores ya tienen.

### <a id="qué-permite-hacer-muuncode-hoy"></a>3. QUÉ PERMITE HACER MUUNCODE HOY

Este repositorio cubre el IDE web: la experiencia del editor visual, la edición de
código, el linting, el manejo de paneles/ventanas, y el manejo de archivos
respaldado por GitHub, así como el flasheo de dispositivos desde el navegador. La
compilación del firmware en sí vive en un proyecto separado que este repositorio
llamará por API una vez exista.

Lo construido hasta ahora en este repositorio:

- Inicio de sesión con GitHub a través de una GitHub App, que también funciona
  como creación de cuenta, sin un sistema de login propio de MuunCode.
- Selección y creación de repositorios, incluyendo un primer commit de andamiaje
  (`.MuunCode/workspace.json`, una plantilla de `README.md` bilingüe, y un
  `GREETINGS.md` bilingüe) para que un repositorio recién creado quede utilizable
  desde MuunCode de inmediato.
- Las primeras capas del shell del editor `/lab`: una barra de menú inspirada en
  VS Code, un explorador de archivos colapsable con visuales de arrastrar y
  soltar, un menú contextual de clic derecho, y un sistema de modales compartido.
  Monaco, el sistema de layout de paneles, y la edición real de archivos todavía
  no están construidos.

### <a id="stack-tecnológico"></a>4. STACK TECNOLÓGICO

- React 19 con TypeScript, construido con Vite.
- `dockview` para el layout de paneles/ventanas, Monaco Editor para la superficie
  de edición de código en sí (ambos planeados, aún no integrados).
- `esptool-js` para el flasheo de dispositivos desde el navegador vía WebSerial
  (planeado).
- API REST/Git Data de GitHub vía Octokit, llamada directamente desde el
  navegador, sin base de datos: los archivos del proyecto viven en el propio
  repositorio de GitHub del desarrollador.
- Un pequeño conjunto de funciones serverless de Vercel, sin estado, para las
  partes que necesitan el client secret de la GitHub App (intercambio y
  refresco del token de OAuth).

### <a id="estado-del-proyecto"></a>5. ESTADO DEL PROYECTO

MuunCode está en desarrollo activo y temprano. Lo descrito arriba es real y
funcional, pero la plataforma está lejos de estar terminada: esto es una base,
no un producto terminado.
