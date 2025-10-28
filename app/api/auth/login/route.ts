import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // In production, replace with actual database query
    // For now, using environment-based test users
    const testUsers = [
      {
        id: '1',
        name: process.env.ADMIN_NAME || 'Church Admin',
        email: process.env.ADMIN_EMAIL || 'admin@salemprimitivebaptist.org',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
        role: 'admin'
      }
    ];

    const user = testUsers.find(u => u.email === email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}