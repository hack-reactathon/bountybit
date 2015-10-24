exports.newBounty = function(req, res) {
  res.render('bounty/new', {
    title: 'Create a new bounty'
  });
};

exports.postBounty = function(req, res) {
  res.json(req.body);
};
