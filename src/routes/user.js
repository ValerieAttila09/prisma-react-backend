import express from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@clerk/express'

const prisma = new PrismaClient()
const router = express.Router()

router.post("/sync-user", requireAuth(), async (req, res) => {
  const { userId } = req.auth

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized!" })
  }

  try {
    const user = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }
    }).then(res => res.json())
    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        email: user.email_addresses[0].email_address,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
      },
      create: {
        clerkId: user.id,
        email: user.email_addresses[0].email_address,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
      }
    })
    res.json({
      message: "User synced succesfully!",
      user: dbUser
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to sync user!" })
  }
})

export default router