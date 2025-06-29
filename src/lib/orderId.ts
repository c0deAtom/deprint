import { prisma } from './db';

export async function generateOrderId(): Promise<string> {
  // Get the latest order to find the next number
  const latestOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true }
  });

  let nextNumber = 100000; // Start with 100000 (6 digits)

  if (latestOrder) {
    // Try to parse the latest order ID as a number
    const currentNumber = parseInt(latestOrder.id);
    if (!isNaN(currentNumber) && currentNumber >= 100000) {
      nextNumber = currentNumber + 1;
    }
  }

  // Ensure it's always 6 digits by padding with zeros if needed
  return nextNumber.toString().padStart(6, '0');
} 