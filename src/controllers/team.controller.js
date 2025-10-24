import { User } from "../models/user.model.js";
import { Invitation } from "../models/invitation.model.js";
import { Team } from "../models/team.model.js";

export const createTeam = async (req, res) => {
  try {
    const creatorId = req.user?._id;
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Team name is required" });
    }
    if (!creatorId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user" });
    }

    const newTeam = new Team({
      name,
      description: description || "",
      createdBy: creatorId,
    });

    await newTeam.save();

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    console.error("Error in Creating Team:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { receiverId } = req.body;
    const senderId = req.user?._id;

    // ✅ Validate input
    if (!receiverId || !teamId) {
      return res
        .status(400)
        .json({ message: "receiverId and teamId required" });
    }

    // ✅ Check team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // ✅ Check if sender is the team owner
    if (team.owner.toString() !== senderId.toString()) {
      return res
        .status(403)
        .json({ message: "Only team owner can send invites" });
    }

    // ✅ Check receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // ✅ Prevent inviting someone who is already a member
    const isAlreadyMember = team.members.some(
      member => member.toString() === receiverId.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: "User already in team" });
    }

    // ✅ Prevent duplicate invite
    const existingInvite = await Invitation.findOne({
      sender: senderId,
      receiver: receiverId,
      team: teamId,
      status: "pending",
    });
    if (existingInvite) {
      return res.status(400).json({ message: "Invitation already sent" });
    }

    // ✅ Create new invitation
    const invite = new Invitation({
      sender: senderId,
      receiver: receiverId,
      team: teamId,
      status: "pending",
    });

    await invite.save();

    return res.status(201).json({
      message: "Invitation sent successfully",
      invite,
    });
  } catch (error) {
    console.error("Error in Create Invite:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user?._id;

    // 1. Validate input
    if (!inviteId) {
      return res.status(400).json({ message: "Invite ID required" });
    }

    // 2. Find invitation
    const invite = await Invitation.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // 3. Check if the user is the receiver
    if (invite.receiver.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this invite" });
    }

    // 4. Find the team
    const team = await Team.findById(invite.team);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // 5. Check if already a member
    const isAlreadyMember = team.members.some(
      member => member.toString() === userId.toString()
    );
    if (isAlreadyMember) {
      // delete invite to keep DB clean
      await Invitation.findByIdAndDelete(inviteId);
      return res.status(400).json({ message: "Already a member of the team" });
    }

    // 6. Add user to team members
    team.members.push(userId);
    await team.save();

    // 7. Delete the invitation after acceptance
    await Invitation.findByIdAndDelete(inviteId);

    return res.status(200).json({ message: "Invitation accepted", team });
  } catch (error) {
    console.error("Error in Accept Invite:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
