import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import { requireAuth } from "@clerk/clerk-sdk-node"

const app = express()
const prisma = new PrismaClient()

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}))
app.use(express.json())

app.get("/me", requireAuth(), async (req, res) => {
  const clerkUserId = req.auth.clerkUserId

  let user = await prisma.user.findUnique({
    where: {
      clerkId: clerkUserId
    }
  })

  if (!user) {
    const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${clerkUserId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
      }
    }).then(r => r.json())

    user = await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email: clerkUser.email_addresses[0].email_address,
        name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim()
      }
    })

    res.json(user)
  }
})

app.get("/users", async (_, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})

app.post("/users", async (req, res) => {
  const { name, email } = req.body
  try {
    const newUser = await prisma.user.create({
      data: { name, email }
    })
    res.json(newUser)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.listen(5000, () => {
  console.log("Server berjalan di http://localhost:5000")
})