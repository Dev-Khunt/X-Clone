import dotenv from 'dotenv';
dotenv.config();

export default {
    secret : process.env.JWT_SECRET as string,
    expire : process.env.JWT_EXPIRE as string,
    saltRounds : Number(process.env.SALT_ROUNDS)
}