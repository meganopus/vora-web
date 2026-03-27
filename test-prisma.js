const { PrismaClient } = require('@prisma/client')
try {
  const prisma = new PrismaClient({ datasourceUrl: "file:./dev.db" })
  console.log("Success with datasourceUrl!")
} catch (e) {
  console.log("Error:", e.message)
}
