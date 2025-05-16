import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js'; // Adjust the path based on your project structure

export const identifier = async (req, res, next) => {
    let token;

    if (req.headers.client === 'not-browser') {
        token = req.headers.authorization;
    } else {
        token = req.cookies['Authorisation'];
    }
      token = req.headers.authorization
    if (!token) {
        return res.status(403).json({ status: false, message: "Unauthorized - No token provided" });
    }
    try {
        const userToken = token.split(' ')[1]; // Ensure correct format: 'Bearer <token>'
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
        if (!jwtVerified) {
          return res.status(401).json({ status: false, message: "Unauthorized - Invalid token" });
        }
        const userId = jwtVerified.userId
        console.log(userToken)

        // Fetch the user from the database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Ensure the user is verified before proceeding
        if (!user.verified) {
            return res.status(403).json({ status: false, message: "Unauthorized - Account not verified" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ status: false, message: "Unauthorized - Token verification failed" });
    }
};

export const authenticate = async (req, res, next) => {
  let token;

  // Extract token from headers or cookies
  if (req.headers.client === "not-browser") {
    token = req.headers.authorization;
  } else {
    token = req.cookies["Authorization"];
  }

  // Ensure a token is provided
  if (!token) {
    return res.status(403).json({ status: false, message: "Unauthorized - No token provided" });
  }

  try {
    // Ensure the token follows "Bearer <token>" format
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ status: false, message: "Invalid token format" });
    }

    // Extract the actual token
    const userToken = token.split(" ")[1];

    if (!userToken) {
      return res.status(401).json({ status: false, message: "Token missing" });
    }

    // Verify the token
    const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

    if (!jwtVerified) {
      return res.status(401).json({ status: false, message: "Unauthorized - Invalid token" });
    }

    // Find the user in the database
    const user = await User.findById(jwtVerified.userId);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ status: false, message: "Unauthorized - Token verification failed" });
  }
};

export const isAdmin = async (req, res, next) => {
    try {
      let token;

      if (req.headers.client === 'not-browser') {
          token = req.headers.authorization;
      } else {
          token = req.cookies['Authorisation'];
      }
        token = req.headers.authorization
      if (!token) {
          return res.status(403).json({ status: false, message: "Unauthorized - No token provided" });
      }
      const userToken = token.split(' ')[1]; // Ensure correct format: 'Bearer <token>'
      const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
      
      if (!jwtVerified) {
        return res.status(401).json({ status: false, message: "Unauthorized - Invalid token" });
      }
      const user = await User.findById(jwtVerified.userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
