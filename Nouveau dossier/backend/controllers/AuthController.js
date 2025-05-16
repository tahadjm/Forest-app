import jwt from 'jsonwebtoken'
import {isCodeexpired,forgotpswSchema,verificationcodeSchema,SigninSchema, changepswSchema ,SignupSchema} from '../middlewares/Validator.js'
import User from '../models/UserModel.js'
import Park from '../models/ParkShcema.js'
import {hmacProcess,doHash,doHashValidation} from "../utils/hashing.js"
import transport from '../middlewares/sendMail.js'
import mongoose, { isValidObjectId } from "mongoose";

export const setUserRole = async (req, res) => {
    try {
      // Extract userId from params and role/parkId from the query parameters.
      const { userId } = req.params;
      const { role: rawRole, parkId } = req.query;
      const role = decodeURIComponent(rawRole || "");
  
      // Define allowed roles
      const allowedRoles = ["user", "sous admin"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Allowed roles are 'user' and 'sous admin'" });
      }
  
      // If setting the role to "sous admin", ensure parkId is provided and valid
      if (role === "sous admin") {
        if (!parkId || !mongoose.Types.ObjectId.isValid(parkId)) {
          return res.status(400).json({ message: "Invalid or missing parkId for sous admin role" });
        }
        // Verify that the park exists
        const park = await Park.findById(parkId);
        if (!park) {
          return res.status(404).json({ message: "Park not found" });
        }
      }
  
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update user's role and, if applicable, assign the parkId
      user.role = role;
      if (role === "sous admin") {
        user.parkId = parkId;
      } else {
        // Optionally clear parkId for regular users
        user.parkId = undefined;
      }
  
      await user.save();
  
      res.status(200).json({ message: `User role updated to ${role}`, user });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };


const signup = async (req, res) => {
    const { email , password ,username} = req.body;
    try {
        const{ error,value} = SignupSchema.validate({email,password,username})
        if ( error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        const existinguser = await User.findOne({email})
        if(existinguser){
            return res.status(401).json({success:false,message:'User already exsists'})
        }

        const hashedpsw = await doHash(password, 12)

        const newUser = new User({
            email,
            password:hashedpsw,
        })
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({
            success:true,message:'your account has been created successfully',result
        })

    } catch (error) {
        console.log(error)
    }
};

const signin = async (req,res) =>{
    const { email , password} = req.body;
    try {
        const existinguser = await User.findOne({email}).select('+password')
        if(!existinguser)
            return res.status(401).json({success:false,messgae:'User not exists'})
        const validationresult = await doHashValidation(password,existinguser.password)
        if(!validationresult)
            return res.status(401).json({success:false,message:'incorrect password'})
        const token = jwt.sign({
            userId:existinguser._id,
            email:existinguser.email,
            verified :existinguser.verified
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn :'8h',
        }
        );
        res.cookie('Authorization', 'Bearer' +token 
            , {expires: new Date(Date.now() + 8*3600000)
            , httponly:process.env.MODE_ENV === 'production'
            , secure:process.env.MODE_ENV === 'production'}
        )
        .json({
            success:true,
            token,
            message:'logged in successfully'
        })
    } 
    catch (error) { 
        console.log(error); res.status(500).json({ success: false, message: 'Internal server error' });
     }
}

const signout = async (req, res) => {
    res.clearCookie('Authorization').status(200).json({ success: true, message: 'logged out successfully' });
};

const deleteUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const getallusers = async (req,res) => {
    try {
        const { userId } = req.query;
        const query = userId ? { _id: userId } : {}; // Filtrer par userId si fourni, sinon récupérer tous les utilisateurs
        
        const users = await User.find(query);
        
        res.status(200).json({ message: "Fetched users successfully", data: users , success: true});
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users", error: error.message ,succes: false });
    }
};
const getAdmins = async (req, res) => {
    try {
      const admins = await User.find({ role: "admin" });
      res.status(200).json({ admins });
    } catch (error) {
      res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  };
  
  const getSousAdmins = async (req, res) => {
try {
      const sousAdmins = await User.find({ role: "sous admin" })
        .populate("parkId", "name"); // Populate parkId with the park's name (and _id by default)
    res.status(200).json({ sousAdmins });
    } catch (error) {
    res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
    });
    }
  };

export const getUserRole = async (req,res) =>{
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
        return res.status(404).json({
        success: false,
        message: 'User not found'
        });
    }
    return res.json({userRole:user.role})
    } catch (error) {
    
    }
}

