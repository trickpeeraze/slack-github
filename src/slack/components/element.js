function image(url, altText = "image") {
  return {
    type: "image",
    image_url: url,
    alt_text: altText
  };
}

function mrkdwn(text) {
  return {
    type: "mrkdwn",
    text
  };
}

function text(text) {
  return {
    type: "plain_text",
    text,
    emoji: true
  };
}

module.exports = {
  image,
  mrkdwn,
  text
};
