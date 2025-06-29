const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEnum() {
  try {
    console.log('Fixing OrderStatus enum...');
    
    // Add PENDING to the OrderStatus enum
    await prisma.$executeRaw`ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PENDING';`;
    
    console.log('✅ OrderStatus enum fixed successfully!');
    console.log('PENDING value has been added to the OrderStatus enum.');
    
  } catch (error) {
    console.error('❌ Error fixing enum:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnum(); 