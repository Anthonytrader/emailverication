const express = require('express');
const userRouter=require("./user.routes")     // Asegúrate de que el nombre del archivo sea correcto

const router = express.Router();

// colocar las rutas aquí
router.use(userRouter);
module.exports = router;
