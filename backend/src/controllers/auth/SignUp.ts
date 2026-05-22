import { ResultSetHeader } from "mysql2";
import db from "../../config/db.config";
import { SignUpBody } from "../../types";
import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import config from '../../config/auth.config';

export const signUp = async (req : Request, res : Response) => {
    try {
        const {
            username,
            email,
            password,
            display_name,
            dob,
            country,
            profile_image,
            cover_photo
        } = req.body as SignUpBody
        console.log(username,
            email,
            password,
            display_name,
            dob,
            country,
            profile_image,
            cover_photo);
        
        const hashedPassword = bcrypt.hashSync(password,config.saltRounds)

        const [result] = await db.query<ResultSetHeader> (`INSERT  INTO users
            (username, email, password, display_name, dob, country, profile_image, cover_photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,[username,email,hashedPassword,display_name,dob,country,profile_image,cover_photo])
        
        console.log(result);
        res.status(201).json({
            id: result.insertId,
            message : "User Created Successfully"
        })
        
    } catch(error) {
         res.status(500).json({
            message : error
         })
    }
}
