import { prisma } from "@/lib/prisma"

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    })
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function getAllProducts() {
  console.log("Attempting to fetch all products from the database...");
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    console.log(`Successfully fetched ${products.length} products.`);
    return products
  } catch (error) {
    console.error("ERROR FETCHING ALL PRODUCTS:", error);
    return []
  }
} 