import { Request, Response } from "express"
import db from "../config/db.config"
import { ResultSetHeader } from "mysql2"
import { AuthRequest } from "../types";
import { uploadToCloudinary } from "../config/cloudinary";

 export const uploadProfile= async (req:AuthRequest , res:Response) => {
    try {
      const file = req.file as any;
      
      if (!file) {
        return res.status(400).json({ message: "Notttttt file uploaded" })
      }

      const uploaded = await uploadToCloudinary(file, "twitter-clone/profile");

      const imageUrl = uploaded.secure_url;
      const id = req.params.id

      const [row] = await db.query<ResultSetHeader>(`UPDATE users SET profile_image=? WHERE user_id=?`,[imageUrl,id])

      res.status(200).json({message:"Profile updated successfully",id:id,url:imageUrl})

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }

export const uploadCover= async (req:AuthRequest , res:Response) => {
    try {
      const file = req.file as any;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" })
      }

      const uploaded = await uploadToCloudinary(file, "twitter-clone/cover");

      const imageUrl = uploaded.secure_url;
      const id = req.params.id

      const [row] = await db.query<ResultSetHeader>(`UPDATE users SET cover_photo=? WHERE user_id=?`,[imageUrl,id])

      res.status(200).json({message:"Cover photo updated successfully",id:id,url:imageUrl})

    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }

 export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.params.id;
      const { dob, bio, country } = req.body;

      // Build dynamic query
      const updates: string[] = [];
      const values: any[] = [];

      if (dob) {
        updates.push("dob = ?");
        values.push(dob);
      }
      if (bio !== undefined) {
        updates.push("bio = ?");
        values.push(bio);
      }
      if (country !== undefined) {
        updates.push("country = ?");
        values.push(country);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      values.push(userId);

      const query = `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`;
      await db.query<ResultSetHeader>(query, values);

      // Fetch updated user
      const [userResult] = await db.query<any[]>(`SELECT * FROM users WHERE user_id = ?`, [userId]);

      res.status(200).json({ 
        message: "Profile updated successfully", 
        user: userResult[0] 
      });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
