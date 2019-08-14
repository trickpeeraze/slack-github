const omit = require('lodash/omit');
const slackifyMarkdown = require('slackify-markdown');

const f = require('../components/format');

function prBranch({ base, head }) {
  const baseBranch = f.code(base.ref);
  const prBranch = f.code(head.ref);

  return `:git-branch: ${baseBranch} ⟵ ${prBranch}`;
}

function getLegacyPRObjectCompact(pr, user = '', action = '') {
  return {
    color: '#161515',
    title: `${pr.title} (#${pr.number})`,
    title_link: pr.html_url,
    text: prBranch(pr),
    footer: [user + action, pr.head.repo.name].join('・'),
    // can not use real github profile image due to network restriction
    // so, I will use "adorable.io" for now
    // footer_icon: pr.user.avatar_url,
    footer_icon: `https://api.adorable.io/avatars/16/${user}.png`,
    fallback: 'PR',
  };
}

const actions = {
  opened({ pull_request: pr, sender }) {
    const attachments = [getLegacyPRObjectCompact(pr, sender.login, ' opened PR')];

    if (pr.body) {
      attachments.push({
        color: '#161515',
        text: slackifyMarkdown(pr.body),
      });
    }

    return {
      attachments,
      username: 'PR Opened',
      icon_emoji:
        ':pr_opened:',
    };
  },
  closed({ pull_request: pr, sender }) {
    if (pr.merged) {
      return {
        username: 'PR Merged',
        icon_emoji:
          ':pr_merged:',
        attachments: [
          omit(getLegacyPRObjectCompact(pr, sender.login, ' merged PR'), [
            'text',
          ]),
        ],
      };
    }

    return {
      username: 'PR Closed',
      icon_emoji:
        ':pr_closed:',
      attachments: [
        omit(getLegacyPRObjectCompact(pr, sender.login, ' closed PR'), [
          'text',
        ]),
      ],
    };
  },
  reopened() {
    return null;
  },
  assigned() {
    return null;
  },
  unassigned() {
    return null;
  },
  edited() {
    return null;
  },
  review_requested() {
    return null;
  },
  review_request_removed() {
    return null;
  },
  labeled({ label, pull_request: pr, sender }) {
    return {
      username: `${label.name} added`,
      icon_emoji: ':git-tag:',
      attachments: [{
        title: `${pr.title} (#${pr.number})`,
        title_link: pr.html_url,
        footer: `${sender.login} tagged・${pr.head.repo.name}`,
        footer_icon: `https://api.adorable.io/avatars/16/${sender.login}.png`,
      }],
    };
  },
  unlabeled({ label, pull_request: pr, sender }) {
    return {
      username: `${label.name} removed`,
      icon_emoji: ':git-tag:',
      attachments: [{
        title: `${pr.title} (#${pr.number})`,
        title_link: pr.html_url,
        footer: `${sender.login} tagged・${pr.head.repo.name}`,
        footer_icon: `https://api.adorable.io/avatars/16/${sender.login}.png`,
      }],
    };
  },
  synchronized() {
    return null;
  },
};

module.exports = (payload, options) => {
  return actions[payload.action](payload, options);
};
