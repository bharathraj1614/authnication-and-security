require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});

const user = mongoose.model('user', userSchema);


app.get('/',function (req,res) {
    
    res.render('home.ejs');
});

app.get('/login',function (req,res) {
    
    res.render('login.ejs');
});

app.get('/register',function (req,res) {
    
    res.render('register.ejs');
});


app.post('/register',function (req,res) {
    
    const newUser = new user({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function (err) {
        
        if (!err) {
            res.render('secrets.ejs');
        }else{
            console.log(err);
        }

    });

});

app.post('/login', function (req,res) {
    
    const email= req.body.username;
    const password= req.body.password;

    user.findOne({email: email},function (err, foundRecords) {

        if(err){
            console.log(err);
        }else{
            if (foundRecords.password==password) {
                res.render('secrets.ejs')
            }
        }
        
    });

});
















app.listen(3000,function () {
    
    console.log("Port started at 3000");

});