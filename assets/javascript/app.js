"use strict";

let currentOffset;
let currentTopic;
let topics = ["Pattern", "Pixel", "Glitch", "Abstract", "Illusion", "Stereographic", "Surreal", "Sculpture", "Fractal", "Drawing", "Watercolor"];
let favourites = [];
const apiKey = "mHPwUCR4iqfbPQYqVDWzCold4ROczEgf";
const imagesPerRequest = 10;


function buildQueryUrl(query, offset, limit, rating) {
  let url = "https://api.giphy.com/v1/gifs/search?lang=en";
  url += "&api_key=" + apiKey;
  url += "&q=" + encodeURIComponent(query);
  url += "&offset=" + offset;
  url += "&limit=" + limit;
  url += "&rating=" + rating;
  return url;
}

function fillTopicBar() {
  $(".topics").empty();

  const favouritesButton = $("<button type=\"button\">");
  favouritesButton.addClass("topic");
  favouritesButton.addClass("button-generic");
  favouritesButton.text("Favourites");
  favouritesButton.click(showFavourites);
  $(".topics").append(favouritesButton);

  for (const topic of topics) {
    const button = $("<button type=\"button\">");
    button.addClass("button-generic");
    button.addClass("topic");
    button.attr("data-topic", topic);
    button.text(topic);
    button.click((event) => {
      const target = $(event.currentTarget);
      const newTopic = target.attr("data-topic");
      setTopic(newTopic);
    });
    $(".topics").append(button);
  }
}

function handleResponse(response, firstLoad) {
  if (firstLoad) {
    $(".images-area").empty();
  }

  for (const result of response.data) {
    const division = $("<div>");
    division.addClass("gif-card");
    division.css("width", result.images.fixed_height.width);

    addImage(division, result.images.fixed_height_still.url, result.images.fixed_height.url);

    let imageTitle = result.title;
    if (imageTitle === "") {
      imageTitle = "Untitled";
    }

    let imageRating = result.rating.toUpperCase();

    addTitle(division, result.url, imageTitle);
    addRating(division, imageRating);

    const actionGroup = $("<div>");
    actionGroup.addClass("action-group");

    addDownloadButton(actionGroup, result.images.original.url, imageTitle);

    const favourite = $("<button>");
    favourite.addClass("button-generic");
    favourite.addClass("action");
    favourite.text("Favourite");
    favourite.click(() => {
      if (!isFavourited(result.url)) {
        const storedImage = {
          title: imageTitle,
          width: result.images.fixed_height.width,
          rating: imageRating,
          url: result.url,
          stillUrl: result.images.fixed_height_still.url,
          movingUrl: result.images.fixed_height.url,
          originalUrl: result.images.original.url,
        };
        favourites.push(storedImage);
        saveFavourites();
      }
    });
    actionGroup.append(favourite);

    division.append(actionGroup);

    const divider = $("<hr>");
    divider.addClass("divider");
    division.append(divider);

    $(".images-area").append(division);
  }

  $("#load-more").show();
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
  if ("download" in HTMLAnchorElement.prototype) {
    // A file can be downloaded using the download attribute of an anchor tag.
    // However, most browsers don't allow cross-origin URLs using this method.
    // The workaround is to download the file as a "blob" object, give it an
    // object URL on the client-side, and then download it through that URL
    // using the anchor method.
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
        $(document.body).append(tempAnchor);
        tempAnchor[0].click();
    
        tempAnchor.remove();
        URL.revokeObjectURL(url);
    });
  } else {
    // As of December 14, 2018, Safari on iOS and Internet Explorer don't have
    // the download attribute, so fall back to just redirecting.
    window.location.href = imageUrl;
  }
}

function setTopic(topic) {
  currentTopic = topic;
  currentOffset = 0;
  $("#load-more").hide();

  const queryUrl = buildQueryUrl(topic, currentOffset, imagesPerRequest, "pg-13");
  
  $.ajax({
    url: queryUrl,
    method: "GET",
  }).then((response) => {
    handleResponse(response, true);
  });
}

function loadMore() {
  currentOffset += imagesPerRequest;
  $("#load-more").hide();

  const queryUrl = buildQueryUrl(currentTopic, currentOffset, imagesPerRequest, "pg-13");
  
  $.ajax({
    url: queryUrl,
    method: "GET",
  }).then((response) => {
    handleResponse(response, false);
  });
}

function showEmptyFavouritesMessageIfNeeded() {
  if (favourites.length === 0) {
    const emptyMessage = $("<p>");
    emptyMessage.addClass("empty-message");
    emptyMessage.text("Favourite images to see them here!");
    $(".images-area").append(emptyMessage);
  }
}

function addTitle(group, url, title) {
  const heading = $("<h2>");

  const titleLink = $("<a>");
  titleLink.attr("href", url);
  titleLink.text(title);
  heading.append(titleLink);

  group.append(heading);
}

function addDownloadButton(group, url, title) {
  const download = $("<button>");
  download.addClass("button-generic");
  download.addClass("action");
  download.text("Download");
  download.click(() => {
    saveImage(url, title);
  });
  group.append(download);
}

function addImage(group, stillUrl, movingUrl) {
  const image = $("<input type=\"image\">");
  image.attr("alt", "Toggle Animation");
  image.attr("src", stillUrl);
  image.attr("data-is-moving", "false");
  image.attr("data-moving-url", movingUrl);
  image.attr("data-still-url", stillUrl);
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
  group.append(image);
}

function addRating(group, rating) {
  const paragraph = $("<p>");
  paragraph.addClass("metadata");
  paragraph.text("Rating " + rating);
  group.append(paragraph);
}

function showFavourites() {
  $("#load-more").hide();
  $(".images-area").empty();

  showEmptyFavouritesMessageIfNeeded();

  for (const favourite of favourites) {
    const division = $("<div>");
    division.addClass("gif-card");
    division.css("width", favourite.width);

    addImage(division, favourite.stillUrl, favourite.movingUrl);
    addTitle(division, favourite.url, favourite.title);
    addRating(division, favourite.rating);

    const actionGroup = $("<div>");
    actionGroup.addClass("action-group");

    addDownloadButton(actionGroup, favourite.originalUrl, favourite.title);

    const unfavourite = $("<button>");
    unfavourite.addClass("button-generic");
    unfavourite.addClass("action");
    unfavourite.text("Unfavourite");
    unfavourite.click(() => {
      const index = favourites.findIndex(item => item.url === favourite.url);
      favourites.splice(index, 1);
      saveFavourites();
      division.remove();
      showEmptyFavouritesMessageIfNeeded();
    });
    actionGroup.append(unfavourite);

    division.append(actionGroup);

    $(".images-area").append(division);
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
  setTopic(topics[0]);

  $("#add-topic").submit((event) => {
    event.preventDefault();
    const topic = $("#topic-name").val();
    if (isNewTopic(topic)) {
      topics.push(topic);
      fillTopicBar();
      $("#topic-name").val("");
    }
  });

  $("#load-more").click(loadMore);
});
