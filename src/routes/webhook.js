import express from 'express'
import prisma from '../prisma/client.js'
import crypto from 'crypto'

const router = express.Router()

function verifyClerkSignature(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
  const signature = req.headers["svix-signature"]
  const payload = JSON.stringify(req.body)
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET)
  hmac.update(payload)
  const digest = `sha256=${hmac.digest("hex")}`

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

router.post("/clerk-webhook", express.json(), async (req, res) => {
  try {
    if (!verifyClerkSignature(req)) {
      return res.status(401).send("Invalid signature!")
    }
    const { type, data } = req.body
    if (type === "user.created") {
      await prisma.user.create({
        data: {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.firstName || ""} ${data.lastName || ""}`.trim()
        }
      })
    }
    if (type === "user.updated") {
      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          email: data.email_addresses[0].email_address,
          name: `${data.firstName || ""} ${data.lastName || ""}`.trim()
        }
      })
    }
    res.status(200).send("Webhook received!")
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal server error!")
  }
})

export default router