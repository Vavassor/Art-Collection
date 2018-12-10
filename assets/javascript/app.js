let topics = ["Penguin", "Walrus", "Crow", "Lion", "Deer", "Bear", "Prairie Dog"];
const apiKey = "mHPwUCR4iqfbPQYqVDWzCold4ROczEgf";

function fillTopicBar() {
  for (const topic of topics) {
    const button = $("<button type=\"button\">");
    button.addClass("topic");
    button.attr("data-topic", topic);
    button.text(topic);
    button.on("click", () => {
      const target = $(event.currentTarget);
      const newTopic = target.attr("data-topic");
      setTopic(newTopic);
    });
    $(".topics").append(button);
  }
}

function buildQueryUrl(query, limit, rating) {
  let url = "https://api.giphy.com/v1/gifs/search?lang=en";
  url += "&api_key=" + apiKey;
  url += "&q=" + query;
  url += "&limit=" + limit;
  url += "&rating=" + rating;
  return url;
}

function setTopic(topic) {
  const queryUrl = buildQueryUrl(topic, 10, "pg-13");

  $.ajax({
    url: queryUrl,
    method: "GET",
  }).then((response) => {
    $("main").empty();

    for (const result of response.data) {
      const division = $("<div>");
      division.addClass("gif-card");

      const paragraph = $("<p>");
      paragraph.addClass("rating");
      paragraph.text("Rating " + result.rating.toUpperCase());
      division.append(paragraph);

      const image = $("<img>");
      image.attr("src", result.images.fixed_height_still.url);
      division.append(image);

      $("main").append(division);
    }
  });
}


$(document).ready(() => {
  fillTopicBar();
});
