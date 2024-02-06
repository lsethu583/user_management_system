const User = require('../models/userModel')
const userController = require('./userController')
const bcrypt = require('bcrypt')
const randomstring = require('randomstring')
const mongoose = require('mongoose')
const securePassword = async(password)=>{
    try {
         const passwordHash = bcrypt.hash(password,10)
         return passwordHash
    } catch (error) {
        console.log(error.message)
    }

}
const loadLogin = async(req,res)=>{
    try {
        const err = req.session.err_msg;
        req.session.err_msg = null;
        res.render('login', { message: err });
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email=req.body.email
        const password=req.body.password

        const userData = await User.findOne({email:email})

        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch &&userData.is_admin===1){
                req.session.admin = userData._id
                res.redirect('/admin/home')

            }
            else{
                req.session.err_msg = "Authentication denied";
                res.redirect('/admin');
                
            }
        }
        else{
            req.session.err_msg = "Authentication denied";
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message)
    }
}
const loadDashboard = async(req,res)=>{
    
    try {
        if (!req.session.admin) {
            res.redirect("/admin")
        }
        const userData = await User.findById({_id:req.session.admin})
        
        res.render('home',{admin:userData})
    } catch (error) {
        console.log(error.message)
    }

}
const logout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}
const adminDashboard = async(req,res)=>{
    try {
        let search =''
        
        if(req.query.search){
            search =req.query.search
        }
        const usersData = await User.find({
            is_admin:0,
            $or:[
                {
                    name:{ $regex:'.*'+search+'.*',$options:'i'}
                },
                {
                    email:{ $regex:'.*'+search+'.*',$options:'i'}
                },
                {
                    mobile:{ $regex:'.*'+search+'.*',$options:'i'}
                }

            ]
        })
        res.render('dashboard',{users:usersData,search:search})
    } catch (error) {
        console.log(error.message)
    }
}

const newUserLoad = async(req,res)=>{
    try {
        res.render('new-user')
    } catch (error) {
        console.log(error.message)
    }
}
const addUser = async(req,res)=>{
    try {
        const name = req.body.name
        const email = req.body.email
        const mobile = req.body.mobile
        const password = randomstring.generate(8) 
        const spassword = await securePassword(password)

       const user = new User({
        name:name,
        email:email,
        mobile:mobile,
        password:spassword,
        is_admin:0
       })
       const userData = await user.save()
       if( userData){
        res.redirect('/admin/dashboard')

       }
       else{
        res.render('new-user',{message:"Something wrong"})

       }
    } catch (error) {
        console.log(error.message)
    }
}
const editUserLoad = async(req,res)=>{
    try {
        const id = req.query.id
         const userData = await User.findById({_id:id})
         if(userData){
            res.render('edituser',{user:userData})
         }
         else{
            res.redirect('/admin/dashboard')
         }

        
    } catch (error) {
        console.log(error.message)
    }
}
const updateUsers = async(req,res)=>{
    console.log(req.body)


    try {
       const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile}})
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message)
    }
}


const deleteUser = async (req, res) => {
    try {
        const id = req.query.id;
        const userToDelete = await User.findOne({ _id: id });

        if (!userToDelete) {
            // Handle the case where the user doesn't exist
            return res.status(404).send('User not found');
        }

        // Check if a query parameter (confirm) is included in the request
        if (req.query.confirm === 'true') {
            // If confirmed, proceed with the user deletion
            await User.deleteOne({ _id: id });

            if (req.session.user_id === id) {
                req.session.user_id = null;
                res.redirect('/admin/dashboard');
            } else {
                console.log('User deleted successfully');
                res.redirect('/admin/dashboard');
            }
        } else {
            // If not confirmed, render a confirmation page
            res.render('confirmDelete', { userId: id });
        }
    } catch (error) {
        console.error(error.message);
        // Handle the error and potentially redirect to an error page
        res.status(500).send('Internal Server Error');
    }
};




  
  
  
  
  
module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUsers,
    deleteUser
}