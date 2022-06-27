import { check, validationResult } from 'express-validator'
import Usuario from "../models/Usuario.js";
import { generarId } from "../helpers/tokens.js"
import {emailRegistro, resetearPassword} from "../helpers/emails.js";
import bcrypt from "bcrypt";


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    })
}

const formularioRegistro = (req, res) => {
    console.log(req.csrfToken())
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrarUsuario = async (req, res) => {
    //Validación
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('El email ingresado no es válido').run(req)
    await check('password').isLength({ min: 6}).withMessage('El password debe contener 6 carácteres').run(req)
    await check('repetir_password').equals('password').withMessage('Los password ingresados no coinciden').run(req)

    let resultado = validationResult(req)

    //Verificar que el resultado este vacío
    if (!resultado.isEmpty()){
        //Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Extraer datos

    const { nombre, email, password } = req.body

    //Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({ where: { email : email } })
    if (existeUsuario){
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario ya se encuentra registrado' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Enviando email de confirmación
    await emailRegistro({
        nombre : usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    //Mostrar mensaje de confirmación
    res.render('templates/mensaje',{
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos creado un Email de confirmación, presiona en el enlace'
    })

}

// Función que comprueba una cuenta
const confirmarUsuario =  async (req, res, next) => {
    const { token } = req.params

    // Verificar si el token es válido
    const usuario = await Usuario.findOne({ where: {token} })
    console.log(usuario)
    if (!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    // Confirmamos la cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()

    return res.render('auth/confirmar-cuenta',{
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo correctamente',
        csrfToken: req.csrfToken(),
    })

}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken(),
    })
}

const resetPassword = async (req, res) => {
    //Validación
    await check('email').isEmail().withMessage('El email ingresado no es válido').run(req)
    let resultado = validationResult(req)

    //Verificar que el resultado este vacío
    if (!resultado.isEmpty()){
        //Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raíces',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    // Buscar el usuario
    const { email } = req.body
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raíces',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El email no pertenece a ningún usuario' }]
        })
    }
    // Generar un token y enviar el email
    usuario.token = generarId()
    await usuario.save()

    // Enviar un email
    await resetearPassword({
        nombre : usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Renderizar un mensaje
    res.render('templates/mensaje',{
        pagina: 'Restablece tu contraseña',
        mensaje: 'Hemos enviado un Email con las instrucciones para el cambio de contraseña'
    })
}

const comprobarToken = async (req, res) => {
    const { token } = req.params
    const usuario = await Usuario.findOne({ where: {token} })
    if (!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Restablece tu Password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    // Mostrar un formulario para modificar el password
    return res.render('auth/reset-password',{
        pagina: 'Restablece tu Password',
        csrfToken: req.csrfToken()
    })
}
const nuevoPassword = async (req, res) => {
    // Validar el password
    await check('password').isLength({ min: 6}).withMessage('El password debe contener 6 carácteres').run(req)

    let resultado = validationResult(req)
    if (!resultado.isEmpty()){
        //Errores
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu Contraseña',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })
    }

    const { token } = req.params
    const { password } = req.body
    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({ where: {token} })

    // Encriptar el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null
    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Restablecido',
        mensaje: 'El password se guardo correctamente'
    })

}

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrarUsuario,
    confirmarUsuario,
    resetPassword,
    comprobarToken,
    nuevoPassword
}