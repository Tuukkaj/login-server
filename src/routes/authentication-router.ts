import express from "express";
import { body, validationResult } from "express-validator";
import UnverifiedUser, { UnverifiedUserInterface } from "../db/models/unverified-user";
import crypto from "crypto";
import EmailService from "../services/email-service";
import bcrypt from "bcrypt";
import User, { UserInterface } from "../db/models/user";
import PasswordReset, { PasswordResetInterface } from "../db/models/password-reset";
import emailService from "../services/email-service";
import jwt from "jsonwebtoken";

const authenticationRouter = express.Router();

authenticationRouter.post("/sign",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

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
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

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
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

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
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

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
        return jwt.sign({
          uuid: user.get().uuid
        }, process.env.PUBLIC_ACCESS_KEY!); 
      }

      return res.status(401).send();
    } catch (e) {
      return res.status(401).send();
    }
  });

authenticationRouter.patch("/reset",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("token").notEmpty(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }

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