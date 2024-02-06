
const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system")



 const express = require("express")
 const session = require('express-session');
 const app = express()
 app.use(session({
   secret: 'your-secret-key',
   resave: false,
   saveUninitialized: true,
 }));

 app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate,private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
 next();
});
 
 const userRoute = require('./routes/userRoute')
 const path=require('path')
 


 app.use('/',userRoute)

 const adminRoute = require('./routes/adminRoute')
 app.use('/admin',adminRoute)
 
 app.use('/static',express.static(path.join(__dirname,'public')));
 

 app.listen(3000,()=>{
    console.log("Server is running...");
 })
