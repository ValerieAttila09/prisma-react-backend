import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use(authRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`)
})