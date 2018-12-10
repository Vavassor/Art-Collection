"use strict";

let topics = ["Penguin", "Walrus", "Crow", "Lion", "Deer", "Bear", "Prairie Dog"];
const apiKey = "mHPwUCR4iqfbPQYqVDWzCold4ROczEgf";


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

    const paragraph = $("<p>");
    paragraph.addClass("rating");
    paragraph.text("Rating " + result.rating.toUpperCase());
    division.append(paragraph);

    $("main").append(division);
  }
}

function setTopic(topic) {
  const queryUrl = buildQueryUrl(topic, 10, "pg-13");
  
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
    topics.push(topic);
    fillTopicBar();
  });
});
