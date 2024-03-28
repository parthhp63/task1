const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const mysql = require('mysql');
const port = 9014;
var created_time=require('./created_time'); 
const md5 = require('md5');
var jwt = require('jsonwebtoken');
const authorization= require('./middleware/authorization');
var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
var fs=require('fs');
app.set('view engine', 'ejs');


app.use(express.static(__dirname ));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "maindb"
});

connection.connect((err) => {
if (err) throw err;
console.log('Connected to the  database!');
});


app.get('/',(req,res)=>{
res.render('register.ejs')
})


app.get('/checkemail/:email',(req,res)=>{
  console.log(req.params.email);
  var q17=`select count(*) as counter from user_info where email='${req.params.email}'`
  connection.query(q17, (err, result) => {
    console.log(q17);
    if (err) throw err;
    else{
      console.log('result[0].counter',result[0].counter);
      const emailExists=result[0].counter>=1
        res.send({emailExists});
    }
  })
})

app.post('/submit/:code', async(req,res)=>{
  var code=req.params.code;
    var formData=req.body;
    var data=req.body;
    var del=formData.del;
    console.log('delll',del);
    console.log(formData);



    var q = `insert into user_info(fname,lname,email,phone,activation,status)
  values('${formData.first_name}','${formData.last_name}','${formData.email}','${formData.phone}','${code}','Deactive');`;

  res.send(code);

connection.query(q, (err, result) => {
  console.log(q);
  if (err) throw err;
})
})

app.get('/link ', async(req,res)=>{
   res.write('link');
   res.end();
})

app.get('/created_time',created_time);


//  Salt Creation....
function salt(){
  let len=4;
  let res="";
  const charc="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const total=charc.length;
  let count=0;
  while(count<len){
      res +=charc.charAt(Math.floor(Math.random()* total));
      count +=1;
  }
  return res;
}

app.get('/passwd/:actcode',(req,res)=>{
  q15=`select count(*) as counter from user_info where activation='${req.params.actcode}'`
  connection.query(q15, (err, result) => {
    console.log(q15);
    if (err) throw err;
    else{
      if(result[0].counter==1){
        res.render('password.ejs')}
        else{
          res.send('invalid url');
        }

    }
  })
})

app.post('/passwd/:actcode', async(req,res)=>{

  var actcode=req.params.actcode;
    var formData=req.body;
    var data=req.body;
    var pass=formData.create_passwd;
    console.log(actcode);
    console.log(formData);
    res.json();
   
    var newsalt=salt();
    var newpass=pass+newsalt;
    console.log(newpass);
    let updatedpassword=md5(newpass);
    console.log(updatedpassword);


  q4= `UPDATE user_info
  SET password ='${updatedpassword}', salt = '${newsalt}',status='active'
  WHERE activation='${actcode}'; `
  connection.query(q4, (err, result) => {
    console.log(q4);
    if (err) throw err;
  })
})


//  Login..

app.get('/login',(req,res)=>{
res.render('login.ejs')
})

app.post('/login',(req,res)=>{
    let formData=req.body;
    let flag=true;
    console.log(formData);
    let mix;
    let passnew;
    q7=`select * from user_info`;
    connection.query(q7,(err,result)=>{
      if(err) throw err;
      result.forEach(data => {
        if(data.email==formData.email){
          console.log('email found');
          mix=formData.password+data.salt;
          console.log('mixxxx',mix);
          passnew=md5(mix);

          if(passnew== data.password){
            console.log('succesfull');
            flag=true;
            const user={
              email:formData.email,
          };
          console.log(user);
          const token=jwt.sign(user,"hi",{
              expiresIn:"1800s",
          });
          res.cookie('access_token',token,{
              maxAge:1000*60*60*10,
              httpOnly:true,
          })
          .status(200)
          
          }
          else{
            flag=false;
          }
        }
        else{
          flag=false;
        }
      });
      res.json(flag);
      console.log('flaffggg',flag);

    })

})


// forget passwd.

app.get('/forget/:email',(req,res)=>{
  console.log('forgetemail', req.params.email);
  q17=`select count(*) as counter from user_info where email='${req.params.email}'`
  console.log(q17);
  connection.query(q17, (err, result) => {
    console.log(q17);
    if (err) throw err;
    else{
      console.log('result[0].counter',result[0].counter);
      if(result[0].counter>=1){
        console.log('result[0].counter',result[0].counter);
        res.render('password.ejs')
      }
        else{
          res.send('invalid gmail');
        }

    }
  })
})

app.post('/forget/:email', async(req,res)=>{
  var email=req.params.email;
    var formData=req.body;
    var pass=formData.create_passwd;
    // console.log(formData);
    res.json();

    var newsalt=salt();
    var newpass=pass+newsalt;
    console.log(newpass);
    let updatedpassword=md5(newpass);
    console.log(updatedpassword);


  q8= `UPDATE user_info
  SET password ='${updatedpassword}', salt = '${newsalt}',status='active'
  WHERE email='${email}'; `
  connection.query(q8, (err, result) => {
    console.log(q8);
    if (err) throw err;
  })
    
})

// app.get('/next',authorization.authorization,(req,res)=>{
//   res.write('login successful');
//   res.end();
// })

///  ALL combine projects tasks......



// Database Initilization....


app.get('/first',authorization.authorization,(req,res)=>{
    res.render('home.ejs');
})

app.get('/dynamictable',authorization.authorization,(req,res)=>{
    res.render('dynamictable.ejs');
})

app.get('/kukucube',authorization.authorization,(req,res)=>{
    res.render('kukucube.ejs');
})

app.get('/tictactao',authorization.authorization,(req,res)=>{
    res.render('tictactao.ejs');
})

app.get('/sorting',authorization.authorization,(req,res)=>{
    res.render('sorting.ejs');
})

app.get('/jsevent',authorization.authorization,(req,res)=>{
    res.render('jsevent.ejs')
})





// Student Details Pagination component......
const max_page=250;
const_record=200;


let current=0;
let limit=200;
var field_name='stu_id';

app.get("/studentpagination",authorization.authorization,(req,res)=>{
    const q=`select * from student_details_26feb order by ${field_name} limit 200 OFFSET ?`;
    current=0;

    connection.query(q,[current],(err,result)=>{
        if (err) throw err;
        let currentno=(current/200)+1;
        res.render('stu_details_pagi_26feb.ejs',{user:result, currentno:currentno});
    });

})

app.get("/previousp",authorization.authorization,(req,res)=>{

    
    current -=200;
    const q=`select * from student_details_26feb order by ${field_name} limit 200 OFFSET ?`;
    connection.query(q,[current],(err,result)=>{
        if (err) throw err;
        let currentno=(current/200)+1;
        res.render('stu_details_pagi_26feb.ejs',{user:result, currentno:currentno})
    });
})

app.get("/nextp",authorization.authorization,(req,res)=>{
    
    current +=200;
    const q=`select * from student_details_26feb order by ${field_name} limit 200 OFFSET ?`;

    connection.query(q,[current],(err,result)=>{
        if (err) throw err;
        let currentno=(current/200)+1;
        res.render('stu_details_pagi_26feb.ejs',{user:result, currentno:currentno});
    });
})


