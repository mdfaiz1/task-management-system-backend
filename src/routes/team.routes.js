import {
  createTeam,
  inviteMember,
  acceptInvite,
} from "../controllers/team.controller.js";
import { Router } from "express";
import { protectRoute, checkVerified } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protectRoute);
router.use(checkVerified);

router.post("/", createTeam);
router.post("/:teamId/invite", inviteMember);
router.post("/invites/:inviteId/accept", acceptInvite);

export default router;
