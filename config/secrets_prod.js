module.exports={
db:process.env.MONGODB||process.env.MONGOLAB_URI,
sessionSecret:process.env.SESSION_SECRET,
mailgun:{
user:process.env.MAILGUN_USER,
password:process.env.MAILGUN_PASSWORD
},
mandrill:{
user:process.env.MANDRILL_USER,
password:process.env.MANDRILL_PASSWORD
},
sendgrid:{
user:process.env.SENDGRID_USER,
password:process.env.SENDGRID_PASSWORD
},
github:{
clientID:process.env.GITHUB_ID,
clientSecret:process.env.GITHUB_SECRET,
callbackURL:'/auth/github/callback',
passReqToCallback:true
},
api_code:process.env.api_code

};