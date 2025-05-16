import express, { json } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Routers
import { AuthRouter } from "./routers/AuthRouter.js";
import { PostRouter } from "./routers/PostRouter.js";
import { ActiviyRouter } from "./routers/ActivityRouter.js";
import { ParkRouter } from "./routers/ParkRouter.js";
import { PricingRouter } from "./routers/PricingRouter.js";
import { BookingRouter } from "./routers/BookingRouter.js";
import { PaymentRouter } from "./routers/PaymentRouter.js";
import { CartRouter } from "./routers/CartRouter.js";
import { SlotRouter } from "./routers/TimeSlotRouter.js";
import { UploadRouter } from "./routers/UploadRouter.js";
import { ChangelogRouter } from "./routers/ChangelogRouter.js";
import { NewsRouter } from "./routers/NewsRouter.js";
import { AboutPageRouter } from "./routers/aboutPageRouter.js";
import { FAQRouter } from "./routers/FAQRouter.js";
import { SecuritySectionRouter } from "./routers/SecuritySectionRouter.js";

const app = express();

// Use express.json() with raw body capture if needed
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // Store raw body for later verification
    },
  })
);
app.use(cors({
    origin: 'http://localhost:3000', // Specify your Next.js client URL
    credentials: true, // Allow credentials (cookies, auth headers, etc.)
  }));

// Use sessions with a dedicated secret
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(helmet());
app.use(json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Serialize user into the session (storing the user ID)
passport.serializeUser((user, done) => {
  done(null, user._id || user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    // If you have a User model, you can look up the user by id:
    // const user = await User.findById(id);
    // For now, we'll simply return the id.
    done(null, { id });
  } catch (err) {
    done(err, null);
  }
});

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,         // from .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // from .env
      callbackURL: "/api/auth/google/callback",       // must match your Google settings
    },
    (accessToken, refreshToken, profile, done) => {
      // In production, look up the user in your database here.
      // If not found, create a new user record.
      return done(null, profile);
    }
  )
);

// Mount routers
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", AuthRouter);
app.use("/api/posts", PostRouter);
app.use("/api/activity", ActiviyRouter);
app.use("/api/parks", ParkRouter);
app.use("/api/pricing", PricingRouter);
app.use("/api/booking", BookingRouter);
app.use("/api/payments", PaymentRouter);
app.use("/api/cart", CartRouter);
app.use("/api/timeslots", SlotRouter);
app.use("/api/upload",UploadRouter)
app.use("/api/changelog",ChangelogRouter)
app.use("/api/news",NewsRouter)
app.use("/api/aboutpage",AboutPageRouter)
app.use("/api/faq",FAQRouter)
app.use("/api/Security",SecuritySectionRouter)

// Root route
app.get("/", (req, res) => {
  res.json({ message: "hello from the server" });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
