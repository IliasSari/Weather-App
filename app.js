 // 1. Προκαθορισμένη λίστα με τις βασικές πόλεις της Ελλάδας
    let DEFAULT_CITIES = ["Αθήνα", "Θεσσαλονίκη", "Πάτρα", "Ηράκλειο", "Λάρισα"];

    // Λεξικό αντιστοίχισης κωδικών καιρού WMO σε ελληνική περιγραφή
    const WMO_CODES = {
      0: "Αίθριος / Ηλιοφάνεια ☀️",
      1: "Κυρίως αίθριος 🌤️",
      2: "Μερική συννεφιά ⛅",
      3: "Συννεφιά ☁️",
      45: "Ομίχλη 🌫️",
      48: "Παγωμένη ομίχλη 🌫️",
      51: "Ελαφρύ ψιλόβροχο 🌦️",
      53: "Μέτριο ψιλόβροχο 🌦️",
      55: "Πυκνό ψιλόβροχο 🌧️",
      61: "Ελαφριά βροχή 🌧️",
      63: "Μέτρια βροχή 🌧️",
      65: "Ισχυρή βροχή 🌧️",
      71: "Ελαφριά χιονόπτωση 🌨️",
      73: "Μέτρια χιονόπτωση 🌨️",
      75: "Ισχυρή χιονόπτωση ❄️",
      80: "Μπόρες 🌦️",
      81: "Μέτριες μπόρες 🌧️",
      82: "Ισχυρές μπόρες ⛈️",
      95: "Καταιγίδα ⛈️",
      96: "Καταιγίδα με χαλάζι ⛈️",
      99: "Ισχυρή καταιγίδα με χαλάζι ⛈️"
    };

    const grid = document.getElementById("weatherGrid");
    const errorBox = document.getElementById("errorBox");
    const cityInput = document.getElementById("cityInput");
    const searchBtn = document.getElementById("searchBtn");

    // Εμφάνιση μηνύματος σφάλματος στον χρήστη
    function showError(message) {
      errorBox.textContent = message;
      errorBox.style.display = "block";
    }

    // Απόκρυψη μηνύματος σφάλματος
    function clearError() {
      errorBox.textContent = "";
      errorBox.style.display = "none";
    }

    // 2. Εύρεση συντεταγμένων της πόλης μέσω του Open-Meteo Geocoding API
    async function getCoordinates(cityName) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=el&format=json`;
      const response = await fetch(geoUrl);

      if (!response.ok) {
        throw new Error("Αποτυχία σύνδεσης με την υπηρεσία γεωεντοπισμού.");
      }

      const data = await response.json();

      // Αν δεν βρεθεί η πόλη, πετάμε σφάλμα
      if (!data.results || data.results.length === 0) {
        throw new Error(`Δεν βρέθηκε η πόλη "${cityName}". Ελέγξτε την ορθογραφία.`);
      }

      const place = data.results[0];
      return {
        name: place.name,
        country: place.country || "",
        lat: place.latitude,
        lon: place.longitude
      };
    }

    // 3. Λήψη δεδομένων καιρού και εμφάνιση κάρτας
    async function fetchAndRenderWeather(cityName, prepend = false) {
      try {
        clearError();

        // Βήμα Α: Παίρνουμε τις συντεταγμένες
        const location = await getCoordinates(cityName);

        // ΕΛΕΓΧΟΣ ΔΙΠΛΟΕΓΓΡΑΦΗΣ:
        const existingCards = Array.from(grid.querySelectorAll(".card"));
        const isDuplicate = existingCards.some(card => {
          // Παίρνουμε το όνομα είτε από το dataset είτε απευθείας από το κείμενο του h2
          const h2Element = card.querySelector("h2");
          let existingName = card.dataset.cityName || "";
          
          if (!existingName && h2Element) {
            // Αν λείπει το dataset, παίρνουμε το πρώτο κομμάτι του κειμένου του h2 (πριν το <small>)
            existingName = h2Element.childNodes[0].nodeValue.trim();
          }

          return existingName.toLowerCase() === location.name.toLowerCase();
        });

        if (isDuplicate) {
          showError(`Η πόλη "${location.name}" υπάρχει ήδη στην λίστα!`);
          return; // Σταματάμε αν υπάρχει ήδη
        }
        // Βήμα Β: Τραβάμε τον τρέχοντα καιρό από το Open-Meteo API
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=auto`;
        const response = await fetch(weatherUrl);

        if (!response.ok) {
          throw new Error("Αποτυχία λήψης δεδομένων καιρού από το API.");
        }

        const data = await response.json();
        const current = data.current;

        const description = WMO_CODES[current.weather_code] || `Κωδικός καιρού: ${current.weather_code}`;

        // Δημιουργία κάρτας HTML για την πόλη
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h2>${location.name} <small style="font-weight:normal; color:#64748b;">(${location.country})</small></h2>
          <div class="temp">${current.temperature_2m} °C</div>
          <div class="meta"><strong>Κατάσταση:</strong> ${description}</div>
          <div class="meta"><strong>Υγρασία:</strong> ${current.relative_humidity_2m} %</div>
          <div class="meta"><strong>Άνεμος:</strong> ${current.wind_speed_10m} km/h</div>
          <button class="delete-btn" title="Διαγραφή">Χ</button>
          `;
        card.querySelector(".delete-btn").addEventListener("click", () => card.remove());
        // Αν είναι αναζήτηση χρήστη μπαίνει πρώτη-πρώτη, αλλιώς στο τέλος
        if (prepend) {
          grid.prepend(card);
        } else {
          grid.appendChild(card);
        }

      } catch (error) {
        // 5. Διαχείριση σφαλμάτων (λάθος πόλη ή πρόβλημα δικτύου/API)
        showError(error.message || "Παρουσιάστηκε σφάλμα κατά την επικοινωνία με το API.");
      }
    }

    // 4. Διαχείριση δυναμικής αναζήτησης από τον χρήστη
    function handleSearch() {
      const city = cityInput.value.trim();
      if (!city) {
        showError("Παρακαλώ πληκτρολογήστε ένα όνομα πόλης.");
        return;
      }
      fetchAndRenderWeather(city, true);
      cityInput.value = "";
    }

    searchBtn.addEventListener("click", handleSearch);
    cityInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSearch();
    });

    // Αρχική φόρτωση των 5 προκαθορισμένων πόλεων
    async function init() {
      for (const city of DEFAULT_CITIES) {
        await fetchAndRenderWeather(city);
      }
    }

    init();