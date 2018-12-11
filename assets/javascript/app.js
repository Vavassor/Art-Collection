"use strict";

let currentOffset;
let topics = ["Pixel", "Glitch", "Abstract", "Pattern", "Illusion", "Stereographic", "Surreal", "Sculpture", "Fractal", "Drawing", "Watercolor"];
const apiKey = "mHPwUCR4iqfbPQYqVDWzCold4ROczEgf";
const imagesPerRequest = 10;


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

    const image = $("<img>");
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

    const title = $("<a>");
    title.addClass("metadata");
    title.attr("href", result.url);
    title.text(result.title);
    division.append(title);

    const rating = $("<p>");
    rating.addClass("metadata");
    rating.text("Rating " + result.rating.toUpperCase());
    division.append(rating);

    const download = $("<a>");
    download.addClass("metadata");
    download.text("Download");
    download.attr("href", result.images.original.url);
    division.append(download);

    $("main").append(division);
  }
}

function isNewTopic(topic) {
  if (topic === "") {
    return false;
  } else {
    const localeTopic = topic.toLocaleLowerCase();
    return !topics.some(name => name.toLocaleLowerCase() === localeTopic);
  }
}

function setTopic(topic) {
  currentOffset = 0;

  const queryUrl = buildQueryUrl(topic, imagesPerRequest, "pg-13");
  
  $.ajax({
    url: queryUrl,
    method: "GET",
  }).then(handleResponse);
}


$(document).ready(() => {
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
