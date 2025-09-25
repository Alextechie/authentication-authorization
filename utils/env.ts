import dotenv from 'dotenv';

dotenv.config();

const {SALT_ROUNDS, JWT_SECRET, ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP} = process.env;

export const saltRounds = SALT_ROUNDS;
export const secret = JWT_SECRET;
export const access_token_exp = ACCESS_TOKEN_EXP;
export const refresh_token_exp = REFRESH_TOKEN_EXP