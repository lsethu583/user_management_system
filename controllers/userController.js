const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const securePassword = async(password)=>{
    try {
         const passwordHash = bcrypt.hash(password,10)
         return passwordHash
    } catch (error) {
        console.log(error.message)
    }

}

const loadRegister = async(req,res)=>{
    try {
        
        const err = req.session.err_msg;
        req.session.err_msg = null;
        res.render('registration', { message: err });
    } catch (error) {
        console.log(error.message)

        
    }
}
// 

const insertUser = async (req, res) => {
    try {
        // email or phone number already exists
        const existingUser = await User.findOne({
            $or: [
                { email: req.body.email },
                { mobile: req.body.mno }
            ]
        });

        

        if (existingUser) {
            req.session.err_msg = "Email or phone number is already taken";
            return res.redirect('/register');
        }

        //email and phone number are not taken, proceed with user registration
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            password: spassword,
            is_admin: 0,
        });

        const userData = await user.save();
        console.log(userData);

        if (userData) {
            req.session.err_msg = "Your registration has been successful";
            res.redirect('/register');
        } else {
            req.session.err_msg = "Your registration has failed";
            res.redirect('/register');
        }
    } catch (error) {
        console.log(error.message); 
        req.session.err_msg = "An error occurred during registration";
        res.redirect('/register');
    }
};


const loginLoad = async (req, res) => {
    try {
        const err = req.session.err_msg;
        req.session.err_msg = null; 
        res.render('login', { message: err });
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email=req.body.email
        const password=req.body.password

        const userData = await User.findOne({email:email})

        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch &&userData.is_admin===0){
                req.session.user_id = userData._id
                res.redirect('/home')

            }
            else{
                req.session.err_msg="Invalid User";
                res.redirect('/login')
            }


        }
        else{
            
            req.session.err_msg="Invalid User";
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const loadHome = async(req,res)=>{
    try {
        res.render('home')
        
    } catch (error) {
        console.log(error.message)
    }
}
const userLogout = async(req,res)=>{
    try {
        req.session.user_id=null
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}
async function getUserDataById(userId) {
    try {
      return await User.findOne({ _id: userId });
    } catch (error) {
      console.error(error);
      return null;
    } 
  }
module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    getUserDataById
}
