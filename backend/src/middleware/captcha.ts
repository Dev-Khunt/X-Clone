import { NextFunction, Request, Response } from "express";
import db from "../config/db.config";
import captcha from 'svg-captcha'
import { ResultSetHeader } from "mysql2";

export const generateCaptcha = async (req: Request, res: Response) => {
  try {
    await db.query(`DELETE FROM captcha WHERE expires_at <= NOW()`);
    const cap = captcha.create({
      noise: 2,
      size: 5,
      color: true,
    });

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO captcha (answer,
expires_at,
used
) VALUES (?,DATE_ADD(NOW(),INTERVAL 5 MINUTE),false)`,
      [cap.text],
    );


    const captchaId = result.insertId;
    res.status(201).json({
      captchaId,
      captcha: `data:image/svg+xml;utf8,${encodeURIComponent(cap.data)}`,
    });

    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const verifyCaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Delete expired captchas first
    await db.query(`DELETE FROM captcha WHERE expires_at <= NOW()`);

    const captchaId = req.body.captchaId;
    const captchaText = req.body.captchaText;
    
    // Check if captcha fields exist
    if (!captchaId || !captchaText) {
      res.status(400).json({message:"Captcha is required!"})
      return;
    }

    const [result] = await db.query<any>(
      `SELECT * FROM captcha WHERE captch_id=?`,
      [captchaId],
    );
    
    if (result.length === 0) {
      res.status(400).json({message:"Captcha does not exist!"})
      return;
    }
    
    const answer = result[0].answer;
    console.log("Captcha answer:", answer, "Input:", captchaText);
    
    if (answer === captchaText) {
      await db.query<any>(`delete from captcha where captch_id=?`, [captchaId]);
      next();
    } else {
      res.status(403).json({ message: "Invalid captcha!" });
      return;
    }
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const deleteCaptcha = async (req: Request, res: Response) => {
  const { captchaId } = req.body;
  try {
    await db.query<any>(`delete from captcha where captch_id=?`, [captchaId]);
    res.status(200).json({ message: "captcha deleted" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
}