import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:'anchalagrawal2411@gmail.com',
        subject:'Thanks for joining in!',
        text:`Welcome to the app, ${name}. Let me know how you get along witn the app.`
    })
}


const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:'anchalagrawal2411@gmail.com',
        subject:'Sorry to see you go!',
        text:`${name} hope to see you back sometime soon.`
    })
}


export {sendWelcomeEmail, sendCancelationEmail}