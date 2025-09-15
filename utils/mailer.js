import nodemailer from 'nodemailer'
import ejs from 'ejs'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import { configDotenv } from 'dotenv'
configDotenv()

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

export async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: `"Synapse" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  }
  return transporter.sendMail(mailOptions)
}

export async function sendVerificationEmail({ to, username = 'friend', code }) {
  const templatePath = path.join(
    __dirname,
    '../templates/verification-email.ejs'
  )
  const template = await readFile(templatePath, 'utf8') // 1. Read file contents
  const html = ejs.render(template, { username, code }) // 2. Render with EJS

  const mailOptions = {
    from: `"Synapse" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your Synapse Verification Code',
    text: `Welcome ${username}! Your verification code is: ${code}`,
    html,
  }

  return transporter.sendMail(mailOptions)
}
