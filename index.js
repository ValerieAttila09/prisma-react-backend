import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"

// const express = require('express')
// const cors = require('cors')
// const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}))
app.use(express.json())

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
  console.log("Server berjalan di http://localhost:3000")
})