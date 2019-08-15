const slackifyMarkdown = require('slackify-markdown');
const { emoji } = require('../components/format');

const SUBMITTED_STATE = {
  // we will ignore comment state and go to check on `pull_request_review_comment` instead
  // commented: {},
  approved: {
    name: 'Approval',
    image: emoji('pr_approved'),
    color: '#2CBE4E',
    action: 'approved',
  },
  changes_requested: {
    name: 'Request changes',
    image: emoji('pr_rejected'),
    color: '#CB2331',
    action: 'requested changes',
  },
};

const actions = {
  submitted({ review, pull_request: pr }) {
    const stateObj = SUBMITTED_STATE[review.state.toLowerCase()];

    if (!stateObj) return null;

    const attachments = [
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
    ];

    if (review.body) {
      attachments.push({
        text: `${emoji('talk')} ${slackifyMarkdown(review.body)}`,
      });
    }

    return {
      username: `PR ${stateObj.name}`,
      icon_emoji: stateObj.image,
      attachments,
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
