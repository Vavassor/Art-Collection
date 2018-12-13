"use strict";

let currentOffset;
let topics = ["Pixel", "Glitch", "Abstract", "Pattern", "Illusion", "Stereographic", "Surreal", "Sculpture", "Fractal", "Drawing", "Watercolor"];
let favourites = [];
const apiKey = "mHPwUCR4iqfbPQYqVDWzCold4ROczEgf";
const imagesPerRequest = 10;


class StoredImage {
  constructor(title, width, rating, url, stillUrl, movingUrl, originalUrl) {
    this.title = title;
    this.width = width;
    this.rating = rating;
    this.url = url;
    this.stillUrl = stillUrl;
    this.movingUrl = movingUrl;
    this.originalUrl = originalUrl;
  }
}


function buildQueryUrl(query, limit, rating) {
  let url = "https://api.giphy.com/v1/gifs/search?lang=en";
  url += "&api_key=" + apiKey;
  url += "&q=" + encodeURIComponent(query);
  url += "&limit=" + limit;
  url += "&rating=" + rating;
  return url;
}

function fillTopicBar() {
  $(".topics").empty();

  const favouritesButton = $("<button type=\"button\">");
  favouritesButton.addClass("topic");
  favouritesButton.text("Favourites");
  favouritesButton.click(showFavourites);
  $(".topics").append(favouritesButton);

  for (const topic of topics) {
    const button = $("<button type=\"button\">");
    button.addClass("topic");
    button.attr("data-topic", topic);
    button.text(topic);
    button.click(() => {
      const target = $(event.currentTarget);
      const newTopic = target.attr("data-topic");
      setTopic(newTopic);
    });
    $(".topics").append(button);
  }
}

function handleResponse(response) {
  $("main").empty();

  for (const result of response.data) {
    const division = $("<div>");
    division.addClass("gif-card");
    division.css("width", result.images.fixed_height.width);

    const image = $("<input type=\"image\">");
    image.attr("alt", "Toggle Animation");
    image.attr("src", result.images.fixed_height_still.url);
    image.attr("data-is-moving", "false");
    image.attr("data-moving-url", result.images.fixed_height.url);
    image.attr("data-still-url", result.images.fixed_height_still.url);
    image.click((event) => {
      const target = $(event.currentTarget);
      const isMoving = target.attr("data-is-moving");
      if (isMoving === "true") {
        target.attr("src", target.attr("data-still-url"));
        target.attr("data-is-moving", "false");
      } else {
        target.attr("src", target.attr("data-moving-url"));
        target.attr("data-is-moving", "true");
      }
    });
    division.append(image);

    let imageTitle = result.title;
    if (imageTitle === "") {
      imageTitle = "Untitled";
    }

    let imageRating = result.rating.toUpperCase();

    const title = $("<h2>");
    const titleLink = $("<a>");
    titleLink.attr("href", result.url);
    titleLink.text(imageTitle);
    title.append(titleLink);
    division.append(title);

    const rating = $("<p>");
    rating.addClass("metadata");
    rating.text("Rating " + imageRating);
    division.append(rating);

    const download = $("<button>");
    download.text("Download");
    download.click(() => {
      saveImage(result.images.original.url, imageTitle);
    });
    division.append(download);

    const favourite = $("<button>");
    favourite.text("Favourite");
    favourite.click(() => {
      if (!isFavourited(result.url)) {
        const storedImage = new StoredImage(
          imageTitle,
          result.images.fixed_height.width,
          imageRating,
          result.url,
          result.images.fixed_height_still.url,
          result.images.fixed_height.url,
          result.images.original.url);

        favourites.push(storedImage);
        saveFavourites();
      }
    });
    division.append(favourite);

    $("main").append(division);
  }
}

function isFavourited(url) {
  for (const favourite of favourites) {
    if (favourite.url === url) {
      return true;
    }
  }
  return false;
}

function isNewTopic(topic) {
  if (topic === "") {
    return false;
  } else {
    const localeTopic = topic.toLocaleLowerCase();
    for (const name of topics) {
      if (name.toLocaleLowerCase() === localeTopic) {
        return false;
      }
    }
    return true;
  }
}

function saveImage(imageUrl, title) {
  $.ajax({
    method: "GET",
    url: imageUrl,
    xhrFields: {
      responseType: "blob",
    },
  }).then((response) => {
    const url = URL.createObjectURL(response);

    const tempAnchor = $("<a>");
    tempAnchor.attr("download", title);
    tempAnchor.attr("href", url);
    tempAnchor[0].click();

    URL.revokeObjectURL(url);
  });
}

function setTopic(topic) {
  currentOffset = 0;

  const queryUrl = buildQueryUrl(topic, imagesPerRequest, "pg-13");
  
  $.ajax({
    url: queryUrl,
    method: "GET",
  }).then(handleResponse);
}

function showEmptyFavouritesIfNeeded() {
  if (favourites.length === 0) {
    const emptyMessage = $("<p>");
    emptyMessage.addClass("empty-favourites-message");
    emptyMessage.text("Favourite images to see them here!");
    $("main").append(emptyMessage);
  }
}

function showFavourites() {
  $("main").empty();

  showEmptyFavouritesIfNeeded();

  for (const favourite of favourites) {
    const division = $("<div>");
    division.addClass("gif-card");
    division.css("width", favourite.width);

    const image = $("<img>");
    image.attr("src", favourite.stillUrl);
    image.attr("data-is-moving", "false");
    image.attr("data-moving-url", favourite.movingUrl);
    image.attr("data-still-url", favourite.stillUrl);
    image.click((event) => {
      const target = $(event.currentTarget);
      const isMoving = target.attr("data-is-moving");
      if (isMoving === "true") {
        target.attr("src", target.attr("data-still-url"));
        target.attr("data-is-moving", "false");
      } else {
        target.attr("src", target.attr("data-moving-url"));
        target.attr("data-is-moving", "true");
      }
    });
    division.append(image);

    const title = $("<a>");
    title.attr("href", favourite.url);
    title.text(favourite.title);
    division.append(title);

    const rating = $("<p>");
    rating.addClass("metadata");
    rating.text("Rating " + favourite.rating);
    division.append(rating);

    const download = $("<button>");
    download.text("Download");
    download.click(() => {
      saveImage(favourite.originalUrl, favourite.title);
    });
    division.append(download);

    const unfavourite = $("<button>");
    unfavourite.text("Unfavourite");
    unfavourite.click(() => {
      const index = favourites.findIndex(item => item.url === favourite.url);
      favourites.splice(index, 1);
      saveFavourites();
      division.remove();
      showEmptyFavouritesIfNeeded();
    });
    division.append(unfavourite);

    $("main").append(division);
  }
}

function loadFavourites() {
  const storedFavourites = localStorage.getItem("favourites");
  if (storedFavourites !== null) {
    favourites = JSON.parse(storedFavourites);
  }
}

function saveFavourites() {
  localStorage.setItem("favourites", JSON.stringify(favourites));
}


$(document).ready(() => {
  loadFavourites();

  fillTopicBar();

  $("#add-topic").submit((event) => {
    event.preventDefault();
    const topic = $("#topic-name").val();
    if (isNewTopic(topic)) {
      topics.push(topic);
      fillTopicBar();
    }
  });
});
