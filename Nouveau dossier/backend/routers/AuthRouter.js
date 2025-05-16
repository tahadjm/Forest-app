import passport from "passport"
import {
  sendforgetpasswordcode,
  sendforgetpasswordcodevalidation,
  changingpsw,
  signin,
  signout,
  signup,
  getallusers,
  verificationcodevalidation,
  sendverificationcode,
  getCurrentUser,
  setUserRole,
  getUserRole,
  getAdmins,
  getSousAdmins,
  updateUser,
  deleteUserById,
  updateUserFeild
} from "../controllers/AuthController.js"
import jwt from "jsonwebtoken" // ✅ Import jsonwebtoken
import { Router } from "express"
import { authenticate, identifier } from "../middlewares/identifier.js"

const router = Router()

// Email/Password based routes
router.post("/signup", signup)
router.post("/signin", signin)
router.post("/signout", signout)
router.get("/profile", identifier, getCurrentUser)
router.patch("/sendcode", authenticate, sendverificationcode)
router.patch("/codeverification", authenticate, verificationcodevalidation)
router.patch("/change-psw", identifier, changingpsw)
router.patch("/forgetpsw", sendforgetpasswordcode)
router.patch("/forgetpswvalidation", sendforgetpasswordcodevalidation)
router.patch("/setrole/:userId", setUserRole)
router.patch("/user/update-feild",identifier, updateUserFeild)
router.get("/getrole", identifier, getUserRole)
router.get("/admin", identifier, getAdmins)
router.get("/sousadmin", identifier, getSousAdmins)
router.get("/users", getallusers)
router.put("/user/update/:userId", updateUser)
router.delete("/users/:userId", deleteUserById)

// Google OAuth Routesrouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
// Callback route that Google redirects to
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/google/failure" }),
  (req, res) => {
    try {
      // Create a JWT for the authenticated user
      const token = jwt.sign(
        {
          userId: req.user._id,
          email: req.user.email,
          verified: req.user.verified || false,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "8h" },
      )

      // Set the token as a cookie
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.MODE_ENV === "production",
        secure: process.env.MODE_ENV === "production",
      })

      // Redirect to frontend with token
      const redirectUrl = process.env.FRONTEND_URL || "http://localhost:3000"
      res.redirect(`${redirectUrl}?token=${token}`)
    } catch (error) {
      console.error("Google auth error:", error)
      res.redirect("/api/auth/google/failure")
    }
  },
)

// Failure route (optional)
router.get("/google/failure", (req, res) => {
  res.status(401).json({ success: false, message: "Google authentication failed" })
})

export const AuthRouter = router

