/* =========================
   AFFICHAGE DES SECTIONS
========================= */
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');

    sections.forEach(function (section) {
        section.style.display = 'none';
    });

    // Affiche la section cliquée
    document.getElementById(sectionId).style.display = 'block';
}

// Section affichée par défaut (en dehors de la fonction pour éviter une boucle)
showSection('dashboard');


/* c est un graphique dynamique non pas statique comme le code du site chart.js
   il reflete les donnees entree par nous */
let filmsChart = null;/**au debut graph vide */

function updateFilmsChart() {
    const ctx = document.getElementById("filmsChart").getContext("2d");

    // Compter les films par genre
    const genresCount = {};

    films.forEach(film => {
        genresCount[film.genre] = (genresCount[film.genre] || 0) + 1;
    });/** parcourir les films et compter les films par genre */


    /**transforme l objet en teb de label et
     c est le y du graphe */
    const labels = Object.keys(genresCount);
    /**recupere les va; et c est le x du graphe */
    const data = Object.values(genresCount).map(val => parseInt(val));


    // Détruire l'ancien graphique
    if (filmsChart) {
        filmsChart.destroy();
    }

    // Créer le nouveau graphique
    filmsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Nombre de films",
                data: data,
                backgroundColor: "#e77015ff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/**top 10  */
function updateTop10() {
    const top10Container = document.getElementById("top10List");
    top10Container.innerHTML = "";

    // Trier les films par note décroissante et prendre les 10 premiers
    const topFilms = [...films].sort((a, b) => b.note - a.note).slice(0, 10);

    topFilms.forEach(film => {
        const filmDiv = document.createElement("div");

        filmDiv.innerHTML = `
            <img src="${film.image || 'https://via.placeholder.com/100x150'}" alt="${film.titre}">
            <p>${film.titre}</p>
            <p style="font-size:12px; margin-top:2px;">⭐ ${film.note}</p>
        `;

        top10Container.appendChild(filmDiv);
    });
}



/* =========================
   RESET LOCAL STORAGE
========================= */
document.getElementById("resetStorage").addEventListener("click", function () {
    if (confirm("Supprimer tous les films ?")) {
        localStorage.removeItem("films");
        films = [];
        afficherFilms();
        modifierKPI();
    }
});


/* =========================
   GESTION DES FILMS
========================= */
const filmForm = document.getElementById("filmForm");
const filmsTable = document.getElementById("filmsTable");

// Chargement des films depuis le localStorage
let films = JSON.parse(localStorage.getItem("films")) || [];

// Affichage des films
function afficherFilms() {
    filmsTable.innerHTML = "";

    films.forEach(function (film) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><img src="${film.image || 'https://via.placeholder.com/50x75'}" width="50"></td>
            <td>${film.titre}</td>
            <td>${film.genre}</td>
            <td>${film.annee}</td>
            <td>${film.note}</td>
            <td>${film.realisateur}</td>
            <td><button class="btn-delete">Supprimer</button></td>
        `;

        row.querySelector(".btn-delete").addEventListener("click", function () {
            supprimerFilm(film.titre);
        });

        filmsTable.appendChild(row);
    });
}

// Ajout d’un film
filmForm.addEventListener("submit", function (e) {
    e.preventDefault();
    
    const genre = document.getElementById("genre").value.trim();
    const annee = parseInt(document.getElementById("annee").value);
    const note = parseFloat(document.getElementById("note").value);
    const realisateur = document.getElementById("realisateur").value.trim();

   if (! titre || !genre || !annee || isNaN(note) || !realisateur) {
        alert("Tous les champs sont obligatoires");
        return;
    }

    if (note < 0 || note > 10) {
        alert("La note doit être comprise entre 0 et 10");
        return;
    }
    
    let image = document.getElementById("image") 
        ? document.getElementById("image").value.trim() 
        : "https://via.placeholder.com/100x150";


    fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(titre)}&apikey=6edec412`)
        .then(res => res.json())
        .then(data => {
            if (data.Response !== "False" && data.Poster) {
                image = data.Poster;
            }

            // Ajouter le film seulement après avoir récupéré l'image
            films.push({ titre, genre, annee, note, realisateur, image });
            localStorage.setItem("films", JSON.stringify(films));
            afficherFilms();
            updateFilmsChart();
            updateTop10();
            modifierKPI();
            filmForm.reset();
        })
        .catch(err => {
            console.log(err);
            // Ajouter film avec image par défaut si erreur API
            films.push({ titre, genre, annee, note, realisateur, image });
            localStorage.setItem("films", JSON.stringify(films));
            afficherFilms();
            updateFilmsChart();
            updateTop10();
            modifierKPI();
            filmForm.reset();
        });
});


/* =========================
   SUPPRESSION D’UN FILM
========================= */
function supprimerFilm(titre) {
    if (!confirm("Voulez-vous vraiment supprimer ce film ?")) return;

    films = films.filter(film => film.titre !== titre);
    localStorage.setItem("films", JSON.stringify(films));
    afficherFilms();
    modifierKPI();
    updateTop10();
}

afficherFilms();
modifierKPI();
updateFilmsChart();


/* =========================
   KPI
========================= */
function modifierKPI() {
    const totalFilms = films.length;

    let moyenne = 0;
    if (films.length > 0) {
        const somme = films.reduce((total, film) => total + film.note, 0);
        moyenne = (somme / films.length).toFixed(1);
    }

    const realisateurs = [...new Set(films.map(f => f.realisateur))];
    const totalRealisateurs = realisateurs.length;

    const anneeActuelle = new Date().getFullYear();
    const nouveauxFilms = films.filter(f => f.annee === anneeActuelle).length;

    document.getElementById("totalFilms").textContent = totalFilms;
    document.getElementById("noteMoyenne").textContent = moyenne;
    document.getElementById("totalRealisateurs").textContent = totalRealisateurs;
    document.getElementById("nouveauxFilms").textContent = nouveauxFilms;
}


/* =========================
   API OMDB
========================= */
let ratingChart = null;

function fetchOMDBStats() {
    const title = document.getElementById("omdbTitle").value.trim();
    if (!title) {
        alert("Entrez un titre de film");
        return;
    }

    fetch(`https://www.omdbapi.com/?t=${title}&apikey=6edec412`)
        .then(res => res.json())
        .then(data => {
            if (data.Response === "False") {
                alert("Film introuvable sur IMDb");
                clearChart();
                return;
            }
            afficherFilm(data);
            drawRatingChart(data);
        })
        .catch(() => alert("Erreur API OMDB"));
}

function afficherFilm(data) {
    document.getElementById("filmDetails").innerHTML = `
        <h2>${data.Title} (${data.Year})</h2>
        <img src="${data.Poster}" width="200">
        <p><strong>Genre :</strong> ${data.Genre}</p>
        <p><strong>Réalisateur :</strong> ${data.Director}</p>
        <p><strong>Acteurs :</strong> ${data.Actors}</p>
        <p><strong>Résumé :</strong> ${data.Plot}</p>
        <p><strong>Note IMDb :</strong> ${data.imdbRating}</p>
    `;
}
updateTop10();

function drawRatingChart(data) {
    const ctx = document.getElementById("ratingChart");

    if (ratingChart) ratingChart.destroy();

    ratingChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [data.Title],
            datasets: [{
                label: "Note IMDb",
                data: [parseFloat(data.imdbRating)]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { min: 0, max: 10 }
            }
        }
    });
}

function clearChart() {
    if (ratingChart) {
        ratingChart.destroy();
        ratingChart = null;
    }
}






updateFilmsChart();