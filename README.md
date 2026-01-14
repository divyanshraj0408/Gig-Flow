# GigFlow - Freelance Marketplace Platform  Demo Link - [[GigFlowWeb](https://gig-flow-web.onrender.com/)]

A full-stack freelance marketplace where clients can post gigs and freelancers can bid on them. Built with the MERN stack.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with HttpOnly cookies
- **Fluid Roles**: Users can be both clients (post gigs) and freelancers (bid on gigs)
- **Gig Management**: Full CRUD operations for job postings
- **Search & Filter**: Search gigs by title and description
- **Bidding System**: Freelancers can submit bids with custom proposals and pricing
- **Atomic Hiring Logic**: Race-condition-proof hiring with MongoDB transactions

### Advanced Features
- **Transaction Integrity**: MongoDB transactions ensure only one freelancer can be hired
- **Automatic Bid Updates**: When one bid is hired, all others are automatically rejected
- **Protected Routes**: Authentication middleware for secure operations
- **Responsive UI**: Modern, mobile-friendly design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React.js (with Vite)
- Redux Toolkit (State Management)
- React Router DOM (Routing)
- Tailwind CSS (Styling)
- Axios (API calls)

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT (Authentication)
- Bcrypt.js (Password hashing)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (use .env.example as template)
cp .env.example .env

# Update .env with your values:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/gigflow
# JWT_SECRET=your_secret_key
# NODE_ENV=development
# CLIENT_URL=http://localhost:5173

# Start the server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 📋 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user
```

### Gigs
```
GET    /api/gigs             - Fetch all gigs (with search)
GET    /api/gigs/:id         - Fetch single gig
POST   /api/gigs             - Create new gig (Protected)
GET    /api/gigs/my/posted   - Get user's posted gigs (Protected)
```

### Bids
```
POST   /api/bids             - Submit a bid (Protected)
GET    /api/bids/:gigId      - Get all bids for a gig (Owner only)
PATCH  /api/bids/:bidId/hire - Hire a freelancer (Protected)
GET    /api/bids/my/submissions - Get user's submitted bids (Protected)
```

## 🔐 Security Features

1. **HttpOnly Cookies**: JWT tokens stored in HttpOnly cookies (not localStorage)
2. **Password Hashing**: Bcrypt with salt rounds for secure password storage
3. **Protected Routes**: Middleware authentication on sensitive endpoints
4. **CORS Configuration**: Proper CORS setup with credentials
5. **Input Validation**: Required fields and type checking

## 🎯 Key Implementation Details

### Atomic Hiring Logic

The hiring process uses MongoDB transactions to ensure data consistency:

```javascript
// When a client hires a freelancer:
1. Update gig status to "assigned"
2. Update selected bid to "hired"
3. Update all other bids to "rejected"
// All in a single atomic transaction
```

This prevents race conditions where multiple freelancers could be hired for the same gig.

### State Management

Redux Toolkit is used for:
- Authentication state
- Gig listings and current gig
- Bid submissions and list
- Loading and error states

## 🧪 Testing the Application

### Test Flow

1. **Register** two users (User A and User B)
2. **Login** as User A
3. **Post a Gig** with title, description, and budget
4. **Logout** and login as User B
5. **Submit a Bid** on User A's gig
6. **Logout** and login back as User A
7. **View Bids** on your posted gig
8. **Click "Hire"** on User B's bid
9. **Verify** that:
   - Gig status changed to "assigned"
   - Hired bid shows "hired" status
   - Other bids (if any) show "rejected" status

## 📁 Project Structure

```
gigflow/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Gig.js
│   │   └── Bid.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── gigRoutes.js
│   │   └── bidRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CreateGig.jsx
│   │   │   ├── GigDetails.jsx
│   │   │   └── MyGigs.jsx
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── gigSlice.js
│   │   │   │   └── bidSlice.js
│   │   │   └── store.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```
## 🎥 Demo Video

[[Drive link](https://drive.google.com/file/d/19BTzP5DThZJolcBHh4Pj6d8qwP6ah3_Y/view?usp=sharing)]
## 📝 License

MIT License