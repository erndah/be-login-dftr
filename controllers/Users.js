import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

export const getUsers = async(req,res) =>{
    Users.findAll()
        .then(result => {
            res.send(result)
        })
        .catch((err) => console.error(err))
}

export const Register = async(req, res) =>{
    const { nama, alamat, gender, email, nohp, password, confirmPassword} = req.body;
    if(password !== confirmPassword) return res.status(400).json({message: "Password tidak sama"});
    const salt = await bcrypt.genSalt();
    const hashPasword = await bcrypt.hash(password, salt);
    Users.create({
        nama,
        alamat,
        gender,
        email,
        nohp,
        password: hashPasword
    })
        .then(result =>{
            res.status(200).json({
                message: "User Created",
                nama,
                alamat,
                gender,
                email,
                nohp,
                password: hashPasword
            })
        })
        .catch((err) => console.error(err))
}

export const Login = async(req,res) => {
    const user = await Users.findAll({
        where: {
            email: req.body.email
        }
    })
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if(!match) return req.status(400).json({message : "Password salah"});
    const userId = user[0].id;
    const nama = user[0].nama;
    const alamat = user[0].alamat;
    const gender = user[0].gender;
    const email = user[0].email;
    const nohp = user[0].nohp;
    const accessToken = jwt.sign({userId, nama, alamat, gender, email,nohp}, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: '20s'
    });
    const refreshToken = jwt.sign({userId, nama, alamat, gender, email,nohp}, process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: '1d'
    });
    await Users.update({refresh_token: refreshToken},{
        where: {
            id: userId
        }
    })
        .then(result => {
            res.status(200).json({
                message: "User berhasil login"
            })
        })
        .catch((err) => console.error(err));
    res.cookie('refreshToken', refreshToken,{
        httpOnly: true,
        maxAge: 24*60*60*1000,
        // secure: true
    });
    res.json({accessToken});

}   
