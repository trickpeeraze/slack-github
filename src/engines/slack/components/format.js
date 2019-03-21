const wrap = (open = '', end) => str => open + str + (end || open);

exports.bold = wrap('*');
exports.italic = wrap('_');
exports.code = wrap('`');
exports.link = (url, title) => wrap('<', '>')(url + '|' + (title || url));
exports.mention = id => wrap('<', '>')(`@${id}`);