app.get("/lastp", authorization.authorization,(req,res)=>{
    current=10000;
    const q=`select * from student_details_26feb order by ${field_name} limit 200 OFFSET 9800;`;
    connection.query(q,[current],(err,result)=>{
        if (err) throw err;
        let currentno=(current/200);
        res.render('stu_details_pagi_26feb.ejs',{user:result, currentno:currentno});
    });
})

app.get("/firstp", authorization.authorization,(req,res)=>{

    const q=`select * from student_details_26feb order by ${field_name} limit 200 OFFSET ?`;
    current=0;
    connection.query(q,[current],(err,result)=>{
        if (err) throw err;
        let currentno=(current/200)+1;
        res.render('stu_details_pagi_26feb.ejs',{user:result, currentno:currentno});
    });
})

app.get("/sortby", authorization.authorization,(req,res)=>{
    field_name=req.query.field;
    const q=`select * from student_details_26feb order by ${field_name} limit 200 OFFSET ?`;
   
    current =0;
    connection.query(q,[current],(err,result)=>{
        if (err) throw err;
        let currentno=(current/200)+1;
        res.render('stu_details_pagi_26feb.ejs',{user:result, currentno:currentno});
    })

})


// Student Percentage 27feb ........

let month;
let year;

var q;

app.get('/percentage',authorization.authorization,(req,res)=>{
console.log('sdfkgs');
 console.log(req.query.months, req.query.Year);
  if((req.query.months, req.query.Year)){
    year=req.query.Year;
    month=req.query.months;
  }else{
    month=12;
    year=2023;
  }

console.log(month,year) 

q=`select student_details_26feb.stu_id,student_details_26feb.fname,
YEAR(attendance_26feb.date)as year,
month(attendance_26feb.date)as month,
count(if(attendance_26feb.attendance='B' or attendance_26feb.attendance='P' , attendance_26feb.date,null))as present,
count( if(attendance_26feb.attendance='B' or attendance_26feb.attendance='P',attendance_26feb.date,null))*100/30 as percentage from student_details_26feb
 join attendance_26feb on student_details_26feb.stu_id=attendance_26feb.stu_id where YEAR(attendance_26feb.date)=${year} and MONTH(attendance_26feb.date)=${month} group by student_details_26feb.stu_id,year,month limit 20 offset `

  current=0; 
  connection.query(q+"?", [current],(err,result)=>{
    if (err) throw err;
    else{
    let currentno=(current/20)+1;
    res.render('stu_percentage_27feb.ejs',{user:result,currentno:currentno, Year:year, months:month});}
  });
  console.log(month,year) 
  });


app.get('/firstp_stu_per',authorization.authorization,(req,res)=>{
  

  if((req.query.months || req.query.Year)){
    year=req.query.Year;
    month=req.query.months;
  }
  console.log(month,year);

  current=0;
  

  
  connection.query(q+"?",[current],(err,result)=>{
    if (err) throw err;
    else{
    let currentno=(current/20)+1;
    res.render('stu_percentage_27feb.ejs',{user:result,currentno:currentno,  Year:year, months:month});}
  });});


app.get('/previousp_stu_per',authorization.authorization,(req,res)=>{
 
  if((req.query.months || req.query.Year)){
    year=req.query.Year;
    month=req.query.months;
  }
  console.log(month,year);

    current -=20;

    connection.query(q+"?",[current],(err,result)=>{
    if (err) throw err;
    else{
    let currentno=(current/20)+1;
    res.render('stu_percentage_27feb.ejs',{user:result,currentno:currentno, Year:year, months:month});}
});
})

app.get('/nextp_stu_per',authorization.authorization,(req,res)=>{
  
  if((req.query.months || req.query.Year)){
    year=req.query.Year;
    month=req.query.months;
  }
  console.log(month,year);
  current +=20;

  
  connection.query(q+"?",[current],(err,result)=>{
    if (err) throw err;
    else{
    let currentno=(current/20)+1;
    res.render('stu_percentage_27feb.ejs',{user:result,currentno:currentno, Year:year, months:month});}
  });});


app.get('/lastp_stu_per',authorization.authorization,(req,res)=>{

  if((req.query.months || req.query.Year)){
    year=req.query.Year;
    month=req.query.months;
  }
  console.log(month,year);
   current=180;
  


   connection.query(q+"?",[current],(err,result)=>{
    if (err) throw err;
    else{
    let currentno=(current/20)+1;
    res.render('stu_percentage_27feb.ejs',{user:result, currentno:currentno,  Year:year, months:month});}
  });
});


// Student Result and Report.......

var q;

app.get('/result',authorization.authorization,(req,res)=>{

     q=`select student_master_26feb.stu_id,student_master_26feb.fname,student_master_26feb.lname,sum(result_details_26feb.prac_marks) as pr, sum(result_details_26feb.theor_marks)as tr from student_master_26feb
    join result_details_26feb
    on student_master_26feb.stu_id=result_details_26feb.stu_id
    group by result_details_26feb.stu_id, result_details_26feb.exam_id limit 60  offset `;
    current=0;
    connection.query(q+"?",[current],(err,result)=>{
        if (err) throw err;
        else{
            // res.send(result);
            let currentno=(current/60)+1;
            res.render('examresult1_28feb.ejs',{data:result,currentno:currentno});


        }
     })
});

app.get('/firstp_result',authorization.authorization, (req,res)=>{
    current=0;
    connection.query(q+"?",[current],(err,result)=>{
        if (err) throw err;
        else{
            // res.send(result);
            let currentno=(current/60)+1;
            res.render('examresult1_28feb.ejs',{data:result,currentno:currentno});
        }
     })
})

app.get('/nextp_result',authorization.authorization,(req,res)=>{
    current+=60;
    console.log(current)

    connection.query(q+"?",[current],(err,result)=>{

        if(err) throw err;
        else{
            let currentno=(current/60)+1;
            res.render('examresult1_28feb.ejs',{data:result,currentno:currentno});
            // console.log(result);
        }
    })
})

app.get('/lastp_result',authorization.authorization, (req,res)=>{
    current=540;

    connection.query(q+"?",[current],(err,result)=>{
        if(err) throw err;
        else{
            let currentno=(current/ 60)+1;
            res.render('examresult1_28feb.ejs',{data:result,currentno:currentno});

        }
    })
})

app.get('/previousp_result',authorization.authorization,(req,res)=>{
    current-=60;
    console.log(current)

    connection.query(q+"?",[current],(err,result)=>{

        if(err) throw err;
        else{
            let currentno=(current/60)+1;
            res.render('examresult1_28feb.ejs',{data:result,currentno:currentno});
            // console.log(result);
        }
        })
})

