const catchError = require('../utils/catchError');
const User = require('../models/User');
const bcrypt =require("bcrypt");
const sendEmail = require('../utils/sendEmail');
const Emailcode = require('../models/Emailcode');
const jwt = require("jsonwebtoken");

const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const{email,password,firstName,lastName,country,image,frontBaseUrl }=req.body;
    const encriptedPassword=await bcrypt.hash(password,10);

    const result = await User.create({
        email,
        password: encriptedPassword,
        firstName,
        lastName,
        country,
        image,
    });

    const code= require("crypto").randomBytes(32).toString("hex");
    const link=`${frontBaseUrl}/auth/verify_email/${code}`;
    await Emailcode.create({
        code,
        userId: result.Id,

    });
    
    await sendEmail({
        to: email,
        subject: "Email de verificacion",
        html: `
            <h1> Hola ${firstName} ${lastName}</h1>
            <p>Gracias por iniciar sesión en User App.</p>
            <b>Usa este link para verificar tu email</b>
            ${link}
        `,
    });
    
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});
const verifyCode = catchError(async (req, res) => {
    const { code } = req.params;
    const emailCode = await Emailcode.findOne({ where: { code: code } });

    // Verifica si el código de correo electrónico no existe
    if (!emailCode) return res.status(401).json({ message: "Código inválido" });

    const user = await User.update(
        { isVerified: true },
        { where: { id: emailCode.userId }, returning: true }
    );

    // Elimina el código de correo electrónico después de usarlo
    await emailCode.destroy();

    return res.json(user[1][0]);
});
const login=catchError(async(req, res)=>{
    const{ email, password}= req.body;
    const user=await User.findOne({where:{email}});
    if(!user)return res.status(401).json({message:"invalid credentials"});
    if(!user.isVerified) return res.status(401).json({message:"Email no validado"});
    const isValid=await bcrypt.compare(password,user.password);
    if(!isValid) return res.status(401).json({message:"Invalid credentials"});

    const token=jwt.sign(
        {user},
        process.env.TOKEN_SECRET,
        {expiresIn:"1d"}
    )
    return res.json({user,token});

})

const getLoggedUser =catchError(async(req, res)=>{
    const user=req.user;
    return res.json(user);
})

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    verifyCode,
    login,
    getLoggedUser,
}