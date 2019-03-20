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

function prMoreInfo({ changed_files }) {
  return b.context([e.text(`${changed_files} files changes`)]);
}

function prParticipants({
  assignees = [],
  requested_reviewers = [],
  requested_teams = [],
}) {
  const elements = [];

  if (assignees.length) {
    elements.push(
      ...assignees.map(assignee => e.image(assignee.avatar_url, assignee.login))
    );
    elements.push(e.text('was assigned and'));
  }

  const reviewers = [...requested_reviewers, ...requested_teams];

  if (reviewers.length) {
    elements.push(
      ...reviewers.map(reviewer => e.image(reviewer.avatar_url, reviewer.login))
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

exports.pull_request = payload => {
  const actions = {
    opened({ pull_request: pr }) {
      return [
        b.section("I've just opened a PR, check it out"),
        b.section(
          prMain(pr),
          e.image(
            `${process.env.CDN_URL}/images/PR_Open.png`,
            'Pull request open'
          )
        ),
        prMoreInfo(pr),
        b.divider(),
        prParticipants(pr),
      ];
    },
    closed() {},
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
