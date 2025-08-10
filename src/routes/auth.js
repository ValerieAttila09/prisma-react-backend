import express from "express"
import { clerk } from "../utils/clerkClient"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const router = express.Router()

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided!" })
  }

  const token = authHeader.split(" ")[1]
  try {
    const session = await clerk.sessions.verifySession(token)
    req.userId = session.userId
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

router.get("/me", requireAuth, async (req, res) => {
  try {
    const clerkUser = await clerk.users.getUser(req.userId)
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName}` : clerkUser.username || ""
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