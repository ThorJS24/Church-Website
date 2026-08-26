import 'server-only';
import { getAdminDb, serializeTimestamps } from '@/lib/firebase-admin';
import { LocationInputSchema, type LocationInput } from '@/lib/domain/schemas';
import type { Location } from '@/lib/domain/types';

const COLLECTION = 'locations';

function withId(doc: FirebaseFirestore.DocumentSnapshot): Location {
  return serializeTimestamps({ id: doc.id, ...doc.data() }) as Location;
}

export async function getLocationById(id: string): Promise<Location | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(id).get();
  return snap.exists ? withId(snap) : null;
}

export async function listLocations(): Promise<Location[]> {
  const snap = await getAdminDb().collection(COLLECTION).get();
  return snap.docs.map(withId);
}

export async function createLocation(input: LocationInput): Promise<Location> {
  const data = LocationInputSchema.parse(input);
  const ref = await getAdminDb().collection(COLLECTION).add(data);
  return { id: ref.id, ...data } as Location;
}

export async function updateLocation(id: string, input: Partial<LocationInput>): Promise<void> {
  const data = LocationInputSchema.partial().parse(input);
  await getAdminDb().collection(COLLECTION).doc(id).update(data);
}
