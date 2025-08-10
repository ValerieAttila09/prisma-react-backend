import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.js"

const app = express()


app.use(express.json())
app.use(cors({
  origin: ["http://localhost:5173", "https://frontend-domain.com"],
  credentials: true
}))

app.get("/", (req, res) => {
  res.send("Backend berjalan!")
})

app.use(authRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`)
})