const actions = {
  submitted({ review, pull_request: pr }) {
    const getIconEmoji = name =>
      `:${name}:`;
    const state = {
      // we will ignore comment state and go to check on `pull_request_review_comment` instead
      // commented: {},
      approved: {
        name: 'Approval',
        image: getIconEmoji('pr_approved'),
        color: '#2CBE4E',
        action: 'approved',
      },
      changes_requested: {
        name: 'Request changes',
        image: getIconEmoji('pr_rejected'),
        color: '#CB2331',
        action: 'requested changes',
      },
    };
    const stateObj = state[review.state.toLowerCase()];

    if (!stateObj) return null;

    return {
      username: `PR ${stateObj.name}`,
      icon_emoji: stateObj.image,
      attachments: [
        {
          color: stateObj.color,
          title: `${pr.title} (#${pr.number})`,
          title_link: pr.html_url,
          footer: `${review.user.login} ${stateObj.action}・${
            pr.head.repo.name
          }`,
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
