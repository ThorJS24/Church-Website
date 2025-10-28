import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Mock user creation - replace with real database
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role: 'member' as const
    };

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      user: newUser,
      token
    });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}