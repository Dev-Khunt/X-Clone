import { Request, Response } from "express";
import db from "../../config/db.config";
import { User } from "../../types";
import { JwtPayload } from "jsonwebtoken";
// import { config } from "dotenv";
import bcrypt from 'bcryptjs';
import config from '../../config/auth.config';
import jwt from 'jsonwebtoken'; 

export const signIn = async (req: Request, res: Response) => {
    // console.log(req.body);

    try {
        const {identifier,password : userPassword} = req.body; 
        console.log(identifier);
                                                                                            
    
    const [result] = await db.query<User[]>(`SELECT * FROM users WHERE username=? OR email =?`,[identifier,identifier])
    console.log(result);
    
    if(result.length == 0) {
        res.status(401).json( {
            message : "User doesn't exist"
        });
        return ;
    }

    console.log(result);
    

    const savedPassword: string = result[0].password;

    const verifyPassword : boolean = bcrypt.compareSync(userPassword,savedPassword)

    console.log(verifyPassword);
    
    if(!verifyPassword){
        res.status(404).json({
            message : "Invalid Credentials"
        });
        return;
    }

    const payload : JwtPayload = {
        id : result[0].user_id,
        username : result[0].username
    }

    const token = jwt.sign(payload,config.secret, {
        algorithm: "HS256",
        expiresIn : Number(config.expire),
    });

  
    res.status(200).json({
        accessToken : token,
      message : "Login successfull",
      user_id: result[0].user_id,
      username: result[0].username,
  display_name: result[0].display_name,
  profile_image: result[0].profile_image
    });

    } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    }
    

    
    
}
