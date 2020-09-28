import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Knex from "knex";
import knex from "../db";
import { UsersRowRead, UsersRowWrite } from "../generated/database";
import { User } from "../generated/graphql";
import { TOKEN_SECRET } from "../secrets";

const SALT_ROUNDS = 10;

async function encodePassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export function decodeToken(token: string): User | null {
  try {
    return jwt.verify(token, TOKEN_SECRET) as User;
  } catch (err) {
    console.warn(err);
    return null;
  }
}

export function encodeToken(user: User): string {
  return jwt.sign(user, TOKEN_SECRET, { expiresIn: "24h" });
}

const select = (): Knex.QueryBuilder =>
  knex.select("users.*").from("users").whereNull("deleted_at");

export async function getByUid(uid: string): Promise<UsersRowRead> {
  return await select().where({ uid }).first();
}

export async function getByEmail(email: string): Promise<UsersRowRead> {
  return await select().where("email", email).first();
}

export async function create(userInput: UsersRowWrite): Promise<UsersRowRead> {
  const [row] = await knex("users").insert(
    {
      ...userInput,
      password: await encodePassword(userInput.password),
    },
    "*"
  );
  return row;
}

export async function getByToken(token: string): Promise<User | null> {
  return decodeToken(token);
}

export async function comparePassword(user: UsersRowRead, password: string) {
  return await bcrypt.compare(password, user.password);
}
