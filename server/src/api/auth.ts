import express from "express";
import jwt from "jsonwebtoken";
import jwks from "jwks-rsa";
import { User } from "../generated/graphql";

const AUTH0_DOMAIN = "https://nohouse.us.auth0.com";
const AUTH0_CLIENT_ID = "kCdwfl1N5n39nZ2XNMo9TxQGx7V9jgcn";

const jwksClient = jwks({
  jwksUri: `${AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getKey(header: jwt.JwtHeader, cb: (_: any, key?: string) => void) {
  jwksClient.getSigningKey(header.kid ?? "", function (
    _err,
    key: { publicKey?: string; rsaPublicKey?: string }
  ) {
    cb(null, key.publicKey || key.rsaPublicKey);
  });
}

const options = {
  audience: AUTH0_CLIENT_ID,
  issuer: AUTH0_DOMAIN,
  algorithms: ["RS256" as const],
};

export async function userFromReq(req: express.Request): Promise<User | null> {
  const token = req.headers.authorization;
  if (!token) return null;
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, options, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded ? (decoded as User) : null);
    });
  });
}
