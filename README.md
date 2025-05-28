# Adventure Park Management System

A comprehensive full-stack web application for managing adventure parks, activities, bookings, and user experiences. Built with Next.js, Express.js, and MongoDB.

## 🌟 Features

### Frontend (Next.js)
- **Modern UI/UX**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Authentication**: Secure user authentication with role-based access control
- **Park Management**: Browse and explore different adventure parks
- **Activity Booking**: Interactive booking system with time slot selection
- **Shopping Cart**: Add activities to cart and process payments
- **User Dashboard**: Profile management and booking history
- **Admin Dashboard**: Comprehensive admin panel for park management
- **Responsive Design**: Mobile-first responsive design
- **Real-time Updates**: Live cart updates and booking status

### Backend (Express.js)
- **RESTful API**: Well-structured API endpoints
- **Authentication & Authorization**: JWT-based auth with role management
- **Database Integration**: MongoDB with Mongoose ODM
- **File Upload**: Image and video upload functionality
- **Payment Processing**: Integrated payment system
- **Email Services**: Automated email notifications
- **Security**: CORS, CSRF protection, and input validation

### Key Modules
- **Parks**: Create and manage adventure parks
- **Activities**: Define activities available in each park
- **Bookings**: Handle reservations and time slots
- **Users**: User management with different roles (admin, sous admin, user)
- **Pricing**: Dynamic pricing management
- **Content Management**: News, FAQ, and about page management
- **Cart System**: Shopping cart with persistent storage

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js with JWT
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, CSRF protection
- **Email**: Nodemailer

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd adventure-park
```

### 2. Backend Setup
```bash
# Navigate to backend directory (if separate)
cd Archive

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd src

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

## ⚙️ Environment Variables

### Backend (.env)
```env
# Database
MONGO_URL=mongodb://localhost:27017/adventure-park

# Authentication
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Server Configuration
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# NextAuth (if using)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**
```bash
cd Archive
npm run dev
# Server will run on http://localhost:8000
```

2. **Start the Frontend Application**
```bash
cd src
npm run dev
# Application will run on http://localhost:3000
```

### Production Mode

1. **Build the Frontend**
```bash
cd src
npm run build
npm start
```

2. **Start the Backend**
```bash
cd Archive
npm start
```

## 📁 Project Structure

```
adventure-park/
├── Archive/                    # Backend (Express.js)
│   ├── controllers/           # Route controllers
│   ├── models/               # MongoDB models
│   ├── routers/              # API routes
│   ├── middlewares/          # Custom middlewares
│   ├── utils/                # Utility functions
│   └── index.js              # Server entry point
│
├── src/                      # Frontend (Next.js)
│   ├── app/                  # Next.js app directory
│   │   ├── (public)/         # Public pages
│   │   ├── dashboard/        # Admin dashboard
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── ui/               # UI components
│   │   ├── auth/             # Authentication components
│   │   ├── Parks/            # Park-related components
│   │   └── ...
│   ├── context/              # React contexts
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utility libraries
│   ├── services/             # API services
│   ├── store/                # State management
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
│
└── README.md
```

## 🔐 User Roles

- **Super Admin**: Full system access
- **Admin**: Park and activity management
- **Sous Admin**: Limited park management for assigned parks
- **User**: Browse parks, make bookings, manage profile

## 🎯 Key Features Explained

### Park Management
- Create and edit adventure parks
- Upload images and videos
- Set working hours and rules
- Manage facilities and gallery

### Activity System
- Define activities for each park
- Set pricing and availability
- Manage time slots and capacity

### Booking System
- Real-time availability checking
- Time slot selection
- Shopping cart functionality
- Payment processing

### Admin Dashboard
- Comprehensive analytics
- User management
- Content management (news, FAQ, about)
- Booking oversight

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout
- `GET /api/auth/profile` - Get user profile

### Parks
- `GET /api/parks` - Get all parks
- `POST /api/parks` - Create park (admin)
- `PUT /api/parks/:id` - Update park (admin)
- `DELETE /api/parks/:id` - Delete park (admin)

### Activities
- `GET /api/activity` - Get all activities
- `POST /api/activity` - Create activity (admin)
- `PUT /api/activity/:id` - Update activity (admin)

### Bookings
- `GET /api/booking` - Get user bookings
- `POST /api/booking` - Create booking
- `PUT /api/booking/:id` - Update booking

## 🧪 Testing

```bash
# Run frontend tests
cd src
npm test

# Run backend tests
cd Archive
npm test
```

## 📦 Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create a new app on your hosting platform
2. Set environment variables
3. Connect to MongoDB Atlas for production database
4. Deploy from repository

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Express.js](https://expressjs.com/) for the backend framework
- [MongoDB](https://www.mongodb.com/) for the database solution
```

This README provides a comprehensive overview of your Adventure Park project, including setup instructions, project structure, features, and deployment guidelines. You may want to customize certain sections based on your specific requirements or add additional information about your particular implementation details.

