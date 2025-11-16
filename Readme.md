# 🗺️ GeoGuessr: Turkey Province Guessing Game (Web GIS Project)

This project is a GeoGame developed as part of the **GMT 458 – Web GIS** course. The player’s goal is to identify a hidden province in Turkey using geographic knowledge and spatial reasoning—under limited lives and a strict time limit.

---

## 🎯 Project Goals and Key Components

| Component | Requirement Fulfillment | Description |
| :--- | :--- | :--- |
| **Geo-Component** | Province-based GeoJSON Data | A spatial database of Turkey’s provincial boundaries is used. Guesses are visualized on the map through color changes. |
| **Temporal & High-Score** | Yes (60-second time limit) | The game includes a 60-second timer. Persistent high-score tracking is handled via Local Storage. |
| **Advanced Visualization** | Red-to-Green Distance Scale | A reversed distance-based color scale is used (Dark Green = Closest proximity, Red = Farthest distance). |
| **Interaction Stability** | Life System & Score Tracking | Player interaction is managed through a limited life/guess system. |

---

## II. Visual Design & User Experience (UX)

The game layout is responsive and prioritizes map interaction and clear feedback.

### A. Frontend Layout & Structure

| Section | Position | Functionality |
| :--- | :--- | :--- |
| **Map** | Left (Main Area) | Provinces are drawn using Leaflet. Colors change based on guess proximity. |
| **Control Panel** | Right (Fixed Width) | Contains username, scoreboard, hints, and statistics. Moves below the map on mobile devices. |
| **Life Counter** | Top-Right (On Map) | Remaining lives are displayed as large red hearts (❤️). |
| **Start Modal** | Centered on Map | Displays game rules, life mechanics, and the time limit before gameplay begins. |
#### B. Frontend Visual Design and Layout Mockup

![GeoGame Arayüz Taslağı](geogametasarım.jpg)
### C. Feedback & Hint System

- **Color Scale:** As distance decreases, colors transition toward dark green, providing intuitive positive feedback.  
- **District Hint:** A representative district of the hidden province is shown as a hint, adding challenge beyond distance clues.

---

## III. Gameplay Scenarios & Rule Details

### A. Gameplay Mechanics

| Scenario | Rule | Effect |
| :--- | :--- | :--- |
| **Time Limit** | 60 seconds total. | If the timer ends, the player loses. |
| **Life System** | Start with **3 lives**; every **5 incorrect guesses** costs 1 life. | Total possible guesses = 15. |
| **High Score** | Based on minimal guesses and fastest completion. | Stored via Local Storage for persistence. |

### B. Technical Requirements

- **Frontend:** HTML, CSS (Responsive), JavaScript  
- **Mapping Library:** **Leaflet.js**  
- **Bonus Feature:** Local Storage for permanent score tracking + Life system for added challenge  

---

## IV. User Flow (UX Flow)

### A. Start
- User enters **username** → Clicks **"Start Game"** → Map loads → Timer starts.

### B. Game Loop
- User enters a **province name** or **clicks on the map**.  
- **Incorrect guess** → Color feedback applied.  
- Province is **colored based on distance** to the hidden province.  
- **Every 5 incorrect guesses** → 1 life is lost.

### C. End
- **Correct guess** → Win screen + score recorded.  
- **Time runs out** or **lives = 0** → Lose screen.

---

## V. Game Data Flow & Technical Architecture

This diagram illustrates how user actions and game logic interact to update the map, track progress, and determine win/lose outcomes.

- **User Guess** → **processGuess()** → **Haversine Distance Calculation** → **Distance → Color Scale** → **Leaflet Map Update** → **Lives + Timer + Guess History Update** → **Win / Lose Check**


