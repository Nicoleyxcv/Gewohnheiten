
/* ==================================================
   MY HABIT TRACKER
   Vollständige JavaScript-Datei
================================================== */

// --------------------------------------------------
// 1. HTML-ELEMENTE
// --------------------------------------------------

const habitNameInput = document.getElementById("habitName");
const habitColorInput = document.getElementById("habitColor");
const addHabitButton = document.getElementById("addHabitButton");

const habitList = document.getElementById("habitList");

const yearViewButton = document.getElementById("yearView");
const monthViewButton = document.getElementById("monthView");

const todayChecklist = document.getElementById("todayChecklist");
const todayDateElement = document.getElementById("todayDate");


// Prüfen, ob alle wichtigen HTML-Elemente vorhanden sind
if (
    !habitNameInput ||
    !habitColorInput ||
    !addHabitButton ||
    !habitList ||
    !yearViewButton ||
    !monthViewButton ||
    !todayChecklist ||
    !todayDateElement
) {
    console.error(
        "Fehler: Mindestens ein HTML-Element wurde nicht gefunden. Bitte IDs in index.html prüfen."
    );
}


// --------------------------------------------------
// 2. EINSTELLUNGEN
// --------------------------------------------------

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

let currentView = "year";


// --------------------------------------------------
// 3. DATEN LADEN
// --------------------------------------------------

function loadHabits() {
    try {
        const savedData = localStorage.getItem("habits");

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        return parsedData.map(habit => ({
            id: habit.id,
            name: String(habit.name || "Neuer Habit"),
            color: /^#[0-9a-f]{6}$/i.test(habit.color)
                ? habit.color
                : "#39d98a",
            completed: Array.isArray(habit.completed)
                ? habit.completed
                : []
        }));

    } catch (error) {
        console.error("Fehler beim Laden der Habits:", error);
        return [];
    }
}

let habits = loadHabits();


// --------------------------------------------------
// 4. DATEN SPEICHERN
// --------------------------------------------------

function saveHabits() {
    try {
        localStorage.setItem("habits", JSON.stringify(habits));
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
        alert("Deine Daten konnten leider nicht gespeichert werden.");
    }
}


// --------------------------------------------------
// 5. DATUM FORMATIEREN
// --------------------------------------------------

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// --------------------------------------------------
// 6. NEUEN HABIT HINZUFÜGEN
// --------------------------------------------------

function addHabit() {
    const name = habitNameInput.value.trim();
    const color = habitColorInput.value;

    if (name.length === 0) {
        alert("Bitte gib einen Namen für deinen Habit ein!");
        habitNameInput.focus();
        return;
    }

    const newHabit = {
        id: Date.now() + Math.random(),
        name: name,
        color: color,
        completed: []
    };

    habits.push(newHabit);

    saveHabits();

    habitNameInput.value = "";
    habitColorInput.value = "#39d98a";

    renderHabits();

    habitNameInput.focus();

    console.log("Neuer Habit hinzugefügt:", name);
}


// Event für Hinzufügen-Button
addHabitButton.addEventListener("click", function(event) {
    event.preventDefault();
    addHabit();
});


// Habit auch mit Enter hinzufügen
habitNameInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addHabit();
    }
});


// --------------------------------------------------
// 7. HABIT BEARBEITEN
// --------------------------------------------------

function editHabit(id) {
    const habit = habits.find(item => item.id === id);

    if (!habit) return;

    const newName = prompt("Neuer Name:", habit.name);

    if (newName === null) return;

    if (newName.trim() === "") {
        alert("Der Name darf nicht leer sein!");
        return;
    }

    const newColor = prompt(
        "Neue Farbe als HEX-Code eingeben:",
        habit.color
    );

    habit.name = newName.trim();

    if (
        newColor !== null &&
        /^#[0-9a-fA-F]{6}$/.test(newColor.trim())
    ) {
        habit.color = newColor.trim();
    }

    saveHabits();
    renderHabits();
}


// --------------------------------------------------
// 8. HABIT LÖSCHEN
// --------------------------------------------------

