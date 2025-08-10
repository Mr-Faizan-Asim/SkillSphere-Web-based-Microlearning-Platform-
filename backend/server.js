require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 60*1000, max: 100 }));

// CORS setup
app.use(cors({
  origin: '*', // exact origin
  credentials: true               // allow cookies/auth headers
}));

mongoose.connect('mongodb+srv://faizan:faizan246@cluster0.5klp2pw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true, 
  useUnifiedTopology: true
}).then(() => console.log('DB connected'));

// Track online mentors
global.onlineMentors = []; 

app.get('/', (req, res) => res.json({ ok: true }));

// Routers
const authRouter = require('./routes/auth');
const mentorRouter = require('./routes/mentors');
const sessionRouter = require('./routes/sessions');
const adminRouter = require('./routes/admin');
const learnerRouter = require('./routes/learnerRoutes');
const userRouter = require('./routes/user');

app.use('/auth', authRouter);
app.use('/mentors', mentorRouter);
app.use('/sessions', sessionRouter);
app.use('/admin', adminRouter);
app.use('/learners', learnerRouter);
app.use('/users', userRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
