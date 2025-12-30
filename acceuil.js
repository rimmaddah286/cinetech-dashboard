/**du side bar active pour qu elle s ouvre */

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});



/* =========================
   AFFICHAGE DES SECTIONS (rim)
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
   il reflete les donnees entree par nous (rim) */
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
                backgroundColor: "pink"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/**top 10 (rim) */
function updateTop10() {
    const top10Container = document.getElementById("top10List");
    top10Container.innerHTML = "";

    // Trier les films par note décroissante et prendre les 10 premiers
    const topFilms = [...films].sort((a, b) => b.note - a.note).slice(0, 10);

    topFilms.forEach(film => {
        const div = document.createElement("div");
        div.classList.add("top-film");

        div.innerHTML = `
           <img src="${film.image}" alt="${film.titre}" width="100">
            <p>${film.titre}</p>
            <p style="font-size:12px; margin-top:2px;">⭐ ${film.note}</p>
        `;

        top10Container.appendChild(div);
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
function afficherFilms(liste = films) {
    filmsTable.innerHTML = "";

    liste.forEach(function (film) {
        const row = document.createElement("tr");

        row.innerHTML = `
            
            <td>${film.titre}</td>
            <td>${film.genre}</td>
            <td>${film.annee}</td>
            <td>${film.note}</td>
            <td>${film.realisateur}</td>
            <td><button class="btn-delete">Supprimer</button></td>
            <td><button class="btn-edit">Modifier</button></td>
        `;

        row.querySelector(".btn-delete").addEventListener("click", function () {
            supprimerFilm(film.titre);
        });
        row.querySelector(".btn-edit").addEventListener("click", function () {
         modifierFilm(film);
        });
        filmsTable.appendChild(row);
    });
}


// Ajout d’un film
filmForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const titre = document.getElementById("titre").value.trim();
    const genre = document.getElementById("genre").value.trim();
    const annee = parseInt(document.getElementById("annee").value);
    const note = parseFloat(document.getElementById("note").value);
    const realisateur = document.getElementById("realisateur").value.trim();

    if (!titre || !genre || !annee || isNaN(note) || !realisateur) {
        alert("Tous les champs sont obligatoires");
        return;
    }
    if (note < 0 || note > 10) {
        alert("La note doit être comprise entre 0 et 10");
        return;
    }

    // Fetch de l'image depuis l'API OMDB (rim)
    fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(titre)}&apikey=6edec412`)
        .then(res => res.json())
        .then(data => {
            // Si l'API renvoie un poster valide, on l'utilise, sinon image par défaut
            const image = (data.Response !== "False" && data.Poster && data.Poster !== "N/A")
                ? data.Poster
                : "https://via.placeholder.com/100x150";

            // Création de l'objet film
            const film = {
                titre: titre,
                genre: genre,
                annee: annee,
                note: note,
                realisateur: realisateur,
                image: image
            };

            // Ajout au tableau
            films.push(film);
            localStorage.setItem("films", JSON.stringify(films));

            // Mise à jour affichage
            afficherFilms();
            modifierKPI();
            updateFilmsChart();
            updateTop10();

            // Reset du formulaire
            filmForm.reset();
        })
        .catch(err => {
            console.error(err);
            alert("Erreur lors de la récupération de l'image, le film sera ajouté avec une image par défaut.");

            const film = {
                titre: titre,
                genre: genre,
                annee: annee,
                note: note,
                realisateur: realisateur,
                image: "https://via.placeholder.com/100x150"
            };

            films.push(film);
            localStorage.setItem("films", JSON.stringify(films));

            afficherFilms();
            modifierKPI();
            updateFilmsChart();
            updateTop10();

            filmForm.reset();
        });
        var sortSelect = document.getElementById("sortSelect");


});
 
sortSelect.addEventListener("change", function () {
  var critere = sortSelect.value;

  if (critere === "titre") {
    films.sort(function (a, b) {
      return a.titre.localeCompare(b.titre);
    });
  } 
  else if (critere === "annee") {
    films.sort(function (a, b) {
      return a.annee - b.annee;
    });
  } 
  else if (critere === "note") {
    films.sort(function (a, b) {
      return b.note - a.note;
    });
  }

  afficherFilms(films);
});
var searchInput = document.getElementById("searchInput");

function Recherche() {
  var valeur = searchInput.value.toLowerCase();

  if (valeur === "") {
    afficherFilms(films);
    return;
  }

  var filmsFiltres = films.filter(function (film) {
    return film.titre && film.titre.toLowerCase().includes(valeur);
  });

  afficherFilms(filmsFiltres);
}

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
/*==================
modification
===================*/
function modifierFilm(film) {
    filmEnCours = film;

    document.getElementById("titre").value = film.titre;
    document.getElementById("genre").value = film.genre;
    document.getElementById("annee").value = film.annee;
    document.getElementById("note").value = film.note;
    document.getElementById("realisateur").value = film.realisateur;

    document.querySelector(".btn-save").textContent = "Modifier";
}

/* =========================
   KPI DASHBOARD (rim)
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
   PARTIE RÉALISATEURS
========================= */

let realisateurs = [];
function updateKPI() {      
    const span = document.getElementById("kpiRealisateurs");
    if (!span) {
        console.error("Span KPI introuvable");
        return;
    }
    span.textContent = realisateurs.length;
}

function addRealisateur(e) {
    e.preventDefault();

    const input = document.getElementById("nomRealisateur");
    const nom = input.value.trim();
    if (!nom) return;

    realisateurs.push(nom);
    input.value = "";

    afficherRealisateurs();
    updateKPI();
}
updateKPI();

function afficherRealisateurs() {
    const ul = document.getElementById("listeRealisateurs");
    ul.innerHTML = "";

    realisateurs.forEach((nom, index) => {
        const li = document.createElement("li");
        li.textContent = nom;

        const btn = document.createElement("button");
        btn.textContent = "Supprimer";
        btn.classList.add("btn-supprimer");

        btn.addEventListener("click", () => {
            realisateurs.splice(index, 1);
            afficherRealisateurs();
        });

        li.appendChild(btn);
        ul.appendChild(li);
    });
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

    fetch(`https://www.omdbapi.com/?t=${title}&apikey=6edec412 `)
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



/** buton recherche (rim) */
const rechercher = document.getElementById("searchInputtt");
const rechercherbutton = document.getElementById("buttonSearch");
console.log(rechercherbutton); 

rechercherbutton.addEventListener("click", function () {
    const valeur = rechercher.value.toLowerCase().trim();

    // Si c vide on affiche tous les films
    if (valeur === "") {
        afficherFilms();
        return;
    }

    // Filtrer par titre OU réalisateur
    const filmsFiltres = films.filter(film =>
        film.titre.toLowerCase().includes(valeur) ||
        film.realisateur.toLowerCase().includes(valeur)
    );

    afficherFilms(filmsFiltres);
    
});


