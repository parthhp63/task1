const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const mysql = require('mysql');
const port = 9012;
var created_time=require('./created_time'); 
const md5 = require('md5');
var jwt = require('jsonwebtoken');

var secretkey='secretkey';

app.get('/',(req,res)=>{
    res.json({
        message:'Sample API'
    })
})

app.post('/login',(req,res)=>{
    const user={
        id:1,
        username:'Parth Patil',
        email:'parth@gmail.com'
    };
    jwt.sign(user,secretkey,{expiresIn:'3000s'}, (err,token)=>{
        res.json({
            token:token
        })
    })
})

app.listen(port,()=>{
    console.log(`Server is running at port ${port}`)
})