export const getCurrentUser = async (req, res) => {
  try {
    // The user ID should be available from the auth middleware
    // that processed the JWT token before this controller was called
    const userId = req.user.id;

    // Find the user by ID, excluding the password
    const user = await User.findById(userId).select('-password');

    if (!user) {
    return res.status(404).json({
        success: false,
        message: 'User not found'
    });
    }

    // If the user has a parkId, populate that information
    let userWithPark = user;
    if (user.parkId) {
    userWithPark = await User.findById(userId)
        .select('-password')
        .populate('parkId', 'name location');
    }

    // Return the user data
    return res.status(200).json({
    success: true,
    data: userWithPark
    });
} catch (error) {
    console.error('Error in getCurrentUser controller:', error);
    return res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
}
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params; // Récupérer l'ID depuis l'URL
        const { email, username } = req.query; // Récupérer les données du corps de la requête

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        let updateFields = {};
        if (email) updateFields.email = email;
        if (username) updateFields.username = username;

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({succes:true, message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateUserFeild = async (req, res) => {
    try {
        const {userId} = req.query;
        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }


        const { field, value } = req.body;
        if (!field || !value) {
            return res.status(400).json({ success: false, message: "Field and value are required." });
        }

        if(field !== "email" && field !== "username")
        {
            return res.status(400).json({ success: false, message: "Invalid field. You can only update 'username' or 'email' in this request." });
        }
        if (Object.keys(req.body).length > 2) {
            return res.status(400).json({ success: false, message: "Only one field and one value can be updated at a time." });
        }


        const updateFields = { [field]: value }; // Use computed property name
        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, message: "User updated successfully.", user: updatedUser });
    } catch (error) {
        console.error("Error updating user field:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const sendverificationcode = async (req, res) => {
    const { email } = req.body;
    try {
        const existinguser = await User.findOne({ email });
        if (!existinguser) {
            return res.status(404).json({
                success: false,
                message: 'User does not exist!'
            });
        }
        if (existinguser.verified) {
            return res.status(400).json({ success: false, message: 'You are already verified' });
        }
        const codevalue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_USER,
            to: existinguser.email,
            subject: 'Account verification code ',
            text: 'This is a plain text email',
            html: '<h1>' + codevalue + '</h1>'
        });
        if(info.accepted[0] === existinguser.email){
            const hashedcode = hmacProcess(codevalue,process.env.HMAC_VERIFICATION_SECRET_KEY)
            existinguser.verificationcode = hashedcode
            existinguser.verificationcodevalidation = Date.now()
            await existinguser.save()
            return res.status(200).json({ success: true, message: 'Verification code sent', existinguser,hashedcode });

        }
        else {
        // Only one response is needed for failure case
            return res.status(400).json({
                success: false,
                message: 'Code sending failed'
            })
        }} catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const verificationcodevalidation = async (req, res) => {
    const { email, providedcode } = req.body;

    try {
        // Validate request body
        const { error } = verificationcodeSchema.validate({ email, providedcode });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // Find user
        const existingUser = await User.findOne({ email }).select('+verificationcode +verificationcodevalidation');
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User does not exist' });
        }

        // Check if already verified
        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: 'Your account is already verified' });
        }

        // Check if verification code exists
        if (!existingUser.verificationcode || !existingUser.verificationcodevalidation) {
            return res.status(400).json({ success: false, message: 'Invalid or missing verification code' });
        }

        // Check if code has expired (5 minutes validity)
        if (Date.now() - existingUser.verificationcodevalidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: 'Verification code has expired' });
        }

        // Hash provided code and compare
        const hashedCodeValue = hmacProcess(providedcode, process.env.HMAC_VERIFICATION_SECRET_KEY);
        if (hashedCodeValue !== existingUser.verificationcode) {
            return res.status(400).json({ success: false, message: 'Incorrect verification code' });
        }

        // Mark user as verified
        existingUser.verified = true;
        existingUser.verificationcode = undefined;
        existingUser.verificationcodevalidation = undefined;
        await existingUser.save();

        return res.status(200).json({ success: true, message: 'Your account has been verified successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const changingpsw = async (req, res) => {
    const { id, verified } = req.user;
    const { oldPassword, newPassword } = req.body;

    try {
        // Validate the new password against schema
        const { error, value } = changepswSchema.validate({ oldPassword, newPassword });
        if (error) {
            return res.json({ success: false, message: error.details[0].message });
        }

        // Check if user is verified
        if (!verified) {
            return res.json({ success: false, message: "Your account is not verified" });
        }

        // Find the existing user
        const existingUser = await User.findOne({ _id: id }).select('+password');
        if (!existingUser) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        // Validate the old password
        const result = doHashValidation(oldPassword, existingUser.password);
        if (!result) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Check if the new password is the same as the old password
        if (oldPassword === newPassword) {
            return res.json({ success: false, message: "New password cannot be the same as the old password" });
        }
        
        const hashedpsw = await doHash(newPassword,12);
        existingUser.password = hashedpsw;
        await existingUser.save();
        return res.json({succes:true,message:"Your password has been changed succsefully"})
        
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "An error occurred" });
    }
};
const sendforgetpasswordcode = async (req, res) => {
    const { email } = req.body; 
    try {
        const existinguser = await User.findOne({ email });
        if (!existinguser) {
            return res.status(404).json({
                success: false,
                message: 'User does not exist!'
            });
        }
        if (!existinguser.verified) {
            return res.status(400).json({ success: false, message: 'You are not verified' });
        }
        const codevalue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_USER,
            to: existinguser.email,
            subject: 'forget password code ',
            text: 'This is a plain text email',
            html: '<h1>' + codevalue + '</h1>'
        });
        if(info.accepted[0] === existinguser.email){
            const hashedcode = hmacProcess(codevalue,process.env.HMAC_VERIFICATION_SECRET_KEY)
            existinguser.forgetpasswordcode = hashedcode
            existinguser.forgetpasswordcodevalidation = Date.now()
            await existinguser.save()
            return res.status(200).json({ success: true, message: 'Verification code sent', existinguser,hashedcode });

        }
        else {
        // Only one response is needed for failure case
            return res.status(400).json({
                success: false,
                message: 'Code sending failed'
            })
        }} catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const sendforgetpasswordcodevalidation = async (req,res) =>{
    const {email,providedcode,newPassword} = req.body;
    try {
        const {error,value} = forgotpswSchema.validate({email,providedcode,newPassword})
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        const existinguser = await User.findOne({email})
        if(!existinguser){
            res.json({test:"2"})
             return res.status(401).json({status:false,message:'User dosnt exists'})
        }
        if (!existinguser.verified) {
            res.json({test:"3"})
            return res.status(400).json({ success: false, message: 'You are not verified' });
        }

        if(!existinguser.forgetpasswordcode ||!existinguser.forgetpasswordcodevalidation ){
            res.json({test:"4"})
            return res.status(401).json({status:false,message:'something is wrong with the code'})
        }
        if(isCodeexpired(existinguser.forgetpasswordcodevalidation)){
            return res.status(401).json({status:false,message:'Code has been expired'})
        }              

        const hashedcodevalue =  hmacProcess(providedcode ,process.env.HMAC_VERIFICATION_SECRET_KEY )
        if (hashedcodevalue === existinguser.forgetpasswordcode)
            {   
                const hashedpsw = await doHash(newPassword,12)
                
                existinguser.password = hashedpsw
                existinguser.forgetpasswordcode = undefined;
                existinguser.forgetpasswordcodevalidation = undefined;
                await existinguser.save()
                return res.status(200).json({success:true,message:'your password has been changed successfully'})
            }
        else if (hashedcodevalue !== existinguser.forgetpasswordcode)
            {
        return res.status(400).json({success:false,message:'invalid code'})
        }
        else 
            return res.status(400).json({success:false,message:'unexpected occured!'})

    } catch (error) {
        console.log(error)
    }
}


export { updateUserFeild,deleteUserById,updateUser, getAdmins,getSousAdmins, sendforgetpasswordcode,sendforgetpasswordcodevalidation,changingpsw,verificationcodevalidation,sendverificationcode,getallusers,signout,signin,signup}

