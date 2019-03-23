const f = require('./components/format');
const b = require('./components/block');
const e = require('./components/element');

function prTitle({ url, title }) {
  return f.bold(f.link(url, title));
}

function prLabels(
  { labels = [] },
  { prefix = ':git-tag: ', delimeter = '\t' } = {}
) {
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

  return `:git-branch: ${baseBranch} ⟵ ${prBranch}`;
}

function prMoreInfo({ changed_files, comments, created_at }) {
  const changeText = `${changed_files || 'no'} files changes`;
  const commentsText = `${comments || 0} comments`;

  let dateText;

  if (created_at) {
    const date = new Date(created_at);
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    dateText = `<!date^${unixTimestamp}^opened {date_short_pretty}|${date.toUTCString()}>`;
  }

  const text = [changeText, commentsText, dateText]
    .filter(item => item)
    .join(' · ');

  return e.mrkdwn(text);
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
    elements.push(e.text('was assigned'));
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

  return elements;
}

function prMain(pullRequest) {
  return [
    prTitle(pullRequest).toUpperCase(),
    '\n',
    prLabels(pullRequest),
    '\n',
    prInformation(pullRequest),
    '\n\n\n',
    prBranch(pullRequest),
  ].join('');
}

const actions = {
  opened({ pull_request: pr }, users) {
    const host = process.env.CDN_UR || process.env.BASE_URI;
    const chat = "I've just opened a PR, check it out";
    const image = e.image(
      `${host}/images/pr_opened.png`,
      'Pull request opened'
    );

    return [
      b.section(chat),
      b.section(prMain(pr), image),
      b.context([prMoreInfo(pr)]),
      b.divider(),
      b.context(prParticipants(pr, users)),
    ];
  },
  closed({ pull_request: pr, sender }, users) {
    const host = process.env.CDN_UR || process.env.BASE_URI;
    const action = pr.merged ? 'merged' : 'closed';
    const imageName = `pr_${action}.png`;
    const image = e.image(
      `${host}/images/${imageName}`,
      'Pull request ${action}'
    );

    let chat;

    if (sender.login === pr.user.login) {
      chat = `I've ${action} My PR`;
    } else {
      const prOwner = users.getByGithubId(pr.user.login);
      const user = prOwner ? f.mention(prOwner.user_id) : pr.user.login;
      chat = `I've ${action} ${user}'s PR`;
    }

    return [
      b.section(chat),
      b.section(prMain(pr), image),
      b.context([prMoreInfo(pr)]),
      b.divider(),
      b.context(prParticipants(pr, users)),
    ];
  },
  reopened() {
    return null;
  },
  assigned({ assignee, pull_request, sender }, users) {
    let chat;

    if (sender.login === assignee.login) {
      chat = `I'll take this pull request`;
    } else {
      const assignee = users.getByGithubId(assignee.login);

      if (assignee) {
        const user = f.mention(assignee.user.id);
        chat = `${user}, I've assigned you to the pull request`;
      } else {
        chat = `I've assigned ${assignee.login} to the pull request`;
      }
    }

    return [b.section(`${chat} — ${prTitle(pull_request)}`)];
  },
  unassigned({ assignee, pull_request, sender }, users) {
    let chat;

    if (sender.login === assignee.login) {
      chat = `I'm out from the pull request`;
    } else {
      const assignee = users.getByGithubId(assignee.login);

      if (assignee) {
        const user = f.mention(assignee.user.id);
        chat = `${user}, I've unassigned you from the pull request`;
      } else {
        chat = `I've unassigned ${assignee.login} from the pull request`;
      }
    }

    return [b.section(`${chat} — ${prTitle(pull_request)}`)];
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
  labeled({ label, pull_request }) {
    let chat = `I've added a :git-tag: ${f.italic(label.name)} to ${prTitle(
      pull_request
    )}`;

    return [b.section(chat)];
  },
  unlabeled({ label, pull_request }) {
    let chat = `I've removed a :git-tag: ${f.italic(label.name)} to ${prTitle(
      pull_request
    )}`;

    return [b.section(chat)];
  },
  synchronized() {
    return null;
  },
};

module.exports = (payload, users) => {
  return actions[payload.action](payload, users);
};
