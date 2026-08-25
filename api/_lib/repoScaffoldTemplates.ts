// Static and templated content for the three files committed into every newly created
// MuunCode repository. Pure string building only, no network calls, so nothing here
// needs the no-throw wrapping used by the actual GitHub API callers in this folder.

interface WorkspaceConfigInput {
  name: string
  createdAt: string
}

// The minimal, versioned .MuunCode/workspace.json skeleton. Device/display selection is
// not a feature that exists yet, so both fields stay null until a future feature needs
// them: no premature abstraction ahead of the feature that will actually populate them.
export function buildWorkspaceConfig({ name, createdAt }: WorkspaceConfigInput): string {
  return JSON.stringify(
    {
      muunCodeVersion: 1,
      name,
      device: null,
      display: null,
      createdAt,
    },
    null,
    2,
  )
}

interface ReadmeInput {
  name: string
  description: string
}

// Bilingual README: English section first (primary audience), Spanish section second
// (MuunCode's own large Spanish-speaking community). Headings are plain markdown text,
// GitHub slugifies them into anchors automatically, so the index links below reference
// those auto-generated anchors rather than hand-written ids.
export function buildReadme({ name, description }: ReadmeInput): string {
  const tagline = description ? `\n${description}\n` : ''

  return `# ${name}
${tagline}
[English](#english) | [Español](#español)

## English

### Purpose

_What this project does and the problem it solves._

### Device

_Which microcontroller/board this project targets (e.g. ESP32, Arduino, Raspberry Pi)._

### Display

_What the final display/screen looks like once this project is running._

---

## Español

### Propósito

_Qué hace este proyecto y qué problema resuelve._

### Dispositivo

_Qué microcontrolador/placa usa este proyecto (por ejemplo, ESP32, Arduino, Raspberry Pi)._

### Pantalla final

_Cómo se ve la pantalla final una vez que este proyecto está corriendo._
`
}

// Fixed welcome note, identical across every new project, not interpolated with any
// per-project data. Bilingual title, then an index (mirroring README's own pattern)
// linking both sections, English translation first, the founder's own original
// Spanish text second, byte-for-byte faithful to the wording given for this feature
// (typos included: they are the founder's own authored words, not to be corrected).
export const GREETINGS_MD = `# GREETINGS / HOLA!!!

[English](#english) | [Español](#español)

## English

Hello! I'm AzanoRivers, and it excites me to think you're building something
incredible. MuunCode exists to help people who want to create technology and put it
in everyone's hands, fast enough to leave our planet and reach the Moon. The sky
isn't the limit, but today's technologies are: slow, hard to learn, hard to work
with. That's why MuunCode is built so that, with easy and intuitive web
technologies, you can build solutions that can reach every sector. I wish you great
success in whatever you're building: think big, build bigger. With Colombian heart,
AzanoRivers.

---

## Español

Hola! Soy AzanoRivers y me emociona pensar que estás construyendo algo increible.
MuunCode está pensado para ayudar a personas que quieran crear tecnología y ponerla
a manos de todos, de forma tan rapida que salga de nuestro planeta y llegue a la
luna. El cielo no es el limite, pero sí las tecnologías actuales, son lentas,
dificiles de aprender, de manejar, por eso MuunCode está diseñado para que con
tecnologías web, faciles e intuitivas de usar, puedas construir soluciones que
puedan llegar a todos los sectores.

Te deseo muchos exítos en lo que sea que estés construyendo, piensa alto, construye
en grande. Con Corazón Colombiano, AzanoRivers.
`