app.get('/new/:id',authorization.authorization,(req,res)=>{
    let key=req.params.id;
    console.log(key);
    const  q= `select student_master_26feb.stu_id,student_master_26feb.fname,student_master_26feb.lname,subject_details_26feb.sub_name as sub_name,
    result_details_26feb.prac_marks as prac_marks, result_details_26feb.theor_marks as theor_marks
    from result_details_26feb
    inner join student_master_26feb on student_master_26feb.stu_id=result_details_26feb.stu_id
    inner join exam_type_26feb on exam_type_26feb.exam_id=result_details_26feb.exam_id
    inner join subject_details_26feb on subject_details_26feb.sub_id=result_details_26feb.sub_id where student_master_26feb.stu_id=${key} order by  subject_details_26feb.sub_name , exam_type_26feb.exam_id   ;`

    connection.query(q,(err,result)=>{
        if(err) throw err;
    
        else{
            
            res.render('examreport1_28feb.ejs',{data:result})
            console.log(result);
        }
    })
    
})


// Dyanamic Query search 29feb...


var q;
var total_records;
var limit_dynamicquery =40;
var quer;
var field_name;
var quer2;


var q2;


app.get('/dynamicquery',authorization.authorization,(req,res)=>{
    res.render('dynamicquery1.ejs');
});

app.post('/dynamicquery',(req,res)=>{
     q=req.body.qr;  
      q2=`${q}`;
      console.log(q2);
      
    console.log(q);
    quer=`${q} limit  ?, ?`
    
    current=0;
    connection.query(q2,(err,result)=>{
       total_records=result.length;
       console.log(total_records);
    })
    connection.query(quer,[current,limit_dynamicquery],function(err,result,fields) {
       if(err) throw err;
       else{
    let currentno=(current/60)+1;
     res.render('dynamicquery2.ejs',{result,fields,currentno:currentno,total_records:total_records});
    }
   });
})

app.get('/firstp_dynamicquery',authorization.authorization,(req,res)=>{
 
    // console.log(q);
    quer=`${q} limit ?, ?`
    
    current=0;
    connection.query(quer,[current,limit_dynamicquery],function(err,result,fields) {
       if(err) throw err;
       else{
    let currentno=(current/40)+1;
    console.log(quer);
     res.render('dynamicquery2.ejs',{result,fields,currentno:currentno,total_records:total_records});
    }
   });
    })


app.get('/nextp_dynamicquery', authorization.authorization,(req,res)=>{
    current+=40;
    quer=`${q} limit ?, ?`
    connection.query(quer,[current,limit_dynamicquery],function(err,result,fields){
        if(err) throw err;
        else{
            let currentno=(current/40)+1;
            console.log(quer);
     res.render('dynamicquery2.ejs',{result,fields,currentno:currentno,total_records:total_records});
        }
    })

})


app.get('/previousp_dynamicquery',authorization.authorization, (req,res)=>{
    current-=40;
    quer=`${q} limit ?, ?`
    connection.query(quer,[current,limit_dynamicquery],function(err,result,fields){
        if(err) throw err;
        else{
            let currentno=(current/40)+1;
            console.log(quer);
     res.render('dynamicquery2.ejs',{result,fields,currentno:currentno,total_records:total_records});
        }
    })
})

app.get('/lastp_dynamicquery',authorization.authorization, (req,res)=>{
    total_records;
    if(total_records<=  40){
    quer=`${q} limit ?`
    connection.query(quer,[limit_dynamicquery],function(err,result,fields){
        if(err) throw err;
        else{
            let currentno=1;
            console.log(quer);
     res.render('dynamicquery2.ejs',{result,fields,currentno:currentno,total_records:total_records});
        }
    })
    }
    else{
    current=total_records-40;
    console.log(total_records);
    console.log(limit);
    // console.log(current);
    quer=`${q} limit ?, ?`
    connection.query(quer,[current,limit_dynamicquery],function(err,result,fields){
        if(err) throw err;

        else{
            let currentno=(total_records/40);
            console.log(currentno);
            console.log(quer);
     res.render('dynamicquery2.ejs',{result,fields,currentno:currentno,total_records:total_records});
        }
    })
}
})


//  Parameters based fetch .. 4March......

var No_of_records_ppage=20;
var current_p=1;
var pageEnd;
var offset;
var q,q3,q4;
var get_id  ,temp=0,total_l,total_l2;
var fname,lname,city,state,choice;
var message;


app.get('/home',authorization.authorization,(req,res)=>{
  
  if(temp==0){
    current_p=Number(req.query.page_no)||1;
    pageEnd=Math.ceil(10000/No_of_records_ppage);
    offset=(current_p*No_of_records_ppage)-No_of_records_ppage;
  q= q || `select * from student_details_26feb limit ? offset ?;`
  connection.query(q,[No_of_records_ppage, offset],(err,result)=>{
    if(err) throw err;
    else{
        res.render('paramater_based_4march.ejs',{user:result, current_p:current_p, pageEnd:pageEnd,message:''});
    }
  })
}

else if(temp >=1){
    current_p=Number(req.query.page_no)||1;
    pageEnd=Math.ceil(total_l/No_of_records_ppage);

    console.log(pageEnd);
    offset=(current_p*No_of_records_ppage)-No_of_records_ppage;
    q=`select * from student_details_26feb where fname like "%${fname}%" ${choice} lname like "%${lname}%" ${choice} city like  "%${city}%" ${choice} state like 
    "%${state}%" limit ? offset ?`;
    // console.log(q2);
    connection.query(q,[No_of_records_ppage, offset],(err,result)=>{
        if(err) throw err;
        else if(result.length==0){
            res.render('paramater_based_4march.ejs',{user:result, current_p:current_p, pageEnd:pageEnd, message:'Not valid response'});
        }
        else{
            console.log(q)
            res.render('paramater_based_4march.ejs',{user:result, current_p:current_p, pageEnd:pageEnd,message:''});
        }
    })
}
})



app.post('/home',(req,res)=>{
    get_id=req.body.id;
    console.log(get_id);
    if(req.body.id){
    q=`select * from student_details_26feb where stu_id in (${get_id})`;
    console.log(q);
    // console.log(q2);
    connection.query(q,[No_of_records_ppage, offset],(err,result)=>{
        if(err) throw err;
        else if(result.length==0){
            res.render('paramater_based_4march.ejs',{user:result, current_p:0, pageEnd:0,message:'Not Valid ID.'});
        }
        else{
            res.render('paramater_based_4march.ejs',{user:result, current_p:1, pageEnd:1,message:'' });
        }
    })
    }
    else{
        q=`select * from student_details_26feb `;
        console.log(q);
        // console.log(q2);
        connection.query(q,[No_of_records_ppage, offset],(err,result)=>{
            if(err) throw err;
            else if(result.length==0){
                res.render('paramater_based_4march.ejs',{user:result, current_p:0, pageEnd:0,message:'Not Valid ID.'});
            }
            else{
                res.render('paramater_based_4march.ejs',{user:result, current_p:1, pageEnd:1,message:'' });
            }
        })
    }

})

