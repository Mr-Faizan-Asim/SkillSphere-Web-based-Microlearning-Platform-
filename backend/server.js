require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60*1000, max: 100 }));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mentorship', {
  useNewUrlParser:true, useUnifiedTopology:true
}).then(()=> console.log('DB connected'));

app.get('/', (req,res)=> res.json({ ok:true }));

// Import routers (you'd create these using controllers shown above)
const authRouter = require('./routes/auth');
const mentorRouter = require('./routes/mentors');
const sessionRouter = require('./routes/sessions');
const adminRouter = require('./routes/admin');

app.use('/auth', authRouter);
app.use('/mentors', mentorRouter);
app.use('/sessions', sessionRouter);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Listening ${PORT}`));
