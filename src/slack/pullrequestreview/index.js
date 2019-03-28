const actions = {
  submitted({ review, pull_request: pr }) {
    const getImageUrl = name =>
      `https://firebasestorage.googleapis.com/v0/b/temporary-trick.appspot.com/o/images%2F${name}.png?alt=media`;
    const state = {
      // we will ignore comment state and go to check on `pull_request_review_comment` instead
      // commented: {},
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

    if (!stateObj) return null;

    return {
      username: `PR ${stateObj.name}`,
      icon_url: stateObj.image,
      attachments: [
        {
          color: stateObj.color,
          title: `${pr.title} (#${pr.number})`,
          title_link: pr.html_url,
          footer: `${review.user.login} ${review.state}・${pr.head.repo.name}`,
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
