# 🌤️ Weather-App

A clean, dynamic weather web application built with **Vanilla JavaScript, HTML5, and CSS3**. It fetches real-time meteorological data using the **Open-Meteo API** without requiring an API key, displaying live conditions for major Greek cities while supporting on-demand global city search.

---

## ✨ Features

- **Preconfigured Greek Cities:** Automatically loads live weather cards on startup for **Athens, Thessaloniki, Patras, Heraklion, and Larissa**.
- **Dynamic Global Search:** Search for any city worldwide via the search bar (supports both button click and `Enter` key). Newly searched cities are prepended to the top of the grid.
- **Two-Step API Resolution:**
  1. Converts city names into geographic coordinates (`latitude`, `longitude`) using the **Open-Meteo Geocoding API**.
  2. Queries real-time weather metrics using the **Open-Meteo Forecast API**.
- **Comprehensive Weather Metrics:**
  - Current Temperature (`°C`)
  - Weather Condition Description (mapped from WMO weather codes with matching emojis)
  - Relative Humidity (`%`)
  - Wind Speed (`km/h`)
- **Error Handling:** Gracefully catches and displays user-friendly error messages for empty searches, misspelled/non-existent cities, and network/API failures.
- **Zero Dependencies & No API Key:** Runs directly in the browser using native `fetch` and `async/await`.

---

## 📁 Project Structure

```text
Weather-App/
├── index.html   # Main HTML layout (search bar, error banner, weather grid)
├── style.css      # Responsive CSS Grid styling and card components
└── app.js         # Core logic, Open-Meteo API calls, WMO code mapping & DOM manipulation
