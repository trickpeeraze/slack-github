const actions = {
  submitted({ review, pull_request: pr }) {
    return {
      username: `PR ${review.state}`,
      icon_url:
        'https://pngimage.net/wp-content/uploads/2018/05/approval-icon-png-3.png',
      attachments: [
        {
          color: '#2DB192',
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
