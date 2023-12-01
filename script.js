"use strict";
const resultsNav = document.getElementById("resultsNav");
const favoritesNav = document.getElementById("favoritesNav");
const imagesContainer = document.querySelector(".images-container");
const saveConfirmed = document.querySelector(".save-confirmed");
const loader = document.querySelector(".loader");
const loadMoreEl = document.getElementById("loadMore");
const favoritesEl = document.getElementById("favorites");

//NASA API
const count = 10;
const apiKey = "DEMO_KEY";
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let results = [];
let favorites = {};

function createDOMNodes(page) {
  const list = page === "favorites" ? Object.values(favorites) : results;
  console.log(list);

  list.forEach((item) => {
    //card container
    const card = document.createElement("div");
    card.classList.add("card");
    //link
    const link = document.createElement("a");
    link.href = item.hdurl;
    link.title = "View Full Image";
    link.target = "_blank";
    //image
    const image = document.createElement("img");
    image.src = item.url;
    image.alt = "NASA Picture of the Day";
    image.loading = "lazy";
    image.classList.add("card-img-top");
    //card body
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    //card title
    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = item.title;
    //save text
    const saveText = document.createElement("p");
    saveText.classList.add("clickable");
    if (page === "favorites") {
      saveText.textContent = "Remove Favorite";
      saveText.onclick = () => removeFavorite(item.url);
    } else {
      saveText.textContent = "Add to Favorites";
      saveText.onclick = () => saveFavorite(item.url);
    }

    //card text
    const cardText = document.createElement("p");
    cardText.textContent = item.explanation;
    //footer container
    const footer = document.createElement("small");
    footer.classList.add("text-muted");
    //date
    const date = document.createElement("strong");
    date.textContent = item.date;
    //copyright
    const copyright = document.createElement("span");
    copyright.textContent = item.copyright ? ` ${item.copyright}` : "";
    //append
    footer.append(date, copyright);
    cardBody.append(cardTitle, saveText, cardText, footer);
    link.appendChild(image);
    card.append(link, cardBody);
    imagesContainer.appendChild(card);
  });
}

function updateDOM(page) {
  imagesContainer.textContent = "";
  favorites = localStorage.getItem("nasaFavorites")
    ? JSON.parse(localStorage.getItem("nasaFavorites"))
    : favorites;
  createDOMNodes(page);
  window.scrollTo({
    top: 0,
    behavior: "instant",
  });
  if (page === "favorites") {
    resultsNav.classList.add("hidden");
    favoritesNav.classList.remove("hidden");
  } else {
    resultsNav.classList.remove("hidden");
    favoritesNav.classList.add("hidden");
  }
  loader.classList.add("hidden");
}

//get img from api

async function getNasaPictures() {
  //show loader
  loader.classList.remove("hidden");
  try {
    const res = await fetch(apiUrl);
    results = await res.json();
    updateDOM();
  } catch (error) {
    console.log(`Fetch error: ${error}`);
  }
}

//remove favorite
function removeFavorite(itemUrl) {
  if (favorites[itemUrl]) {
    delete favorites[itemUrl];
    localStorage.setItem("nasaFavorites", JSON.stringify(favorites));
    updateDOM("favorites");
  }
}

//add result to favorites
function saveFavorite(itemUrl) {
  //loop through results array to select favorite
  results.forEach((item) => {
    if (item.url.includes(itemUrl) && !favorites[itemUrl]) {
      favorites[itemUrl] = item;
      //show save confirmation for 2s
      saveConfirmed.hidden = false;
      const timer = setTimeout(() => {
        saveConfirmed.hidden = true;
        clearTimeout(timer);
      }, 2000);
      //save to localstorage
      localStorage.setItem("nasaFavorites", JSON.stringify(favorites));
    }
  });
}

//event listeners

loadMoreEl.addEventListener("click", getNasaPictures);
favoritesEl.addEventListener("click", () => updateDOM("favorites"));

getNasaPictures();
