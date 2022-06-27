import express from "express";
import {
    comprobarToken,
    confirmarUsuario,
    formularioLogin,
    formularioOlvidePassword,
    formularioRegistro, nuevoPassword,
    registrarUsuario, resetPassword
} from "../controllers/usuarioController.js";

const router = express.Router()

router.get('/login', formularioLogin )

router.get('/registro', formularioRegistro )
router.post('/registro', registrarUsuario )

router.get('/confirmar/:token', confirmarUsuario )

router.get('/recuperar-password', formularioOlvidePassword )
router.post('/recuperar-password', resetPassword )

// Almacena el nuevo password
router.get('/recuperar-password/:token', comprobarToken)
router.post('/recuperar-password/:token', nuevoPassword)



export default router