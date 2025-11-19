import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function checkPrismaConnection() {
  await prisma.$connect()
  console.log('✅ [PostgresSQL] Successfully connected with Prisma')
}
