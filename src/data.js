// Editions work like Ciao's flavours: each one recolours the product and the page glow.
export const EDITIONS = [
  { id: 'nebula', name: 'Nebula', tagline: 'Violett wie die Nacht vor dem Drop.', body: '#5a46a8', accent: '#b49cff', glow: '#6a4bc4', deep: '#120a24' },
  { id: 'glacier', name: 'Glacier', tagline: 'Klar, kühl, kompromisslos.', body: '#e8edf4', accent: '#8fdcff', glow: '#2f7fb0', deep: '#06131d' },
  { id: 'ember', name: 'Ember', tagline: 'Für Bässe, die brennen.', body: '#9a1a2c', accent: '#ff6b7d', glow: '#b02a42', deep: '#1c0609' },
  { id: 'volt', name: 'Volt', tagline: 'Schwarz. Mit Stromschlag.', body: '#1f211d', accent: '#c8ff3d', glow: '#4e7d1c', deep: '#0a0f05' },
  { id: 'sand', name: 'Sand', tagline: 'Warm, ruhig, immer dabei.', body: '#d9c2a0', accent: '#ffd79a', glow: '#a07a3c', deep: '#170f05' },
]

export const FEATURES = [
  {
    no: '01',
    kicker: 'Active Noise Cancelling',
    title: ['Stille', 'auf Knopfdruck'],
    text: 'Sechs Mikrofone hören 48.000 Mal pro Sekunde zu und löschen bis zu 45 dB Umgebungslärm. U-Bahn, Großraumbüro, Flugzeug – einfach weg.',
    stat: '-45', unit: 'dB',
  },
  {
    no: '02',
    kicker: 'Spatial Audio',
    title: ['Sound', 'im ganzen Raum'],
    text: 'Dynamisches Head-Tracking setzt jedes Instrument an seinen Platz. Drehst du den Kopf, bleibt die Bühne stehen.',
    stat: '360', unit: '°',
  },
  {
    no: '03',
    kicker: 'Akku',
    title: ['36 Stunden', 'Power'],
    text: '6 Stunden am Stück, 30 weitere aus dem Case. Fünf Minuten laden reichen für eine ganze Stunde Musik.',
    stat: '36', unit: 'h',
  },
  {
    no: '04',
    kicker: 'Fit & Schutz',
    title: ['Gemacht für', 'Bewegung'],
    text: 'Nur 4,3 g pro Earbud, IP54 gegen Schweiß und Regen, drei Aufsatzgrößen für einen Sitz, der hält – im Gym wie im Sprint.',
    stat: '4,3', unit: 'g',
  },
]

export const SPECS = [
  { label: 'Treiber', value: '11 mm', note: 'Custom Dual-Layer' },
  { label: 'Geräuschunterdrückung', value: '-45 dB', note: 'Adaptiv, 6 Mikrofone' },
  { label: 'Akkulaufzeit', value: '36 h', note: '6 h + 30 h mit Case' },
  { label: 'Schnellladen', value: '5 min', note: '= 1 Stunde Musik' },
  { label: 'Bluetooth', value: '5.4', note: 'Multipoint, LE Audio' },
  { label: 'Schutz', value: 'IP54', note: 'Schweiß & Regen' },
  { label: 'Gewicht', value: '4,3 g', note: 'pro Earbud' },
  { label: 'Laden', value: 'USB-C', note: 'und Qi kabellos' },
]

export const FAQ = [
  {
    q: 'Was unterscheidet Airbeam von anderen In-Ears?',
    a: 'Airbeam kombiniert adaptive Geräuschunterdrückung, Spatial Audio mit Head-Tracking und 36 Stunden Akkulaufzeit in einem Case, das in jede Hosentasche passt. Kein Kompromiss zwischen Klang, Komfort und Laufzeit.',
  },
  {
    q: 'Funktioniert Airbeam mit Android und iPhone?',
    a: 'Ja. Airbeam verbindet sich per Bluetooth 5.4 mit jedem Smartphone, Tablet oder Laptop. Dank Multipoint bleibst du sogar mit zwei Geräten gleichzeitig verbunden.',
  },
  {
    q: 'Wie lange hält der Akku wirklich?',
    a: 'Bis zu 6 Stunden Wiedergabe mit aktivem ANC, mit dem Case insgesamt 36 Stunden. Fünf Minuten im Case reichen für rund eine Stunde Musik.',
  },
  {
    q: 'Sind die Earbuds wasserdicht?',
    a: 'Airbeam ist nach IP54 gegen Schweiß, Spritzwasser und Regen geschützt. Zum Schwimmen sind die Earbuds nicht gedacht.',
  },
  {
    q: 'Welche Aufsatzgrößen sind dabei?',
    a: 'Im Karton liegen Silikonaufsätze in S, M und L. In der App findest du einen Passform-Test, der dir sagt, welche Größe am besten abdichtet.',
  },
  {
    q: 'Kann ich mit Airbeam telefonieren?',
    a: 'Klar. Beamforming-Mikrofone und ein Sprachbeschleunigungssensor filtern Wind und Hintergrundgeräusche, damit man dich auch an der Straße klar versteht.',
  },
  {
    q: 'Welche Garantie gibt es?',
    a: 'Auf jedes Airbeam gibt es 2 Jahre Garantie. Innerhalb der ersten 30 Tage kannst du es ohne Angabe von Gründen zurückschicken.',
  },
]

// Order matters: each entry is one scroll "stage" the 3D model animates to.
export const STAGES = ['hero', 'intro', 'f1', 'f2', 'f3', 'f4', 'editions', 'specs', 'faq', 'join']
