import Notifications from "@utils/models/notification"; // Correct model import
import mongoose from "mongoose"; // Importing Mongoose for MongoDB interactions
import { NextResponse } from "next/server"; // Importing Next.js server response utility

// Ensure Mongoose connection is established
const connectToDatabase = async () => {
  const { MONGO_URI } = process.env;
  if (!mongoose.connection.readyState) {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  }
};

export async function POST(req) {
  await connectToDatabase();
  try {
    const { userEmail, type, id } = await req.json();
    console.log("Received request to update notification status:", { userEmail, type, id });

    const userNotification = await Notifications.findOne({ userEmail });

    if (!userNotification) {
      console.log("No notifications found for this user");
      return NextResponse.json({ message: "No notifications found for this user" }, { status: 404 });
    }

    if (type === "follower" && userNotification.followerList.has(id)) {
      userNotification.followerList.get(id).isRead = true;
      console.log("Updated follower notification as read:", id);
    } else if (type === "blog" && userNotification.blogList.has(id)) {
      userNotification.blogList.get(id).isRead = true;
      console.log("Updated blog notification as read:", id);
    } else {
      console.log("Notification not found:", { type, id });
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    await userNotification.save();
    return NextResponse.json({ message: "Notification status updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating notification status" }, { status: 500 });
  }
}

export async function handler(req) {
  if (req.method === 'POST') {
    return await POST(req);
  } else {
    return NextResponse.json({ message: `Method ${req.method} Not Allowed` }, { status: 405 });
  }
}