import express from "express";
import {
    formularioLogin,
    formularioOlvidePassword,
    formularioRegistro,
    registrarUsuario
} from "../controllers/usuarioController.js";

const router = express.Router()

router.get('/login', formularioLogin )

router.get('/registro', formularioRegistro )
router.post('/registro', registrarUsuario )

router.get('/recuperar-password', formularioOlvidePassword )


export default router