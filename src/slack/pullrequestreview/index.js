const actions = {
  submitted({ review, pull_request: pr }) {
    const getImageUrl = name =>
      `https://firebasestorage.googleapis.com/v0/b/temporary-trick.appspot.com/o/images%2F${name}.png?alt=media`;
    const state = {
      commented: {
        name: 'Comment',
        image: getImageUrl('dismiss'),
        color: '#969A9D',
      },
      approved: {
        name: 'Approval',
        image: getImageUrl('approve'),
        color: '#2CBE4E',
      },
      changes_requested: {
        name: 'Request Changes',
        image: getImageUrl('reject'),
        color: '#CB2331',
      },
    };
    const stateObj = state[review.state.toLowerCase()];

    return {
      username: `PR ${stateObj.name}`,
      icon_url: stateObj.image,
      attachments: [
        {
          color: stateObj.color,
          title: `${pr.title} (#${pr.number})`,
          title_link: pr.html_url,
          footer: `${review.user.login} ${review.state}`,
          footer_icon: `https://api.adorable.io/avatars/16/${
            review.user.login
          }.png`,
        },
      ],
    };
  },
  edited() {
    return null;
  },
  dismissed() {
    return null;
  },
};

module.exports = (payload, options) => {
  return actions[payload.action](payload, options);
};
