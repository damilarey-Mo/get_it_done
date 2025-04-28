# Get It Done - Local Errand, Courier & Delivery Platform

A professional, scalable SaaS platform enabling users to book errands, request deliveries, and hire trusted runners for daily tasks.

## 🚀 Features

- **Authentication & User Management**
  - Secure user & runner registration
  - Social login integration
  - Email/phone OTP verification
  - Role-based access control

- **Errand Booking System**
  - Multiple errand types
  - Dynamic pricing
  - Real-time tracking
  - Secure payments

- **Runner Management**
  - Real-time availability
  - GPS tracking
  - Rating system
  - Earnings management

- **Admin Dashboard**
  - User management
  - Order monitoring
  - Financial reports
  - Analytics

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, Redux Toolkit, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Real-time**: Socket.io
- **Maps**: Google Maps API
- **Payments**: Paystack, Flutterwave
- **Notifications**: OneSignal, SendGrid, Twilio

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/get_it_done.git
cd get_it_done
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend (.env)
cp backend/.env.example backend/.env

# Frontend (.env)
cp frontend/.env.example frontend/.env
```

4. Start development servers:
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm start
```

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_key
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 📝 API Documentation

API documentation is available at `/api-docs` when running the backend server.

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@getitdone.com or join our Slack channel. 