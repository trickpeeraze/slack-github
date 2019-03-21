const f = require('./components/format');
const b = require('./components/block');
const e = require('./components/element');

function prTitle({ url, title }) {
  return f.bold(f.link(url, title)).toUpperCase();
}

function prLabels({ labels = [] }, { prefix = ':label: ', delimeter = '\t' }) {
  return (
    '>' + labels.map(label => prefix + f.italic(label.name)).join(delimeter)
  );
}

function prInformation({ number, head }) {
  return `#${number} · <${head.repo.html_url}|${head.repo.full_name}>`;
}

function prBranch({ base, head }) {
  const baseBranch = f.code(base.ref);
  const prBranch = f.code(head.ref);

  return `${baseBranch} ⟵ ${prBranch}`;
}

function prMoreInfo({ changed_files, comments, created_at }) {
  const changeText = `${changed_files || 'no'} files changes`;
  const commentsText = `${comments || 0} comments`;

  let dateText;

  if (created_at) {
    const date = new Date(created_at);
    dateText = `<!date^${date.getTime()}^opened {date_short_pretty}|opened>`;
  }

  const text = [changeText, commentsText, dateText]
    .filter(item => item)
    .join(' · ');

  return b.context([e.text(text)]);
}

function prParticipants(
  { assignees = [], requested_reviewers = [], requested_teams = [] },
  users
) {
  const elements = [];

  if (assignees.length) {
    elements.push(
      ...assignees.map(assignee =>
        e.image(assignee.avatar_url, users.getByGithubId(assignee.login).name)
      )
    );
    elements.push(e.text('was assigned and'));
  }

  const reviewers = [...requested_reviewers, ...requested_teams];

  if (reviewers.length) {
    elements.push(
      ...reviewers.map(reviewer =>
        e.image(reviewer.avatar_url, users.getByGithubId(reviewer.login).name)
      )
    );
    elements.push(e.text('were requested review'));
  }

  return b.context(elements);
}

function prMain(pullRequest) {
  return [
    prTitle(pullRequest),
    '\n',
    prLabels(pullRequest),
    '\n',
    prInformation(pullRequest),
    '\n\n\n',
    prBranch(pullRequest),
  ].join('');
}

module.exports = (payload, users) => {
  const actions = {
    opened({ pull_request: pr }) {
      const chat = "I've just opened a PR, check it out";
      const image = e.image(
        `${process.env.CDN_URL}/images/PR_Open.png`,
        'Pull request open'
      );

      return [
        b.section(chat),
        b.section(prMain(pr), image),
        prMoreInfo(pr),
        b.divider(),
        prParticipants(pr, users),
      ];
    },
    closed({ pull_request: pr, sender }) {
      let image;

      if (pr.merged) {
        image = e.image(
          `${process.env.CDN_URL}/images/PR_Merged.png`,
          'Pull request merged'
        );
      } else {
        image = e.image(
          `${process.env.CDN_URL}/images/PR_Close.png`,
          'Pull request closed'
        );
      }
      let chat;

      if (sender.login === pr.user.login) {
        chat = "I've merged My PR";
      } else {
        const prOwner = users.getByGithubId(pr.user.login);
        const user = prOwner ? f.mention(prOwner.user_id) : prOwner.user_id;
        chat = `I've merged ${user}'s PR`;
      }

      return [
        b.section(chat),
        b.section(prMain(pr), image),
        prMoreInfo(pr),
        b.divider(),
        prParticipants(pr, users),
      ];
    },
    reopened() {},
    assigned() {},
    unassigned() {},
    edited() {},
    review_requested() {},
    review_request_removed() {},
    labeled() {},
    unlabeled() {},
  };

  return actions[payload.action](payload);
};
