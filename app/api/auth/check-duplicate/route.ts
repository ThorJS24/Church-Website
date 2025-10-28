import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, or } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json()
    
    const q = query(
      collection(db, 'users'),
      or(
        where('email', '==', email.toLowerCase()),
        where('phone', '==', phone)
      )
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const existingUser = querySnapshot.docs[0].data()
      const duplicateField = existingUser.email === email.toLowerCase() ? 'email' : 'phone'
      return NextResponse.json({
        exists: true,
        field: duplicateField,
        message: `This ${duplicateField} is already registered`
      }, { status: 409 })
    }
    
    return NextResponse.json({ exists: false })
    
  } catch (error) {
    return NextResponse.json({ exists: false })
  }
}