import Clerk from "@clerk/clerk-sdk-node"

export const clerk = Clerk({
  secretKey: process.env.CLERK_SECRET_KEY
})