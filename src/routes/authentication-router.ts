import express from "express";
import { body, validationResult, param } from "express-validator";
import UnverifiedUser, { UnverifiedUserInterface } from "../db/models/unverified-user";
import crypto from "crypto";
import EmailService from "../services/email-service";
import bcrypt from "bcrypt";
import User, { UserInterface } from "../db/models/user";
import PasswordReset, { PasswordResetInterface } from "../db/models/password-reset";

const authenticationRouter = express.Router();

authenticationRouter.post("/sign",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),

  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs });
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
    } catch (e: unknown) {
      console.error("Failed to create unverifiedUser", e);

      if ((e as { name?: string })?.name === "SequelizeUniqueConstraintError") {
        return res.status(400).send(`Email ${email} has already signed up`);
      } else {
        return res.status(500).send();
      }
    }

    await EmailService.sendSignUp(unverifiedUser.email, unverifiedUser.token);
    console.info(`http://localhost:${process.env.PORT}/sign/verify/${unverifiedUser.token}`);

    return res.status(201).send();
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

    User.create(user);

    return res.status(200).json({result: "ok"});
  });

authenticationRouter.get("/forgot/:email",
  async (req, res) => {
    const { email } = req.params;

    const passwordReset: PasswordResetInterface = {
      email: email,
      token: crypto.randomUUID(),
      uuid: crypto.randomUUID()
    };

    try {
      await PasswordReset.create(passwordReset);
    } catch (e) {
      console.error("Failed to reset password", e);
      return res.status(200);

    }

    return res.status(200);
  });

authenticationRouter.post("/sign/test",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
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
        return res.status(200).send("Login OK");
      }

      return res.status(401).send();
    } catch (e) {
      return res.status(401).send();
    }
  });

export default authenticationRouter;