function deleteHabit(id) {
    const habit = habits.find(item => item.id === id);

    if (!habit) return;

    const confirmed = confirm(
        `Möchtest du "${habit.name}" wirklich löschen?`
    );

    if (!confirmed) return;

    habits = habits.filter(item => item.id !== id);

    saveHabits();
    renderHabits();
}


// --------------------------------------------------
// 9. TAG ABHAKEN
// --------------------------------------------------

function toggleDay(habitId, dateString) {
    const habit = habits.find(item => item.id === habitId);

    if (!habit) return;

    const index = habit.completed.indexOf(dateString);

    if (index === -1) {
        habit.completed.push(dateString);
    } else {
        habit.completed.splice(index, 1);
    }

    saveHabits();
    renderHabits();
}


// --------------------------------------------------
// 10. STREAK BERECHNEN
// --------------------------------------------------

function calculateStreak(habit) {
    const completed = new Set(habit.completed);
    const date = new Date();

    if (!completed.has(formatDate(date))) {
        date.setDate(date.getDate() - 1);
    }

    let streak = 0;

    while (completed.has(formatDate(date))) {
        streak++;
        date.setDate(date.getDate() - 1);
    }

    return streak;
}


// --------------------------------------------------
// 11. KALENDERDATEN ERSTELLEN
// --------------------------------------------------

function getCalendarDates() {
    let startDate;
    let endDate;

    if (currentView === "year") {
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
    } else {
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0);
    }

    const dates = [];

    // Montag als erster Wochentag
    const offset = (startDate.getDay() + 6) % 7;

    // Leere Felder vor dem ersten Tag
    for (let i = 0; i < offset; i++) {
        dates.push(null);
    }

    const date = new Date(startDate);

    while (date <= endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return dates;
}


// --------------------------------------------------
// 12. KALENDER ERSTELLEN
// --------------------------------------------------

function createCalendar(habit) {
    const calendar = document.createElement("div");
    calendar.className = "calendar-wrapper";

    // Wochentage
    const weekdays = document.createElement("div");
    weekdays.className = "weekdays";

    ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].forEach(day => {
        const label = document.createElement("span");
        label.textContent = day;
        weekdays.appendChild(label);
    });

    // Kalenderinhalt
    const content = document.createElement("div");
    content.className = "calendar-content";

    // Monatsnamen
    const monthLabels = document.createElement("div");
    monthLabels.className = "month-labels";

    if (currentView === "year") {
        const months = [
            "Jan", "Feb", "Mär", "Apr",
            "Mai", "Jun", "Jul", "Aug",
            "Sep", "Okt", "Nov", "Dez"
        ];

        months.forEach(month => {
            const label = document.createElement("span");
            label.textContent = month;
            monthLabels.appendChild(label);
        });

    } else {
        const label = document.createElement("span");

        label.textContent = new Date(
            currentYear,
            currentMonth,
            1
        ).toLocaleDateString("de-DE", {
            month: "long",
            year: "numeric"
        });

        monthLabels.appendChild(label);
    }

    // Aktivitätsraster
    const grid = document.createElement("div");
    grid.className = "activity-grid";

    const dates = getCalendarDates();
    const todayString = formatDate(new Date());

    dates.forEach(date => {
        if (date === null) {
            const empty = document.createElement("div");
            empty.className = "activity-day empty";
            grid.appendChild(empty);
            return;
        }

        const dateString = formatDate(date);

        const square = document.createElement("button");
        square.type = "button";
        square.className = "activity-day";

        const isCompleted = habit.completed.includes(dateString);
        const isFuture = dateString > todayString;

        if (isCompleted) {
            square.classList.add("completed");
            square.style.backgroundColor = habit.color;
        }

        if (isFuture) {
            square.classList.add("future");
            square.disabled = true;
        }

        square.title = date.toLocaleDateString("de-DE");

        square.addEventListener("click", function() {
            toggleDay(habit.id, dateString);
        });

        grid.appendChild(square);
    });

    content.append(monthLabels, grid);
    calendar.append(weekdays, content);

    return calendar;
}


// --------------------------------------------------
// 13. EINEN HABIT ANZEIGEN
// --------------------------------------------------

