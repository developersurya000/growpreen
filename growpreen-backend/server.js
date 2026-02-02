// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// import adminTasksRoutes from './routes/adminTasks.js';
import authRoutes from './routes/auth.js';
import tasksRoutes from './routes/tasks.js';
import adminRoutes from './routes/admin.js';
import referralRoutes from './routes/referrals.js';
import paymentsRoutes from './routes/payments.js';
import adminAuthRoutes from './routes/adminAuth.js';
import withdrawalsRoutes from './routes/withdrawals.js';
import profileRoutes from './routes/profile.js';
import notificationsRoutes from './routes/notifications.js';
import authAdminCookie from './middleware/authAdminCookie.js';
// import adminPaymentsRoutes from './routes/adminPayments.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
 // replace after Netlify URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());

// public user routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/withdrawals', withdrawalsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationsRoutes);

// admin auth (login/logout/me) – public
app.use('/api/admin-auth', adminAuthRoutes);

// protected admin APIs – must be AFTER admin auth and use authAdminCookie
app.use('/api/admin', authAdminCookie, adminRoutes);
// app.use('/api/admin', authAdminCookie, adminPaymentsRoutes);
// app.use('/api/admin', authAdminCookie, adminTasksRoutes);
app.get('/', (req, res) => {
  res.send('Growpreen backend running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