app.post('/home/showall', (req,res)=>{
    fname=req.body.fname;
    lname=req.body.lname;
    city=req.body.city;
    state=req.body.state;
    choice=req.body.choice;

    console.log(fname,lname,city,state,choice);

    q4=`select * from student_details_26feb where fname like "%${fname}%" ${choice} lname like "%${lname}%" ${choice} city like  "%${city}%" ${choice} state like 
      "%${state}%"`
    console.log(q4);
    connection.query(q4,(err,result)=>{
        total_l=result.length;
        console.log(total_l);

      current_p=Number(req.query.page_no)||1;

      pageEnd=Math.ceil(total_l/No_of_records_ppage);
       console.log(pageEnd);
        offset=(current_p*No_of_records_ppage)-No_of_records_ppage;

        q=`select * from student_details_26feb where fname like "%${fname}%" ${choice} lname like "%${lname}%" ${choice} city like  "%${city}%" ${choice} state like 
        "%${state}%" limit ? offset ?`;
        console.log(q);

        connection.query(q,[No_of_records_ppage, offset],(err,result)=>{
            if(err) throw err;
            else if(result.length==0){
                res.render('paramater_based_4march.ejs',{user:result, current_p:0, pageEnd:0, message:'Not Valid response'});
            }
        else{
            res.render('paramater_based_4march.ejs',{user:result, current_p:current_p, pageEnd:pageEnd,message:'' });
        }
    })
    })
    temp++;

})


// Delimeter Search... 5March..............
var q1;
var p;

app.get('/delimeter',authorization.authorization,(req,res)=>{
   q=`select * from student_master_26feb`;
   connection.query(q,(err,result)=>{
    if(err) throw err;
    res.render('delimetersearch_5march.ejs',{user:result,p:p});    
   })

})


