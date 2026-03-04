/**
 * Apple Contacts integration for Lights.
 * Uses expo-contacts for permission and native contact picker.
 */

import * as Contacts from 'expo-contacts';

export interface PickedContact {
  name: string;
  photoUri: string | null;
  birthday: string | null; // ISO YYYY-MM-DD
  phone: string | null;
  email: string | null;
  address: string | null;
  contactId: string | null;
}

function formatAddress(addr: Contacts.Address): string {
  const parts = [
    addr.street,
    addr.city,
    addr.region,
    addr.postalCode,
    addr.country,
  ].filter(Boolean);
  return parts.join(', ');
}

/** Request contacts permission. On iOS, picker can work without full permission. */
export async function requestContactsPermission(): Promise<'granted' | 'denied' | 'limited'> {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'limited';
}

/** Check current permission without prompting. */
export async function getContactsPermission(): Promise<'granted' | 'denied' | 'limited' | 'undetermined'> {
  const { status } = await Contacts.getPermissionsAsync();
  return status as 'granted' | 'denied' | 'limited' | 'undetermined';
}

/**
 * Present native contact picker and return normalized contact data.
 * On Android, READ_CONTACTS permission is required first.
 */
export async function pickContact(): Promise<PickedContact | null> {
  const perm = await requestContactsPermission();
  if (perm === 'denied') {
    return null;
  }

  const contact = await Contacts.presentContactPickerAsync();
  if (!contact || !contact.name) {
    return null;
  }

  const name = (contact.name || `${(contact as any).firstName ?? ''} ${(contact as any).lastName ?? ''}`.trim()) || 'Unknown';

  let birthday: string | null = null;
  const b = (contact as any).birthday;
  if (b) {
    if (b instanceof Date && !isNaN(b.getTime())) {
      birthday = b.toISOString().slice(0, 10);
    } else if (typeof b === 'object' && b !== null && 'day' in b) {
      const y = (b as any).year ?? new Date().getFullYear();
      const m = (b as any).month;
      const d = (b as any).day;
      const month = typeof m === 'number' && m >= 1 && m <= 12 ? m : (typeof m === 'number' ? m + 1 : 1);
      birthday = `${y}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  const phone = contact.phoneNumbers?.[0]?.number ?? null;
  const email = (contact.emails?.[0] as any)?.email ?? contact.emails?.[0] ?? null;
  const addr = contact.addresses?.[0];
  const address = addr ? formatAddress(addr) : null;
  const photoUri = (contact.image as any)?.uri ?? (contact as any).image?.uri ?? null;
  const contactId = (contact as any).id ?? null;

  return {
    name,
    photoUri,
    birthday,
    phone,
    email,
    address,
    contactId,
  };
}
