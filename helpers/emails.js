import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const { nombre, email, token } = datos
    
    //Enviar Email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en bienesraices.com',
        text: 'Confirma tu cuenta en bienesraices.com',
        html: `
        <p>Hola ${nombre} comprueba tu cuenta en Bienes Raices</p>
        <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a>
        </p>
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}

const resetearPassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { nombre, email, token } = datos

    //Enviar Email
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Restablece tu Password en bienesraices.com',
        text: 'Restablece tu Password en bienesraices.com',
        html: `
        <p>Hola ${nombre}, has solicitado restablecer tu password en Bienes Raices</p>
        <p>Sigue el siguiente enlace para generar una nueva contraseña: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/recuperar-password/${token}"> Restablecer Passoword</a>
        </p>
        <p>Si tú no solicitaste el cambio de password, puedes ignorar el mensaje</p>
        `
    })
}

export {
    emailRegistro,
    resetearPassword
}