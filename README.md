# 👾 Space Invaders

Klasyczna gra arcade Space Invaders napisana w **HTML5 Canvas + TypeScript**.  
Zero zewnętrznych zależności — wszystko rysowane i syntezowane w kodzie.

![Game Screenshot](https://img.shields.io/badge/status-playable-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue) ![Vite](https://img.shields.io/badge/Vite-5.2-purple)

## 🎮 Sterowanie

| Klawisz | Akcja |
|---|---|
| `←` `→` lub `A` `D` | Ruch statku |
| `SPACJA` | Strzał (1 pocisk naraz) |
| `ENTER` | Start / restart |
| `P` lub `ESC` | Pauza |

## 🕹️ Zasady gry

- Zestrzel wszystkich **55 najeźdźców** (siatka 5×11) zanim dotrą do ziemi
- Masz **3 życia** — invadery strzelają losowo w dół
- Chroń się za **4 bunkrami** — degradują się pod ostrzałem
- Zestrzel **UFO** przelatujące u góry dla bonusowych punktów (50–300 pkt)
- Wraz ze śmiercią invaderów **przyspieszają** — ostatni jest najszybszy
- Każdy ukończony poziom to **szybsza** następna fala

## 🏆 Punktacja

| Cel | Punkty |
|---|---|
| Invader (górny rząd) | 30 pkt |
| Invader (środkowe rzędy) | 20 pkt |
| Invader (dolne rzędy) | 10 pkt |
| UFO | 50 / 100 / 150 / 300 pkt |

## 🚀 Uruchomienie

### Opcja 1 — bez instalacji (gotowy build)

Pobierz repo, otwórz `dist/index.html` bezpośrednio w przeglądarce. Nie wymaga Node.js ani serwera.

### Opcja 2 — tryb deweloperski

```bash
npm install
npm run dev       # http://localhost:3000
```

### Opcja 3 — własny build

```bash
npm install
npm run build     # generuje dist/
```

Następnie otwórz `dist/index.html` w przeglądarce.

## 🛠️ Stack technologiczny

| Element | Technologia |
|---|---|
| Język | TypeScript 5.4 |
| Rendering | HTML5 Canvas API |
| Dźwięki | Web Audio API (syntetyzowane, bez plików) |
| Bundler | Vite 5.2 |
| Architektura | State machine + Entity pattern |

## 📁 Struktura projektu

```
src/
├── main.ts               # Entry point
├── Game.ts               # Pętla gry, state machine
├── Renderer.ts           # Całe rysowanie na Canvas
├── InputManager.ts       # Obsługa klawiatury
├── AudioManager.ts       # Synteza dźwięków (Web Audio API)
├── constants.ts          # Stałe i kolory
├── types.ts              # Typy, AABB collision helper
├── GameContext.ts        # Interfejs komunikacji stanów z Game
├── entities/
│   ├── Player.ts         # Statek gracza
│   ├── Bullet.ts         # Pociski (gracza i invaderów)
│   ├── Invader.ts        # Pojedynczy najeźdźca
│   ├── InvaderGrid.ts    # Siatka — ruch, strzelanie, przyspieszanie
│   ├── Shield.ts         # Bunkier (siatka bloków 4×4 px)
│   └── UFO.ts            # Latający talerz
└── states/
    ├── MenuState.ts      # Ekran tytułowy
    ├── PlayingState.ts   # Główna rozgrywka
    ├── GameOverState.ts  # Ekran końca gry
    └── WinState.ts       # Ekran wygranej / następny poziom
```
