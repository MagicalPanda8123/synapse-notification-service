// import { configDotenv } from 'dotenv'
// configDotenv()

// ES module helpers to simulate CommonJS __dirname and __filename
import { fileURLToPath } from 'url'
import path from 'path'

import { readFile } from 'fs/promises'
import nodemailer from 'nodemailer'
import ejs from 'ejs'

// Convert the current module's URL (e.g. file:///...) into a regular file path
const __filename = fileURLToPath(import.meta.url) // the path to this file

// Get the directory name of the current file (e.g. /project-root/utils)
const __dirname = path.dirname(__filename) // the path to the folder of this file

// console.log(`[INFO] __filename : ${__filename}`)
// console.log(`[INFO] __dirname  : ${__dirname}`)

// create nodemailer transport object (using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

export async function sendNotificationEmail({
  to,
  templateName,
  subject,
  templateData,
  text = 'Synapse notification 🔔',
}) {
  // Set up template
  const templatePath = path.join(__dirname, `../templates/${templateName}.ejs`)
  const template = await readFile(templatePath, 'utf-8')
  const html = ejs.render(template, templateData)

  const mailOptions = {
    from: `"Synapse" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  }

  return transporter.sendMail(mailOptions)
}
