import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import webhookRoutes from "./routes/webhook.js"
import { withAuth } from "@clerk/express"

const app = express()

app.use(withAuth())
app.use(express.json())
app.use(cors({
  origin: ["http://localhost:5173", "https://frontend-domain.com"],
  credentials: true
}))

app.get("/", (req, res) => {
  res.send("Backend berjalan!")
})
app.use("/", webhookRoutes)

app.use(authRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`)
})