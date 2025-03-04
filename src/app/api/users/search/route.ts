import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // Vérifier que la requête n'est pas vide
    if (!query || query.trim().length < 2) {
      return NextResponse.json([], { status: 200 });
    }

    // Rechercher des utilisateurs par username ou name
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { 
            username: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          },
          { 
            name: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          }
        ]
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true
      },
      take: 5 // Limiter à 5 résultats
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Erreur de recherche d\'utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche d\'utilisateurs' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}