app.post('/delimeter',(req,res)=>{
    p=req.body.id;
    console.log(p);
    // var f=JSON.stringify(p);
    // var n=p.split(/[_^$;}{]/);
    var y=p.replace(/(?=[$-/:-?{-~!"^_`\[\]])/gi,",");
    console.log(y);
    var o=y.split(',');
    console.log(o);
    let val;
   var fname=[];
   var lname=[];
   var email=[];
   var mobile=[];
   var state=[];
   var city=[];
    for(let i=1;i<o.length;i++){
        console.log(o[i]);
        if(o[i].startsWith('_')){
            val=o[i].replace('_','');
            fname.push(val);
        }
        if(o[i].startsWith('^')){
            val=o[i].replace('^','');
            lname.push(val);

        }
        if(o[i].startsWith('$')){
            val=o[i].replace('$','');
            email.push(val);
        }
        if(o[i].startsWith(';')){
            val=o[i].replace(';','');
            mobile.push(val);
        }
        if(o[i].startsWith('}')){
            val=o[i].replace('}','');
            state.push(val);
        }
        if(o[i].startsWith('{')){
            val=o[i].replace('{','');
            city.push(val);
        }
        }
        // var fname=[];
        // var lname=[];
        // var email=[];
        // var mobile=[];
        // var state=[];
        // var city=[];
     q1=`select * from student_master_26feb where ( `;
    console.log(fname);
      if(fname.length >=1){
        for(let i=0;i<fname.length;i++){
        q1 +=`fname like '%${fname[i]}%' or `;
      }
      q1=q1.slice(0, q1.length-3)+ ") and (";
    }
    // console.log(q1);

    if(lname.length >=1){
        for(let i=0;i<lname.length;i++){
        q1 +=`lname like '%${lname[i]}%' or `;
      }
      q1=q1.slice(0, q1.length-3)+ ") and (";
    }
    // console.log(q1);

    if(email.length >=1){
        for(let i=0;i<email.length;i++){
        q1 +=`email like '%${email[i]}%' or `;
      }
      q1=q1.slice(0, q1.length-3)+ ") and (";
    }
    // console.log(q1);

    if(mobile.length >=1){
        for(let i=0;i<mobile.length;i++){
        q1 +=`contact_no like '%${mobile[i]}%' or `;
      }
      q1=q1.slice(0, q1.length-3)+ ") and (";
    }
    // console.log(q1);

    if(state.length >=1){
        for(let i=0;i<state.length;i++){
        q1 +=`state like '%${state[i]}%' or `;
      }
      q1=q1.slice(0, q1.length-3)+ ") and (";
    }
    // console.log(q1);

    if(city.length >=1){
        for(let i=0;i<city.length;i++){
        q1 +=`city like '%${city[i]}%' or `;
      }
      q1=q1.slice(0, q1.length-3)+ ") and (";
    }
    // console.log(q1);

    q1=q1=q1.slice(0, q1.length-6);
    console.log(q1);

    connection.query(q1,(err,result)=>{
        if(err) throw err;
    
        res.render('delimetersearch_5march.ejs',{user:result, p : p });
     })
})
 
// Combo Box design .... 6March..............
var p,name,type,v;
var query;
var result;
var msg;


app.get('/combobox',authorization.authorization,(req,res)=>{
    res.render('combobox_6march.ejs',{user:result,type:type,name:name,result:result,msg:''});
})

app.post('/combobox',(req,res)=>{
    p=req.body.id;
    v=p.split(',')
    name=v[0];
    type=v[1];
    console.log(p,name,type);

  query=`select option_master.name from select_master join option_master on select_master.select_id = option_master.select_id where 
  select_master.name ="${name}";`


   console.log(query);

  connection.query(query,(err,result,fields)=>{
    console.log(result);
    // console.log(result[0].name);
    if(err) throw err;
    else if(result.length==0){
        res.render('combobox_6march.ejs',{user:result,type:type,name:name,result:result,msg:'invalid operation'});
    }
    else{
        res.render('combobox_6march.ejs',{user:result,type:type,name:name,result:result,msg:''});
    }
  })
})



// Form CRUD in node 7March........................

app.get('/form', authorization.authorization,(req, res) => {
  res.render('form_crud1_node_7march.ejs');
})

app.post('/form', (req, res) => {

  // Basic Details Fetch
  first_name = req.body.first_name;
  last_name = req.body.last_name;
  designation_basic = req.body.designation_basic;
  address_1 = req.body.address_1;
  phone = req.body.phone;
  city = req.body.city;
  state = req.body.state;
  email = req.body.email;
  gender = req.body.gender;
  zip_code = req.body.zip_code;
  status1 = req.body.status;
  dob = req.body.dob;
  // console.log(first_name, last_name, designation, address_1, phone, city, state, email, gender, zip_code, dob, status1);

  // Education Details Fetch
  board_name = req.body.board_name;
  passing_year = req.body.passing_year;
  percentage = req.body.percentage;
  // console.log(board_name, passing_year, percentage);

  //work Experience
  company_name=req.body.company_name;
  designation=req.body.designation;
  from=req.body.from;
  to=req.body.to;


  // Langauge Known
  lang1=req.body.lang1;
  lang2=req.body.lang2;
  lang3=req.body.lang3;
  hindiop=req.body.hindi;
  engop=req.body.eng;
  gujop=req.body.guj;
  lang_arr=[];
  lang_oparr=[];
  lang_arr.push(lang1);
  lang_arr.push(lang2);
  lang_arr.push(lang3);
  lang_oparr.push(hindiop);
  lang_oparr.push(engop);
  lang_oparr.push(gujop);
  //  console.log(lang_arr,lang_oparr);
  //   console.log(lang1,hindiop,lang2,engop,lang3,gujop);


  //Technologies
  tech=req.body.technology;
  // console.log('sdfgsdg',tech);
  tech_oparr=[];
  if(req.body.tech1){
    tech_op1=req.body.tech1;
    tech_oparr.push(tech_op1);
  }
  if(req.body.tech2){
    tech_op2=req.body.tech2;
    tech_oparr.push(tech_op2);
  }
  
  if(req.body.tech3){
    tech_op3=req.body.tech3;
    tech_oparr.push(tech_op3);
  }

  if(req.body.tech4){
    tech_op4=req.body.tech4;
    tech_oparr.push(tech_op4);
  }
  // console.log(tech, tech_oparr);




  //Refrences
  ref_name=req.body.ref_name;
  ref_contact=req.body.contact_number;
  relation=req.body.relation;
  // console.log('refrence',ref_name,ref_contact,relation);

  //prefrences
  prefred_location=req.body.prefred_location;
  notice_period=req.body.notice_period;
  expected_ctc=req.body.expected_ctc;
  current_ctc=req.body.current_ctc;
  department=req.body.department;
  // console.log('prefrences',prefred_location,notice_period,expected_ctc,current_ctc,department);









  // basic detail query.
  var q = `insert into emp_basic_details(first_name,last_name,designation,address_1,phone,city,state,email,gender,zip_code,status,dob)
    values('${first_name}','${last_name}','${designation_basic}','${address_1}','${phone}','${city}','${state}','${email}','${gender}','${zip_code}','${status1}','${dob}');`;

  connection.query(q, (err, result) => {
    // console.log(q);
    if (err) throw err;

  //--------------------------------------------------------------
   // education details query.
   for(let i=0;i<4;i++){
    let q2= `insert into education_details(emp_id,board_name_course_name,passing_year,percentage)
    values('${result.insertId}', '${board_name[i]}','${passing_year[i]}','${percentage[i]}');`;
    if(board_name[i]){
      connection.query(q2,(err,result)=>{
        // console.log(result);
      })
    }
  };
 
  //-----------------------------------------------------------------------
  // Work Experience Query.
  var work1=typeof(company_name);
  // console.log('work1',work1);
  if(work1=='string'){
    let q3=`insert into work_experience(emp_id,company_name,designation,exp_from,exp_to)
    values('${result.insertId}','${company_name}','${designation}','${from}','${to}')`
      connection.query(q3,(err,result)=>{
          console.log(q3);
        })
  }
  else{
  for(let i=0;i<company_name.length;i++){
    // console.log('length',company_name.length);
    let q3=`insert into work_experience(emp_id,company_name,designation,exp_from,exp_to)
    values('${result.insertId}','${company_name[i]}','${designation[i]}','${from[i]}','${to[i]}')`

  if(company_name[i]){
    connection.query(q3,(err,result)=>{
        console.log(q3);
      })
    }
  }};

  // -------------------------------------------------------------------------------------
  // Refrence Query.

  // console.log('typeof',typeof(company_name),'sdfsdf',company_name);
  // console.log(company_name,designation,from,to);
  var ref1=typeof(ref_name);
  console.log('ref1',ref1);
  if(ref1=='string'){
   let q4=`insert into refrences(emp_id,ref_name,contact_no,relation)
    values('${result.insertId}','${ref_name}','${ref_contact}','${relation}')`
      connection.query(q4,(err,result)=>{
          console.log(q4);
        })
  }
 else{

  for(let i=0;i<ref_name.length;i++){
    console.log('length',ref_name.length);
    console.log('last inserted',result.insertId);
    console.log(ref_name[i],ref_contact[i], relation[i]);
    let q4=`insert into refrences(emp_id,ref_name,contact_no,relation)
    values('${result.insertId}','${ref_name[i]}','${ref_contact[i]}','${relation[i]}')`
    // console.log(q4);

  if(ref_name[i]){
    connection.query(q4,(err,result)=>{
        // console.log(q4);
      })
    }
  };
}

  //---------------------------------------------------------------------
  // Prefrences Query. 

  var q5 = `insert into prefrences(emp_id,prefred_location,notice_period,expected_ctc,current_ctc,department)
  values('${result.insertId}','${prefred_location}','${notice_period}','${expected_ctc}','${current_ctc}','${department}');`;

  connection.query(q5,(err,result)=>{
    console.log(q5);
  })

  //----------------------------
  // Language.
  for(let i=0;i<lang_arr.length;i++){
    console.log('length',lang_arr.length);
    let q6=`insert into language_known(emp_id,language_name,language_type)
    values('${result.insertId}','${lang_arr[i]}','${lang_oparr[i]}')`

  if(lang_arr[i]){
    connection.query(q6,(err,result)=>{
        console.log(q6);
      })
    }
  };

  //--------------------------------------
  // Technology.
  // console.log('sdfgsdgsdfgs')
    //  console.log('asdfsafsdaf',tech_oparr.length);
    for(let i=0;i<tech_oparr.length;i++){
    // console.log('length',tech.length);
    let q7=`insert into technologies(emp_id,technology_name,language_level)
    values('${result.insertId}','${tech[i]}','${tech_oparr[i]}')`

  if(tech[i]){
    connection.query(q7,(err,result)=>{
        console.log(q7);
      })
    }
  };



  })
  res.render('form_crud1_node_7march.ejs');
});



app.get('/form/:id',authorization.authorization,async(req,res)=>{

  id=req.params.id;
  // console.log(id);
  if(req.params.id){
    let query=(str)=>{
      return new Promise((resolve,reject)=>{
        connection.query(str,function(err,result){
          if(err) throw err;
          else{
            resolve(result);
          }
        })
      })
    }


    let count=await query(`select count(*) as ct from emp_basic_details where emp_id='${id}';`);
    console.log(count);

    if(count[0].ct>=1){

    let emp_details=await  query (`select * from emp_basic_details where emp_id='${id}';`);
    // console.log(emp_details);
    let education_details=await query(`select * from education_details where emp_id='${id}';`);
    // console.log(education_details);
    let work_experience=await query(`select * from work_experience where emp_id='${id}';`);
    // console.log(work_experience);
    let language=await query(`select * from language_known where emp_id='${id}';`);
    console.log(language);
    let technologies=await query(`select * from technologies where emp_id='${id}';`);
    // console.log(technologies);
    let refrences=await query(`select * from refrences where emp_id='${id}';`);
    // console.log(refrences);
    let prefrences=await query(`select * from prefrences where emp_id='${id}';`);
    // console.log(prefrences);

    let ar=[]; //
    let arr=[];

    var x,y; //for hindi
    var p,q; // for english
    // var r,s //fop guajrati
    var com_arr=[];

    console.log('sdcfsd',language.length);
    if(language.length>=1){
      for(let i=0;i<language.length;i++){
        ar.push(language[i].language_name);
      }
    }
   console.log('arrrr',ar);


    for(let i=0;i<language.length;i++){
      if(language[i].language_name=='hindi'){

        arr.push(language[i].language_type);
        console.log('hindi11',arr[i]);
        x=arr[i].toString();
        console.log('xx',x)
        y=x.split(',');
        console.log('hindi',y);
        

      }
      else if(language[i].language_name=='english'){
        arr.push(language[i].language_type);
        console.log('english',arr[i]);
        p=arr[i].toString();
        console.log('pp',p)
        q=p.split(',');
        console.log('english',q);
      }
      else if(language[i].language_name=='gujarti'){
        arr.push(language[i].language_type);
        console.log('gujarti',arr[i]);
        r=arr[i].toString();
        console.log('rr',r)
        s=r.split(',');
        console.log('gujarati',s);
      }

      for(let i=0;i<y.length;i++){
        console.log('ylengthinfor',y.length)
        if(y[i]=='read'){
          com_arr.push(y[i]+'hindi');
        }
        else if(y[i]=='write'){
          com_arr.push(y[i]+'hindi');
        }
        else if(y[i]=='speak'){
          com_arr.push(y[i]+'hindi');
        }
      }

    }
    // console.log('ylength',y.length);
    // console.log('qlength',q.length);
    // console.log('slength',s.length);
    // var p=(y.length+q.length+s.length);


    //   for(let i=0;i<p;i++){
    //   }


    let tech=[];
    let tech_op=[];
    // console.log('sdcfsd',technologies.length);
    if(technologies.length>=1){
      for(let i=0;i<technologies.length;i++){
        tech.push(technologies[i].technology_name);
      }
    }


    for(let i=0;i<technologies.length;i++){
      if(technologies[i].technology_name=='php'){
        tech_op.push(technologies[i].language_level+'php');
      }
      else if(technologies[i].technology_name=='MYSQL'){
        tech_op.push(technologies[i].language_level+'mysql');
      }
      else if(technologies[i].technology_name=='laravel'){
        tech_op.push(technologies[i].language_level+'laravel');
      }
      else if(technologies[i].technology_name=='Oracle'){
        tech_op.push(technologies[i].language_level+'oracle');
      }
    }
    
    // console.log(tech);
    // console.log(tech_op);



    res.render('form_crud2_node_7march.ejs',{emp_details:emp_details,education_details:education_details,work_experience:work_experience,language:language,technologies:technologies,refrences:refrences,prefrences:prefrences,arr:arr,ar:ar,tech:tech,tech_op:tech_op});
    }
  }


})

app.post('/form/update',async(req,res)=>{

 body1=req.body;
 console.log(body1);

id=req.body.id;
 // console.log(id);
 if(req.body.id){
   let query=(str)=>{
     return new Promise((resolve,reject)=>{
       connection.query(str,function(err,result){
         if(err) throw err;
         else{
           resolve(result);
           console.log(str);
         }
       })
     })
   }
 



// basic details.
 q1= `UPDATE emp_basic_details
       set first_name='${req.body.first_name}', last_name='${req.body.last_name}',designation='${req.body.designation_basic}',address_1='${req.body.address_1}',phone='${req.body.phone}',city='${req.body.city}', state='${req.body.state}',email='${req.body.email}',gender='${req.body.gender}',zip_code='${req.body.zip_code}',status='${req.body.status}',dob='${req.body.dob}'
       where emp_id=${req.body.id};`
       
       await query(q1);
      //  console.log('upadte query', q1);


      // for(let i=0;i<4;i++){
      //   let q2= `insert into education_details(emp_id,board_name_course_name,passing_year,percentage)
      //   values('${result.insertId}', '${board_name[i]}','${passing_year[i]}','${percentage[i]}');`;
      //   if(board_name[i]){
      //     connection.query(q2,(err,result)=>{
      //       // console.log(result);
      //     })
      //   }
      // };
     

  // Education Details.

  let qr=await query(`select edu_id as edu_id from education_details where emp_id in(${req.body.id}); `);
  // console.log('pqqqq',qr[0]);
  let board_name=req.body.board_name;
  // console.log(board_name);
  for(let i=0;i<board_name.length;i++){
    if(req.body.board_name[i]){
      q2=`UPDATE education_details 
  set emp_id='${req.body.id}',board_name_course_name='${req.body.board_name[i]}',passing_year='${req.body.passing_year[i]}',percentage='${req.body.percentage[i]}'
  where emp_id='${req.body.id}' and edu_id='${qr[0].edu_id}';`
  await query(q2);
    }
  }

 // Work Experience..

 let wee= await query(`select exp_id as exp_id2 from work_experience where emp_id in (${req.body.id})`);
 console.log('weeee',wee)
 let company_name=req.body.company_name;
//  console.log(company_name);
  // console.log(company_name.length==wee.length)
 for(let i=0; i<company_name.length;i++){
  if(wee[i]){
    q3=`UPDATE work_experience
    set emp_id='${req.body.id}',company_name='${req.body.company_name[i]}',designation='${req.body.designation[i]}',exp_from='${req.body.from[i]}',exp_to='${req.body.to[i]}'
    where emp_id='${req.body.id}' and exp_id='${wee[i].exp_id2}';`
    
    await  query(q3);
  }
  else{
  if(company_name[i]){
      // console.log('length',company_name.length);
      let q4=`insert into work_experience(emp_id,company_name,designation,exp_from,exp_to)
      values('${req.body.id}','${req.body.company_name[i]}','${req.body.designation[i]}','${req.body.from[i]}','${req.body.to[i]}')`

      await  query(q4);
  }
}
}


// Technologies...
let te=await query(`select technology_id as tech_id from technologies where emp_id in (${req.body.id})` );
var tech_ar=[];
tech_ar.push(req.body.tech1);
tech_ar.push(req.body.tech2);
tech_ar.push(req.body.tech3);
tech_ar.push(req.body.tech4);
console.log('teee',te);
console.log(tech_ar);
let technology=req.body.technology;
console.log(technology);
for(let i=0;i<technology.length;i++){
  if(te[i]){
    let q5=`update technologies
    set emp_id='${req.body.id}',technology_name='${req.body.technology[i]}',language_level='${tech_ar[i]}'
    where emp_id='${req.body.id}' and technology_id='${te[i].tech_id}';`
    await query(q5);
  }
  else{
    let q6=`insert into technologies(emp_id,technology_name,language_level)
    values('${req.body.id}','${req.body.technology[i]}','${tech_ar[i]}')`
    await query(q6);
  }
}


// Refrence...
let re=await query(`select refrence_id as ref_id from refrences where emp_id in (${req.body.id})`);
// console.log('re',re);
let ref_name=req.body.ref_name;
// console.group(ref_name);
for(let i=0;i<ref_name.length;i++){


  if(re[i]){
    q7=`UPDATE  refrences
    set emp_id='${req.body.id}',ref_name='${req.body.ref_name[i]}',contact_no='${req.body.contact_number[i]}',relation='${req.body.relation[i]}'
    where emp_id='${req.body.id}' and refrence_id='${re[i].ref_id}';`
    await  query(q7);
  }
  else{
      let q8=`insert into refrences(emp_id,ref_name,contact_no,relation)
      values('${req.body.id}','${req.body.ref_name[i]}','${req.body.contact_number[i]}','${req.body.relation[i]}')`

      await  query(q8);
  }
 
} 

// prefrence_id	int AI PK
// emp_id	int
// prefred_location	varchar(100)
// notice_period	varchar(100)
// expected_ctc	varchar(45)
// current_ctc	varchar(45)
// department	varchar(45)

// Prefrences...
q9=`update prefrences 
set emp_id='${req.body.id}',prefred_location='${req.body.prefred_location}',notice_period='${req.body.notice_period}',expected_ctc='${req.body.expected_ctc}',current_ctc='${req.body.current_ctc}',department='${req.body.department}'
where emp_id='${req.body.id}';`;
await query(q9);

    }
  res.send('updated succesfully');

})

// City state via Ajax............

app.get("/citystate",(req,res)=>{
    res.render("city_state_ajax.ejs")
})
// Define endpoint for fetching cities based on state
app.get('/cities/:state', (req, res) => {
  const state = req.params.state;
  let cities = [];
  switch (state) {
    case 'AP':
      cities = ['Visakhapatnam', 'Vijayawada', 'Guntur'];
      break;
    case 'KA':
      cities = ['Bangalore', 'Mysore', 'Hubli'];
      break;
    case 'MH':
      cities = ['Mumbai', 'Pune', 'Nagpur'];
      break;
    default:
      cities = [];
  }
  res.json(cities);
});


// Form CRUD Operation via AJAX.................



app.get("/formajax",authorization.authorization,(req,res)=>{
    res.render("crud_from_ajax.ejs")
});





app.post('/formajax/submit', (req, res) => {
   var formData=req.body;
    var p=formData.email;
    console.log(p);
  console.log(formData);
// Basic Details Fetch
first_name = formData.first_name;
console.log('fname',first_name);
last_name = formData.last_name;
designation_basic = formData.designation_basic;
address_1 = formData.address_1;
phone = formData.phone;
city = formData.city;
state = formData.state;
email = formData.email;
gender = formData.gender;
zip_code = formData.zip_code;
status1 = formData.status;
dob = formData.dob;
// console.log(first_name, last_name, designation, address_1, phone, city, state, email, gender, zip_code, dob, status1);

// Education Details Fetch
board_name = formData.board_name;
passing_year = formData.passing_year;
percentage = formData.percentage;
// console.log(board_name, passing_year, percentage);

//work Experience
company_name=formData.company_name;
designation=formData.designation;
from=formData.from;
to=formData.to;


// Langauge Known
lang1=formData.lang1;
lang2=formData.lang2;
lang3=formData.lang3;
hindiop=formData.hindi;
engop=formData.eng;
gujop=formData.guj;
lang_arr=[];
lang_oparr=[];
lang_arr.push(lang1);
lang_arr.push(lang2);
lang_arr.push(lang3);
lang_oparr.push(hindiop);
lang_oparr.push(engop);
lang_oparr.push(gujop);
//  console.log(lang_arr,lang_oparr);
//   console.log(lang1,hindiop,lang2,engop,lang3,gujop);


//Technologies
tech=formData.technology;
// console.log('sdfgsdg',tech);
tech_oparr=[];
if(formData.tech1){
  tech_op1=formData.tech1;
  tech_oparr.push(tech_op1);
}
if(formData.tech2){
  tech_op2=formData.tech2;
  tech_oparr.push(tech_op2);
}

if(formData.tech3){
  tech_op3=formData.tech3;
  tech_oparr.push(tech_op3);
}

if(formData.tech4){
  tech_op4=formData.tech4;
  tech_oparr.push(tech_op4);
}
// console.log(tech, tech_oparr);




//Refrences
ref_name=formData.ref_name;
ref_contact=formData.contact_number;
relation=formData.relation;
// console.log('refrence',ref_name,ref_contact,relation);

//prefrences
prefred_location=formData.prefred_location;
notice_period=formData.notice_period;
expected_ctc=formData.expected_ctc;
current_ctc=formData.current_ctc;
department=formData.department;
// console.log('prefrences',prefred_location,notice_period,expected_ctc,current_ctc,department);









// basic detail query.
var q = `insert into emp_basic_details(first_name,last_name,designation,address_1,phone,city,state,email,gender,zip_code,status,dob)
  values('${first_name}','${last_name}','${designation_basic}','${address_1}','${phone}','${city}','${state}','${email}','${gender}','${zip_code}','${status1}','${dob}');`;

connection.query(q, (err, result) => {
  // console.log(q);
  if (err) throw err;

//--------------------------------------------------------------
 // education details query.
 for(let i=0;i<4;i++){
  let q2= `insert into education_details(emp_id,board_name_course_name,passing_year,percentage)
  values('${result.insertId}', '${board_name[i]}','${passing_year[i]}','${percentage[i]}');`;
  if(board_name[i]){
    connection.query(q2,(err,result)=>{
      // console.log(result);
    })
  }
};

//-----------------------------------------------------------------------
// Work Experience Query.
var work1=typeof(company_name);
// console.log('work1',work1);
if(work1=='string'){
  let q3=`insert into work_experience(emp_id,company_name,designation,exp_from,exp_to)
  values('${result.insertId}','${company_name}','${designation}','${from}','${to}')`
    connection.query(q3,(err,result)=>{
        console.log(q3);
      })
}
else{
for(let i=0;i<company_name.length;i++){
  // console.log('length',company_name.length);
  let q3=`insert into work_experience(emp_id,company_name,designation,exp_from,exp_to)
  values('${result.insertId}','${company_name[i]}','${designation[i]}','${from[i]}','${to[i]}')`

if(company_name[i]){
  connection.query(q3,(err,result)=>{
      console.log(q3);
    })
  }
}};

// -------------------------------------------------------------------------------------
// Refrence Query.

// console.log('typeof',typeof(company_name),'sdfsdf',company_name);
// console.log(company_name,designation,from,to);
var ref1=typeof(ref_name);
console.log('ref1',ref1);
if(ref1=='string'){
 let q4=`insert into refrences(emp_id,ref_name,contact_no,relation)
  values('${result.insertId}','${ref_name}','${ref_contact}','${relation}')`
    connection.query(q4,(err,result)=>{
        console.log(q4);
      })
}
else{

for(let i=0;i<ref_name.length;i++){
  console.log('length',ref_name.length);
  console.log('last inserted',result.insertId);
  console.log(ref_name[i],ref_contact[i], relation[i]);
  let q4=`insert into refrences(emp_id,ref_name,contact_no,relation)
  values('${result.insertId}','${ref_name[i]}','${ref_contact[i]}','${relation[i]}')`
  // console.log(q4);

if(ref_name[i]){
  connection.query(q4,(err,result)=>{
      // console.log(q4);
    })
  }
};
}

//---------------------------------------------------------------------
// Prefrences Query. 

var q5 = `insert into prefrences(emp_id,prefred_location,notice_period,expected_ctc,current_ctc,department)
values('${result.insertId}','${prefred_location}','${notice_period}','${expected_ctc}','${current_ctc}','${department}');`;

connection.query(q5,(err,result)=>{
  // console.log(q5);
})

//----------------------------
// Language.       
for(let i=0;i<lang_arr.length;i++){
  console.log('length',lang_arr.length);
  let q6=`insert into language_known(emp_id,language_name,language_type)
  values('${result.insertId}','${lang_arr[i]}','${lang_oparr[i]}')`

if(lang_arr[i]){
  connection.query(q6,(err,result)=>{
      console.log(q6);
    })
  }
};

//--------------------------------------
// Technology.
// console.log('sdfgsdgsdfgs')
  //  console.log('asdfsafsdaf',tech_oparr.length);
  for(let i=0;i<tech_oparr.length;i++){
  // console.log('length',tech.length);
  let q7=`insert into technologies(emp_id,technology_name,language_level)
  values('${result.insertId}','${tech[i]}','${tech_oparr[i]}')`

if(tech[i]){
  connection.query(q7,(err,result)=>{
      // console.log(q7);
    })
  }
};
})
});



// app.get('/users',emp_det);
// app.get('/edu',edu_details);
// app.get('/language',language);
// app.get('/prefrences',prefrences);
// app.get('/refrences',refrences);
// app.get('/technologies', technologies);
// app.get('/work_experience',work_experience);


app.get('/formajax/showdata',authorization.authorization, async (req, res) => {
  try {
    const  id=req.query.id ;
    console.log(id)

    if (!id) {
      return res.status(400).json({ error: 'No ID provided' });
    }

    // Function to execute SQL queries
    const query = (str) => {
      return new Promise((resolve, reject) => {
        connection.query(str, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    };

    // Fetch data from different tables based on the provided ID
    // const emp_det = await query(`select * from emp_basic_details where emp_id='${id}';`);
    // const edu_det = await query(`select * from education_details where emp_id='${id}';`);
    // const work_exp = await query(`select * from work_experience where emp_id='${id}';`);
    // const lang_know = await query(`select * from language_known where emp_id='${id}';`);
    // const tech_know = await query(`select * from technologies where emp_id='${id}';`);
    // const reference = await query(`select * from refrences where emp_id='${id}';`);
    // const preference = await query(`select * from prefrences where emp_id='${id}';`);

    // Construct the response object
    const response = {
      basic_det: emp_det,
      edu_det: edu_det,
      work_exp: work_exp,
      lang_know: lang_know,
      tech_know: tech_know,
      reference: reference,
      preference: preference
    };


    // Send the response
    res.json(response);
    // res.redirect("index.ejs")
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/formajax/update",authorization.authorization,(req,res)=>{
    res.render("one.ejs");
})



app.post('/formajax/update/:id',async(req,res)=>{

  formData=req.body;
  console.log(formData);
  
 
 id=req.params.id;
  console.log('iiddddd',id);
  if(req.params.id){
    let query=(str)=>{
      return new Promise((resolve,reject)=>{
        connection.query(str,function(err,result){
          if(err) throw err;
          else{
            resolve(result);
            console.log(str);
          }
        })
      })
    }
 
 // basic details.
  q1= `UPDATE emp_basic_details
        set first_name='${formData.first_name}', last_name='${formData.last_name}',designation='${formData.designation_basic}',address_1='${formData.address_1}',phone='${formData.phone}',city='${formData.city}', state='${formData.state}',email='${formData.email}',gender='${formData.gender}',zip_code='${formData.zip_code}',status='${formData.status}',dob='${formData.dob}'
        where emp_id=${id};`
        
        await query(q1);
 
   // Education Details.
 
   let qr=await query(`select edu_id as edu_id from education_details where emp_id in(${req.params.id}); `);
   // console.log('pqqqq',qr[0]);
   let board_name=formData.board_name;
   // console.log(board_name);
   for(let i=0;i<board_name.length;i++){
     if(formData.board_name[i]){
       q2=`UPDATE education_details 
   set emp_id='${req.params.id}',board_name_course_name='${formData.board_name[i]}',passing_year='${formData.passing_year[i]}',percentage='${formData.percentage[i]}'
   where emp_id='${req.params.id}' and edu_id='${qr[i].edu_id}';`
   await query(q2);
     }
   }
 
  // Work Experience..
 
  let wee= await query(`select exp_id as exp_id2 from work_experience where emp_id in (${req.params.id})`);
  console.log('weeee',wee)
  let company_name=formData.company_name;
 //  console.log(company_name);
   // console.log(company_name.length==wee.length)
  for(let i=0; i<company_name.length;i++){
    console.log('company_name.length',company_name.length)
    if(wee[i]){
   if(formData.company_name[i]!=''){
     q3=`UPDATE work_experience
     set emp_id='${req.params.id}',company_name='${formData.company_name[i]}',designation='${formData.designation[i]}',exp_from='${formData.from[i]}',exp_to='${formData.to[i]}'
     where emp_id='${req.params.id}' and exp_id='${wee[i].exp_id2}';`
     
     await  query(q3);
   }}
   else{
    if(formData.company_name[i]!=''){
       // console.log('length',company_name.length);
       let q4=`insert into work_experience(emp_id,company_name,designation,exp_from,exp_to)
       values('${req.params.id}','${formData.company_name[i]}','${formData.designation[i]}','${formData.from[i]}','${formData.to[i]}')`
 
       await  query(q4);
      }
      }
  
 }
 

 
 // Prefrences...
 q9=`update prefrences 
 set emp_id='${req.params.id}',prefred_location='${formData.prefred_location}',notice_period='${formData.notice_period}',expected_ctc='${formData.expected_ctc}',current_ctc='${formData.current_ctc}',department='${formData.department}'
 where emp_id='${req.params.id}';`;
 await query(q9);
 
     }
   res.send('updated succesfully');
 
 })

  // HTML website Tasks 9Feb website.....
  app.get('/ehyawebsite',authorization.authorization,(req,res)=>{
   res.render('ehyawebsite_9feb.ejs')
  })


  // Html website awan host 12 feb.........
  app.get('/awanhost',authorization.authorization,(req,res)=>{
    res.render('awanhost_12feb.ejs');
   })


   // For Logout and cookie removal process.....
  app.get('/logout',authorization.authorization,(req,res)=>{
    res.clearCookie('access_token').status(200).redirect('/login');
  })

// End..................................................
app.listen(port,()=>{
    console.log(`Server is running at port ${port}`)
})