function createHabitElement(habit) {
    const card = document.createElement("div");
    card.className = "habit-card";

    const header = document.createElement("div");
    header.className = "habit-card-header";

    const name = document.createElement("h3");
    name.textContent = habit.name;
    name.style.color = habit.color;

    const streak = document.createElement("span");
    streak.className = "habit-streak";
    streak.textContent = `🔥 ${calculateStreak(habit)} Tage`;

    const actions = document.createElement("div");
    actions.className = "habit-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Bearbeiten";
    editButton.className = "edit-button";

    editButton.addEventListener("click", function() {
        editHabit(habit.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Löschen";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", function() {
        deleteHabit(habit.id);
    });

    actions.append(editButton, deleteButton);
    header.append(name, streak, actions);

    const calendar = createCalendar(habit);

    card.append(header, calendar);

    return card;
}


// --------------------------------------------------
// 14. TÄGLICHE CHECKLISTE
// --------------------------------------------------

function renderDailyChecklist() {
    todayChecklist.innerHTML = "";

    const todayString = formatDate(new Date());

    todayDateElement.textContent = new Date().toLocaleDateString(
        "de-DE",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    );

    if (habits.length === 0) {
        const message = document.createElement("p");

        message.textContent = "Erstelle zuerst einen Habit!";
        message.className = "checklist-empty";

        todayChecklist.appendChild(message);
        return;
    }

    habits.forEach(habit => {
        const row = document.createElement("label");
        row.className = "checklist-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        checkbox.checked = habit.completed.includes(todayString);

        const color = document.createElement("span");
        color.className = "checklist-color";
        color.style.backgroundColor = habit.color;

        const name = document.createElement("span");
        name.className = "checklist-name";
        name.textContent = habit.name;

        if (checkbox.checked) {
            name.classList.add("checked");
        }

        checkbox.addEventListener("change", function() {
            toggleDay(habit.id, todayString);
        });

        row.append(checkbox, color, name);

        todayChecklist.appendChild(row);
    });
}


// --------------------------------------------------
// 15. ALLE HABITS ANZEIGEN
// --------------------------------------------------

function renderHabits() {
    habitList.innerHTML = "";

    renderDailyChecklist();

    if (habits.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";

        const firstLine = document.createElement("p");
        firstLine.textContent = "Noch keine Habits vorhanden.";

        const secondLine = document.createElement("p");
        secondLine.textContent = "Erstelle deine erste Gewohnheit!";

        empty.append(firstLine, secondLine);

        habitList.appendChild(empty);
        return;
    }

    habits.forEach(habit => {
        habitList.appendChild(createHabitElement(habit));
    });
}


// --------------------------------------------------
// 16. JAHRESANSICHT
// --------------------------------------------------

yearViewButton.addEventListener("click", function() {
    currentView = "year";

    yearViewButton.classList.add("active");
    monthViewButton.classList.remove("active");

    renderHabits();
});


// --------------------------------------------------
// 17. MONATSANSICHT
// --------------------------------------------------

monthViewButton.addEventListener("click", function() {
    currentView = "month";

    monthViewButton.classList.add("active");
    yearViewButton.classList.remove("active");

    renderHabits();
});


// --------------------------------------------------
// 18. BACKUP EXPORTIEREN
// --------------------------------------------------

function exportBackup() {
    const data = JSON.stringify(habits, null, 2);

    const blob = new Blob([data], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "habit-tracker-backup.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}


// --------------------------------------------------
// 19. BACKUP BUTTON ERSTELLEN
// --------------------------------------------------

const trackerHeader = document.querySelector(".tracker-header");

if (trackerHeader) {
    const backupButton = document.createElement("button");

    backupButton.type = "button";
    backupButton.textContent = "↓ Backup exportieren";
    backupButton.className = "backup-button";

    backupButton.addEventListener("click", exportBackup);

    trackerHeader.appendChild(backupButton);
}


// --------------------------------------------------
// 20. START
// --------------------------------------------------

renderHabits();

console.log("Habit Tracker erfolgreich gestartet!");
