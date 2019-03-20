function section(text, accessory) {
  const block = {
    type: "section",
    text: {
      type: "mrkdwn",
      text
    }
  };

  if (accessory) block.accessory = accessory;

  return block;
}

function context(elements) {
  return {
    type: "context",
    elements
  };
}

function divider() {
  return {
    type: "divider"
  };
}

module.exports = {
  section,
  context,
  divider
};
