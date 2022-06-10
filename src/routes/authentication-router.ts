import express from "express";
import { body, header } from "express-validator";
import UnverifiedUser, { UnverifiedUserInterface } from "../db/models/unverified-user";
import crypto from "crypto";
import EmailService from "../services/email-service";
import bcrypt from "bcrypt";
import User, { UserInterface } from "../db/models/user";
import PasswordReset, { PasswordResetInterface } from "../db/models/password-reset";
import emailService from "../services/email-service";
import errorValidatorMiddleware from "../middlewares/error-validator-middleware";
import refreshTokenCache from "../cache/caches/refresh_token_cache";
import checkJwt from "../util/check-jwt";
import createAccessToken from "../util/create-access-token";
import createRefreshToken from "../util/create-refresh-token";


const authenticationRouter = express.Router();

authenticationRouter.post("/sign",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  errorValidatorMiddleware,
  async (req, res) => {
    const { email, password } = req.body;

    const unverifiedUser: UnverifiedUserInterface = {
      email: email,
      password: await bcrypt.hash(password, 10),
      token: crypto.randomUUID(),
      uuid: crypto.randomUUID()
    };

    try {
      await UnverifiedUser.create(unverifiedUser);
      await EmailService.sendSignUp(unverifiedUser.email, unverifiedUser.token);

      return res.status(201).send();
    } catch (e: unknown) {
      console.error("Failed to create unverifiedUser", e);

      if ((e as { name?: string })?.name === "SequelizeUniqueConstraintError") {
        return res.status(400).send(`Email ${email} has already signed up`);
      }
    }

    return res.status(500).send();

  });

authenticationRouter.get("/sign/verify/:token",
  async (req, res) => {
    const { token } = req.params;

    const verifiedUser = await UnverifiedUser.findOne({
      where: {
        token
      }
    });

    if (!verifiedUser) {
      return res.status(400).send("Bad token");
    }

    const user: UserInterface = {
      uuid: crypto.randomUUID(),
      email: verifiedUser.get().email,
      password: verifiedUser.get().password
    };

    await UnverifiedUser.destroy({
      where: {
        token
      }
    });

    await User.create(user);

    return res.status(200).send();
  });

authenticationRouter.get("/forgot/:email",
  async (req, res) => {
    const { email } = req.params;

    const passwordReset: PasswordResetInterface = {
      email: email,
      token: crypto.randomUUID(),
      uuid: crypto.randomUUID()
    };

    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.warn(`Non-existant email ${email} tried to be reset`);
      return res.sendStatus(200);
    }

    try {
      const prevResetReq = await PasswordReset.findOne({
        where: {
          email: email
        }
      });

      await prevResetReq?.destroy();

      const resetReq = await PasswordReset.create(passwordReset);
      emailService.sendForgotPassword(email, resetReq.get().token);

    } catch (e) {
      console.error("Failed to reset password", e);
    }

    return res.status(200).send();
  });

authenticationRouter.post("/login",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  errorValidatorMiddleware,
  async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(401).send();
    }

    try {
      if (await bcrypt.compare(password, user.get().password)) {

        const accessToken = createAccessToken(user.get().uuid, user.get().email);
        const refreshToken = createRefreshToken(user.get().uuid, user.get().email);

        await refreshTokenCache.addRefreshToken(user.get().uuid, refreshToken);

        return res.json({ accessToken, refreshToken});
      }

      return res.status(401).send();
    } catch (e) {
      return res.status(401).send();
    }
  });

authenticationRouter.post("/token",
  header("refreshToken").notEmpty(),
  errorValidatorMiddleware,
  async (req, res) => {
    const { refreshToken } = req.body;

    try {
      const payload = await checkJwt(refreshToken, process.env.REFRESH_TOKEN_KEY || "");
      const foundToken = await refreshTokenCache.getRefreshToken(payload.uuid);

      if (typeof foundToken !== "string") {
        return res.sendStatus(403);
      }

      const accessToken = createAccessToken(payload.uuid, payload.email);

      return res.json({ token: accessToken });
    } catch (e) {
      return res.sendStatus(e as number || 400);
    }
  });

authenticationRouter.post("/logout",
  body("token").notEmpty(),
  errorValidatorMiddleware,
  async (req, res) => {
    const { token } = req.body;

    try {
      const payload = await checkJwt(token, process.env.TOKEN_KEY || "");

      await refreshTokenCache.deleteRefreshToken(payload.uuid);

      return res.sendStatus(204);
    } catch (e) {
      return res.sendStatus(e as number || 400);
    }
  });

authenticationRouter.patch("/reset",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("token").notEmpty(),
  errorValidatorMiddleware,
  async (req, res) => {
    const { email, password, token } = req.body;

    const passwordResetRequest = await PasswordReset.findOne({
      where: {
        email,
        token
      }
    });

    if (!passwordResetRequest) {
      return res.status(400).send();
    }

    passwordResetRequest.destroy();

    const user = await User.findOne({
      where: {
        email: email
      }
    });

    user?.set("password", await bcrypt.hash(password, 10));

    await user?.save();

    return res.status(200).send();
  }
);

export default authenticationRouter;