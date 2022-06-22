import { check, validationResult } from 'express-validator'
import Usuario from "../models/Usuario.js";
import { generarId } from "../helpers/tokens.js"


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    })
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta'
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
            errores: [{ msg: 'El usuario ya se encuentra registrado' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices'
    })
}

export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrarUsuario
}