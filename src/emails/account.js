const sgMail=require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'yas33nanas@gmail.com',
        subject:'Welcome Welcome Welcome...',
        text:`Welcome to the App ${name}. Hope you will get along nice!`
    })
}
const sendDeleteMail=(email,name)=>{
   sgMail.send({
       to:email,
       from:'yas33nanas@gmail.com',
       subject:'Feedback',
       text:`Hey ${name}, Can we know why you are leaving us?`
   })
}
module.exports={
    sendWelcomeMail,
    sendDeleteMail
}