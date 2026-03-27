const { PrismaClient } = require('@prisma/client')
try {
  const prisma = new PrismaClient({
    datasourceUrl: 'file:./dev.db'
  })
  prisma.user.findFirst().then(console.log).catch(console.log)
} catch (e) {
  console.log('INIT ERROR:', e.message)
}
