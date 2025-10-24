import mongoose, { Schema } from "mongoose";

const invitationSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invitedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Invitation = mongoose.model("Invitation", invitationSchema);
