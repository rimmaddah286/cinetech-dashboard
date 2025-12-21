function showSection(sectionid)
{   
    const sec=document.querySelectorAll('.section');
    sec.forEach(function(sections)
             {
                   sections.style.display='none';
             });

    /**affiche la section cliquee */
    document.getElementById(sectionid).style.display = 'block';
   
}

 /**section affichee au debut par defaut a l exterieur
  *  pour ne ps avoir une boucle imbriquee */
showSection('dashboard');


const ctx = document.getElementById('filmsChart').getContext('2d');

const filmsChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Action', 'Comedie', 'Horreur', 'Romantique', 'Policier', 'Anime'],
        datasets: [{
            label: 'Nombre de films',
            data: [12, 19, 8, 6, 4 , 25],
            backgroundColor: ['#4e73df',
                    '#1cc88a',
                    '#36b9cc',
                    'pink',
                    '#f04c3dff',
                    'rgba(187, 252, 9, 1)']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

document.getElementById("resetStorage").addEventListener("click", function () {
  if (confirm("Supprimer tous les films ?")) {
    localStorage.removeItem("films");
    films = [];
    afficherFilms(films);
  }
});

// Récupération des éléments
var filmForm = document.getElementById("filmForm");
var filmsTable = document.getElementById("filmsTable");

// Charger les films existants
var films = JSON.parse(localStorage.getItem("films")) || [];

// Afficher les films
function afficherFilms() {
  filmsTable.innerHTML = "";

  for (var i = 0; i < films.length; i++) {
    var film = films[i];

    var row = document.createElement("tr");

    row.innerHTML =
      "<td>" + film.titre + "</td>" +
      "<td>" + film.genre + "</td>" +
      "<td>" + film.annee + "</td>" +
      "<td>" + film.note + "</td>" +
      "<td>" + film.realisateur + "</td>" +
      "<td><button class='btn-delete'>Supprimer</button></td>";

    row.querySelector(".btn-delete")
      .addEventListener("click", function () {
        supprimerFilm(film.titre);
      });

    filmsTable.appendChild(row);
  }
}

// Ajouter un film (FORMULAIRE VALIDÉ)
filmForm.addEventListener("submit", function (e) {
  e.preventDefault();

  var titre = document.getElementById("titre").value.trim();
  var genre = document.getElementById("genre").value.trim();
  var annee = parseInt(document.getElementById("annee").value);
  var note = parseFloat(document.getElementById("note").value);
  var realisateur = document.getElementById("realisateur").value.trim();

  // Validation
  if (!titre || !genre || !annee || !note || !realisateur) {
    alert("Tous les champs sont obligatoires");
    return;
  }

  if (note < 0 || note > 10) {
    alert("La note doit être comprise entre 0 et 10");
    return;
  }

  // Création de l'objet film
  var film = {
    titre: titre,
    genre: genre,
    annee: annee,
    note: note,
    realisateur: realisateur
  };

  // Ajout au tableau
  films.push(film);
  updateKPI();

  // Sauvegarde
  localStorage.setItem("films", JSON.stringify(films));

  // Affichage immédiat
  afficherFilms();

  // Réinitialisation du formulaire
  filmForm.reset();
});
var sortSelect = document.getElementById("sortSelect");

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
function supprimerFilm(titre) {
  if (!confirm("Voulez-vous vraiment supprimer ce film ?")) return;

  films = films.filter(film => film.titre !== titre);
  localStorage.setItem("films", JSON.stringify(films));
  afficherFilms();
  updateKPI();  
}
   
afficherFilms(films);


/* fct KPI */
 function updateKPI ()
 {  /*kpi total film */
    const totalFilms =films.length ;
    /* kpi myenne */
    let moyenne=0;
    if (films.length >0)
    {
        const somme = films.reduce(    
            function additionNotes(total, film) 
                     {
                          return total + film.note;
                      }, 0);/* la fct additionNote est le callback de reduce
                             le 0 est la valeur init de total */
        moyenne = somme / films.length.toFixed(1); /* cad un chiffre apres la virgule */

    }
    /*kpi realisateur */
    const realisateurs = [...new Set(films.map(f => f.realisateur))];
    const totalRealisateurs = realisateurs.length;

    /* kpi nv films */
    const anneeActuelle = new Date().getFullYear(); /* new date on acree un objet qui va nous donnez
                                                     la date et l heure mais on va prendre justa la 
                                                     date grace a getFullYear */
    const nouveauxFilms = films.filter(f => f.annee === anneeActuelle).length;

    /*Mettre à jour le HTML avec les valeurs calculées */
    /* le textcontent remplace la valeur de span par de la fct kpi*/
    document.getElementById("totalFilms").textContent = totalFilms;
    document.getElementById("noteMoyenne").textContent = moyenne;
    document.getElementById("totalRealisateurs").textContent = totalRealisateurs;
    document.getElementById("nouveauxFilms").textContent = nouveauxFilms;
 }

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







let ratingChart = null;

function fetchOMDBStats() {
    const title = document.getElementById("omdbTitle").value.trim();
    if (!title) {
        alert("Entrez un titre de film");
        return;
    }

    fetch(https://www.omdbapi.com/?t=${title}&apikey=6edec412)
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
        .catch(() => {
            alert("Erreur API OMDB");
        });
}

function afficherFilm(data) {
    document.getElementById("filmDetails").innerHTML = `
        <h2>${data.Title} (${data.Year})</h2>
        <img src="${data.Poster}" width="200">
        <p><strong>Genre :</strong> ${data.Genre}</p>
        <p><strong>Réalisateur :</strong> ${data.Director}</p>
        <p><strong>Acteurs :</strong> ${data.Actors}</p>
        <p><strong>Résumé :</strong> ${data.Plot}</p>
        <p><strong>Note IMDb :</strong>  ${data.imdbRating}</p>
    `;
}



function drawRatingChart(data) {
    const ctx = document.getElementById("ratingChart");

    if (ratingChart) {
        ratingChart.destroy();
    }

    ratingChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [data.Title],
            datasets: [{
                label: "Note IMDb",
                data: [parseFloat(data.imdbRating)],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Note IMDb"
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 10
                }
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