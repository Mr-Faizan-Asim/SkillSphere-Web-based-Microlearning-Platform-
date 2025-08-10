# SkillSphere 🧠

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-brightgreen)](https://nodejs.org/)  
[![React](https://img.shields.io/badge/React-18%2B-61DAFB)](https://reactjs.org/)  
[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/skillsphere/main.yml?branch=main)](https://github.com/your-username/skillsphere/actions)

**SkillSphere** — an AI-powered mentorship platform connecting learners with expert mentors. Get personalized learning suggestions, interact with a personal avatar tutor, and manage sessions professionally with AI assistance.

![SkillSphere Banner](https://i.imgur.com/placeholder-banner.png)

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [Screenshots](#-screenshots)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## ✨ Features

### For Learners
- 🔍 Discover mentors by skills, ratings, and availability  
- 📅 Book sessions with preferred mentors  
- 🤖 **AI-Powered Personal Suggestions** tailored to your goals and learning style  
- 🧑‍🏫 **Personal Avatar Tutor** — an interactive avatar that helps with Q&A and practice  
- 💬 Join video/audio sessions directly from the platform  
- ⭐ Rate and review mentors after sessions  
- 📝 Access session notes, resources and follow-up tasks  
- 🎯 Track progress with AI insights & learning plans

### For Mentors
- 📝 Create and manage mentor profiles (bio, subjects, portfolio)  
- 🕒 Set availability and manage bookings  
- 📩 Receive/respond to session requests and messages  
- 💰 Set hourly rates and payment details  
- 📊 View analytics on sessions, earnings and ratings  
- 🤖 **AI-Assisted Scheduling & Session Management** for professional client handling

### For Admins
- 👥 User management (learners & mentors)  
- 📊 Platform analytics and AI-driven insights  
- ✅ Mentor application approval workflow  
- 📅 Session monitoring and moderation tools  
- 📈 Advanced reporting and metrics

---

## ⚙️ Tech Stack

### Frontend
- **Framework**: React 18  
- **Styling**: Tailwind CSS  
- **State Management**: React Context API (or Redux if required)  
- **Charts**: Recharts  
- **Icons**: React Icons  
- **Avatar Generation**: DiceBear or similar

### Backend
- **Runtime**: Node.js 16+  
- **Framework**: Express.js  
- **Database**: MongoDB + Mongoose  
- **Authentication**: JWT (JSON Web Tokens)  
- **AI Integration**: Groq API (or your chosen AI provider) for tutor & recommendations

### Tools
- Git & GitHub  
- npm / pnpm / yarn  
- dotenv for environment variables

---

## 🛠 Installation

### Prerequisites
- Node.js v16+  
- MongoDB (local or Atlas)  
- npm v8+

### Setup
1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/skillsphere.git
   cd skillsphere


2. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_jwt_secret
   GROQ_API_KEY=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
   PORT=4000
   ```

3. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Run the application**
   ```bash
   # Start backend server
   cd backend
   npm start
   
   # In a new terminal, start frontend
   cd ../frontend
   npm start
   ```

5. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000`


## 🚀 Usage

### Getting Started
1. Register as a learner or mentor
2. Complete your profile
3. For mentors: Apply to become a verified mentor
4. For learners: Search for mentors and book sessions

### As a Learner
1. Browse mentors using the "Best Mentors" page
2. View detailed mentor profiles
3. Use the AI-powered suggestions for personalized recommendations
4. Book sessions through the session booking form
5. Rate mentors after sessions are completed

### As a Mentor
1. Create your mentor profile with expertise and rates
2. Set your availability for sessions
3. Accept or decline session requests
4. Manage your sessions through the dashboard
5. View your ratings and feedback

### As an Admin
1. Access the Admin Dashboard
2. Manage users, mentors, and sessions
3. Review pending mentor applications
4. View platform analytics and insights
5. Monitor session statuses and user activity

## 📷 Screenshots

### 1. Home Page - Best Mentors
![Best Mentors Page](https://i.imgur.com/placeholder-mentors.png)
*Discover top-rated mentors with AI-powered suggestions*

### 2. Session Dashboard
![Session Dashboard](https://i.imgur.com/placeholder-sessions.png)
*Manage your upcoming and past sessions*

### 3. AI-Powered Mentor Recommendations
![AI Recommendations](https://i.imgur.com/placeholder-ai.png)
*Personalized mentor suggestions based on your learning goals*

### 4. Admin Dashboard
![Admin Dashboard](https://i.imgur.com/placeholder-admin.png)
*Comprehensive platform management and analytics*

### 5. Mentor Profile View
![Mentor Profile](https://i.imgur.com/placeholder-profile.png)
*Detailed mentor information with session booking options*

## 🔌 API Endpoints

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Authenticate and get JWT token |
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update user profile |

### Mentor Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentors` | Get all mentors |
| GET | `/api/mentors/best-rated` | Get best rated mentors |
| GET | `/api/mentors/:id` | Get mentor by ID |
| POST | `/api/mentors/apply` | Apply to become a mentor |

### Session Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Book a new session |
| GET | `/api/sessions/learner/:learnerId` | Get learner's sessions |
| GET | `/api/sessions/mentor/:mentorId` | Get mentor's sessions |
| PATCH | `/api/sessions/:id/accept` | Accept a session request |
| PATCH | `/api/sessions/:id/decline` | Decline a session request |
| PATCH | `/api/sessions/:id/rate` | Rate a mentor after session |
| PATCH | `/api/sessions/:id/mark-completed` | Mark session as completed |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/mentor-applications` | Get pending mentor applications |
| PATCH | `/api/admin/mentor-applications/:id/approve` | Approve a mentor application |
| GET | `/api/admin/analytics` | Get platform analytics |

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md) when contributing.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2023 Mentorship Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgements

- Thanks to the open-source community for providing excellent libraries
- Groq API for AI-powered features
- DiceBear for avatar generation
- Recharts for beautiful data visualization
- date-fns for date manipulation

---

**Note**: This project was developed for educational purposes and as part of a hackathon. The actual implementation may vary based on specific requirements and constraints.
