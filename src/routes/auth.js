import express from "express"
import prisma from "../prisma/client.js"
import { requireAuth } from "@clerk/express"

const router = express.Router()

router.get("/me", requireAuth(), async (req, res) => {
  try {
    const { userId, claims } = req.auth

    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if(!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: claims?.email || "no-email@example.com"
        }
      })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch user!" })
  }
})

export default router