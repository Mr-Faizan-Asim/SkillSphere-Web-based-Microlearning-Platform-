// controllers/mentorController.js
const User = require('../models/user');

exports.search = async (req, res) => {
  const { q, subjects, tags, minRating=0, page=1, limit=10 } = req.query;
  const filter = { role: 'mentor', 'mentorProfile.verified': true };

  if(subjects) filter['mentorProfile.subjects'] = { $in: subjects.split(',') };
  if(tags) filter['mentorProfile.tags'] = { $in: tags.split(',') };

  let mongoQuery = User.find(filter);

  if(q) {
    mongoQuery = mongoQuery.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  }

  // minRating check handled after retrieving or with $expr in aggregation
  const skip = (page-1)*limit;
  const mentors = await mongoQuery.skip(skip).limit(Number(limit)).lean();

  // filter by rating client-side (or do aggregation for exact)
  const result = mentors.filter(m => (m.mentorProfile?.rating ?? 0) >= Number(minRating));
  res.json({ data: result, page:Number(page) });
};
