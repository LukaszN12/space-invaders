# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```powershell
npm install          # instalacja zależności
npm run dev          # serwer deweloperski na http://localhost:3000
npm run build        # build produkcyjny → dist/ (format IIFE, działa z file://)
npx tsc --noEmit     # sprawdzenie typów bez generowania plików
```

> Node.js może nie być w `PATH` po instalacji — jeśli `npm` nie działa, dodaj: `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH`

## Architektura

### Pętla gry i state machine (`Game.ts`)

`Game` implementuje `GameContext` (interfejs z `GameContext.ts`) i jest właścicielem całego cyklu życia aplikacji: pętli `requestAnimationFrame`, state machine oraz globalnego stanu (score, lives, level). Stany komunikują się z resztą gry **tylko przez `GameContext`** — nigdy nie importują `Game` bezpośrednio.

Każdy stan (`MenuState`, `PlayingState`, `GameOverState`, `WinState`) dostaje w konstruktorze `GameContext`, `InputManager` i/lub `AudioManager`. Renderer trafia do stanów jako parametr metody `render(renderer)`.

### PlayingState — centrum rozgrywki

`PlayingState` jest jedyną klasą która tworzy i posiada wszystkie encje. Przy każdym `onEnter()` encje są tworzone od nowa (reset poziomu). Kolejność w `update()` jest istotna:

1. Obsługa pauzy
2. Jeśli gracz nie żyje — odlicz animację śmierci, potem respawn lub GAME_OVER
3. `handleInput` → `player.update` → `playerBullet.update` → `grid.update` → `ufo.update`
4. `checkCollisions()` — AABB w ustalonej kolejności (patrz niżej)
5. `checkBoundaryConditions()` — wygrana / przegrana

### InvaderGrid — ruch timerowy

Invadery poruszają się **dyskretnymi krokami**, nie płynnie. `moveTimer` akumuluje czas w ms; gdy przekroczy `computeMoveInterval()`, wywołuje `step()`. Interwał maleje liniowo od `BASE_INTERVAL=800ms` (55 invaderów) do `MIN_INTERVAL=50ms` (1 invader). Przy każdym `step()`:
- jeśli `stepPending=true` → przesuń wszystkich w dół o `STEP_DOWN`
- jeśli nie → przesuń poziomo, sprawdź krawędź, ustaw `stepPending=true` i odwróć kierunek

Strzelanie jest **oddzielone od ruchu** — działa na własnym `shootTimer` opartym o `SHOOT_PROB_PER_SEC`.

### Kolejność detekcji kolizji (`checkCollisions`)

Kolejność ma znaczenie (unikanie podwójnych trafień):
1. Pocisk gracza vs invadery
2. Pocisk gracza vs UFO
3. Pocisk gracza vs bunkry
4. Pociski invaderów vs gracz
5. Pociski invaderów vs bunkry
6. Invadery vs bunkry (pasywne — gdy invadery są nisko)

### Renderer — czysty widok

`Renderer` nie zawiera żadnej logiki gry. Rysuje pixel-art invaderów z hardkodowanych tablic bitowych `SPRITES` (3 typy × 2 klatki animacji, 11×8 pikseli, skala 2px). Bunkry rysowane jako siatka `bool[][]` bloków 4×4 px. Dźwięki wyłącznie w `AudioManager` (Web Audio API, zero plików audio).

### Build produkcyjny

`vite.config.ts` zawiera plugin `removeModuleType()` który po buildzie usuwa z HTML atrybuty `type="module"` i `crossorigin` oraz dodaje `defer`. Dzięki temu `dist/index.html` działa bezpośrednio z protokołu `file://` bez serwera.
