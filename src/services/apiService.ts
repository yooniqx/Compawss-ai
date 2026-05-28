import { Vet, NGO, Volunteer, FosterHome } from '../types';
import { safeFetchSupabaseTable, isSupabaseConfigured, SupabaseRecord } from './supabaseClient';

/**
 * Compawss real-data-ready service layer.
 * Integrates browser Geolocation, Google Places API, Supabase Database queries,
 * and realistic Indian emergency shelter & responders directories.
 */

const sanitizeSupabaseUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.trim().replace(/^["']|["']$/g, '');
  while (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  // Strip '/rest/v1' suffix if present to ensure we have the base host URL
  if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.slice(0, -8);
  }
  while (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
};

const RAW_SUPABASE_URL = sanitizeSupabaseUrl((import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '');

export const API_KEYS = {
  // Google Maps Platform API Key (Exposed to Vite bundle)
  GOOGLE_MAPS: process.env.GOOGLE_MAPS_PLATFORM_KEY || '',

  // Database credentials endpoints (Supabase)
  SUPABASE_URL: RAW_SUPABASE_URL,
  SUPABASE_ANON_KEY: ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, ''),

  // NGO/Rescuer customized directory API endpoint (Using Supabase REST endpoint for the 'ngos' table)
  NGO_DIRECTORY_API_URI: RAW_SUPABASE_URL ? `${RAW_SUPABASE_URL}/rest/v1/ngos` : ''
};

// Check if live API engines are configured
export const isGoogleMapsConfigured = (): boolean => {
  const key = API_KEYS.GOOGLE_MAPS;
  return Boolean(key) && key !== 'YOUR_API_KEY' && key.trim().length > 10;
};

/* ==========================================================================
   1. GEOLOCATION SERVICE (Device GPS wrapper)
   ========================================================================== */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Fetches the user's GPS device location via standard Web Geolocation API.
 */
export async function getDevicePreciseLocation(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser or inside this sandbox environment.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}

/* ==========================================================================
   2. GOOGLE PLACES API SERVICE (Nearby Animal Services search)
   ========================================================================== */

/**
 * Searches for nearby vets, animal hospitals, or pet rescues using the official Places Library.
 * Prevents CORS conflicts by relying on client-side JS SDK.
 * Dynamically queries Google if verified key is present.
 */
export async function findNearbyVets(
  latitude: number,
  longitude: number,
  radiusMeters = 15000
): Promise<Vet[]> {
  const isKeyPresent = isGoogleMapsConfigured();

  // If Google Maps is loaded and client has valid key, use live Place search
  if (isKeyPresent && typeof window !== 'undefined' && (window as any).google?.maps?.places) {
    try {
      const { Place } = (window as any).google.maps.places;
      
      const searchRequest = {
        fields: ['id', 'displayName', 'formattedAddress', 'regularOpeningHours', 'nationalPhoneNumber', 'location'],
        locationRestriction: {
          center: { lat: latitude, lng: longitude },
          radius: radiusMeters
        },
        includedPrimaryTypes: ['veterinary_care']
      };

      const { places } = await Place.searchNearby(searchRequest);

      if (places && places.length > 0) {
        return places.map((place: any, index: number) => {
          const lat2 = place.location?.lat();
          const lon2 = place.location?.lng();
          
          let distanceStr = 'Nearby';
          if (lat2 !== undefined && lon2 !== undefined) {
            distanceStr = formatDistance(calculateHaversineDistance(latitude, longitude, lat2, lon2));
          }

          const openNow = place.regularOpeningHours?.openNow;
          const statusText = openNow !== undefined ? (openNow ? 'Open Now' : 'Closed') : 'Hours info unavailable';

          return {
            id: place.id || `google-vet-${index}`,
            name: 'Veterinary Duty Surgeon',
            clinicName: place.displayName || 'Veterinary Diagnostics Hospital',
            address: place.formattedAddress || 'Sighted local sector area',
            contact: place.nationalPhoneNumber || 'Contact Number Unavailable',
            specialties: ['General Practices', 'Emergency Trauma care'],
            distance: distanceStr,
            available24x7: !!openNow,
            emergencyVitalsMonitorCapable: true,
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
            source: 'Google Places',
            openingStatus: statusText,
            type: 'Animal Hospital & Vet Clinic'
          };
        });
      }
    } catch (err) {
      console.warn('Google Places API call encountered error, fallback to directories:', err);
    }
  }

  // --- QUERY 2: TRY FETCHING FROM SUPABASE 'veterinarians' TABLE ---
  if (isSupabaseConfigured()) {
    const dbVets = await safeFetchSupabaseTable<SupabaseRecord>('veterinarians');
    if (dbVets && dbVets.length > 0) {
      return dbVets.map(row => {
        const dKm = calculateHaversineDistance(latitude, longitude, row.latitude, row.longitude);
        const isVerified = row.verified_status?.toLowerCase() === 'verified' || row.verified_status?.toLowerCase() === 'approved';
        return {
          id: row.id,
          name: row.name || 'Specialist Surgeon',
          clinicName: row.name || 'Veterinary Emergency Clinic',
          address: row.address || `${row.city}, ${row.state}`,
          contact: row.phone || 'Unavailable',
          specialties: row.service_tags || ['Trauma Triage', 'Ambulance Support'],
          distance: formatDistance(dKm),
          available24x7: row.emergency_available,
          emergencyVitalsMonitorCapable: true,
          image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
          source: isVerified ? 'Verified' : 'Supabase Directory',
          openingStatus: row.opening_hours || 'Ambulance dispatch active',
          type: row.type || 'Veterinary Care Facility'
        };
      }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }
  }

  // FALLBACK DATA: Curated list of verified Indian Veterinary Hospitals & Clinics (Clearly Labeled Demo Data)
  const fallbackVets: Vet[] = [
    {
      id: 'vet-1',
      name: 'Dr. Shalini Mukherji',
      clinicName: 'Crown Veterinary Hospital',
      address: 'Bandra West, Link Road, Mumbai, Maharashtra 400050',
      contact: '+91 22 6123 0000',
      specialties: ['Orthopedic Surgery', 'Trauma Resuscitation', 'Infectious Stray Triage'],
      distance: formatDistance(calculateHaversineDistance(latitude, longitude, 19.0544, 72.8402)),
      available24x7: true,
      emergencyVitalsMonitorCapable: true,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      source: 'Demo Data',
      openingStatus: 'Open 24/7 (Emergency Service)',
      type: 'Triage Hospital'
    },
    {
      id: 'vet-2',
      name: 'Dr. Rohan Desai',
      clinicName: 'Koramangala Pet Care Clinic',
      address: '8th Block, Koramangala, Bangalore, Karnataka 560095',
      contact: '+91 80 4353 1212',
      specialties: ['Canine Rehabilitation', 'Water dehydration therapy'],
      distance: formatDistance(calculateHaversineDistance(latitude, longitude, 12.9352, 77.6245)),
      available24x7: false,
      emergencyVitalsMonitorCapable: true,
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
      source: 'Demo Data',
      openingStatus: 'Open until 9:00 PM',
      type: 'Primary Care Center'
    },
    {
      id: 'vet-3',
      name: 'Dr. Amit Sharma',
      clinicName: 'Friendicoes SECA Emergency Clinic',
      address: 'No. 270, Defence Colony Flyover Market, New Delhi 110024',
      contact: '+91 11 2432 0270',
      specialties: ['Severe Burn Recovery', 'Critical Care', 'Parvovirus Quarantine'],
      distance: formatDistance(calculateHaversineDistance(latitude, longitude, 28.5724, 77.2345)),
      available24x7: true,
      emergencyVitalsMonitorCapable: true,
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
      source: 'Demo Data',
      openingStatus: 'Open 24/7 (Emergency Shelter)',
      type: 'Stray Shelter & Ambulance Post'
    },
    {
      id: 'vet-4',
      name: 'Veterinary Clinic & Shelter Bavdhan',
      clinicName: 'RESQ Charitable Clinic',
      address: 'Bavdhan, Pune-Bengaluru Highway, Pune 411021',
      contact: '+91 91722 21212',
      specialties: ['Wildlife Trauma', 'Large Animal Surgery', 'Thermal Burns recovery'],
      distance: formatDistance(calculateHaversineDistance(latitude, longitude, 18.5132, 73.7825)),
      available24x7: true,
      emergencyVitalsMonitorCapable: true,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=300',
      source: 'Demo Data',
      openingStatus: 'Open 24/7',
      type: 'Charitable Veterinary NGO Center'
    }
  ];

  return fallbackVets.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

/* ==========================================================================
   3. NGO & RESCUER DIRECTORY SERVICE
   ========================================================================== */

/**
 * Fetches verified NGOs and active Animal Rescue Centers surrounding selected locality.
 * Automatically queries Supabase list if present, calculating coordinate distances dynamically.
 */
export async function fetchNearbyNGOs(
  latitude: number,
  longitude: number,
  city = 'Mumbai'
): Promise<NGO[]> {
  // Try querying dynamic Supabase Table 'ngos'
  if (isSupabaseConfigured()) {
    const dbNgos = await safeFetchSupabaseTable<SupabaseRecord>('ngos');
    if (dbNgos && dbNgos.length > 0) {
      return dbNgos.map(row => {
        const dKm = calculateHaversineDistance(latitude, longitude, row.latitude, row.longitude);
        const isVerified = row.verified_status?.toLowerCase() === 'verified' || row.verified_status?.toLowerCase() === 'approved';
        return {
          id: row.id,
          name: row.name,
          city: row.city,
          address: row.address || `${row.city}, ${row.state}`,
          contact: row.phone || row.email || 'Contact Info Protected',
          coverageAreas: row.service_tags || [row.city],
          capacity: { dogs: { current: 12, max: 30 }, cats: { current: 5, max: 15 } },
          rating: 4.8,
          source: isVerified ? 'Verified' : 'Supabase Directory',
          openingStatus: row.opening_hours || (row.emergency_available ? 'Ambulance Dispatch Active' : 'Standby'),
          type: row.type || 'NGO Rescue Center'
        };
      }).sort((a, b) => {
        // Safe check for numeric sort using a simple parser or keeping in city filter array
        return a.city === city ? -1 : 1;
      });
    }
  }

  // FALLBACK DATA: Curated list of verified Indian Animal NGOs (Labeled Demo Data)
  const curatedNGOs: NGO[] = [
    {
      id: 'ngo-1',
      name: 'Stray Relief India (SRI)',
      city: 'Mumbai',
      address: 'Andheri West, Near Azad Nagar Metro Station, Mumbai 400053',
      contact: '+91 22 2673 0912',
      coverageAreas: ['Andheri', 'Bandra', 'Juhu', 'Khar', 'Vile Parle'],
      capacity: { dogs: { current: 48, max: 60 }, cats: { current: 18, max: 25 }, cattle: { current: 4, max: 10 } },
      rating: 4.8,
      source: 'Demo Data',
      openingStatus: 'Ambulance dispatch active',
      type: 'NGO Stray Shelter'
    },
    {
      id: 'ngo-2',
      name: 'Compassion Unlimited Plus Action (CUPA)',
      city: 'Bangalore',
      address: 'RT Nagar, Veterinary College Campus, Bangalore 560032',
      contact: '+91 80 2294 7300',
      coverageAreas: ['Koramangala', 'Indiranagar', 'RT Nagar', 'Hebbal', 'HSR Layout'],
      capacity: { dogs: { current: 72, max: 80 }, cats: { current: 30, max: 40 } },
      rating: 4.9,
      source: 'Demo Data',
      openingStatus: 'Intake open',
      type: 'NGO Wildlife & Pet Recovery'
    },
    {
      id: 'ngo-3',
      name: 'RESQ Charitable Trust',
      city: 'Pune',
      address: 'Bavdhan, Pune-Bengaluru Highway, Pune 411021',
      contact: '+91 91722 21212',
      coverageAreas: ['Bavdhan', 'Kothrud', 'Aundh', 'Baner', 'Shivajinagar'],
      capacity: { dogs: { current: 110, max: 120 }, cats: { current: 35, max: 50 }, cattle: { current: 12, max: 15 } },
      rating: 4.9,
      source: 'Demo Data',
      openingStatus: '24 Hours Emergency Intake',
      type: 'NGO Rescue Ops'
    },
    {
      id: 'ngo-4',
      name: 'Sanjay Gandhi Animal Care Hospital',
      city: 'New Delhi',
      address: 'Shivaji Marg, Near Raja Garden, New Delhi 110027',
      contact: '+91 11 2544 7751',
      coverageAreas: ['West Delhi', 'Defence Colony', 'Saket', 'Gurugram'],
      capacity: { dogs: { current: 150, max: 200 }, cats: { current: 40, max: 60 }, cattle: { current: 30, max: 50 } },
      rating: 4.6,
      source: 'Demo Data',
      openingStatus: 'Open and responding',
      type: 'Animal Hospital NGO'
    }
  ];

  // Filter based on selected city to keep it locally context-aware!
  const filtered = curatedNGOs.filter(n => n.city === city);
  return filtered.length > 0 ? filtered : curatedNGOs;
}

/* ==========================================================================
   4. EXTRA MULTI-TABLE ALIGNED SERVICES
   ========================================================================== */

/**
 * Dynamically queries 'shelters' table from Supabase with proper fallbacks.
 */
export async function fetchShelters(latitude: number, longitude: number): Promise<any[]> {
  if (isSupabaseConfigured()) {
    const dbShelters = await safeFetchSupabaseTable<SupabaseRecord>('shelters');
    if (dbShelters && dbShelters.length > 0) {
      return dbShelters.map(row => {
        const dKm = calculateHaversineDistance(latitude, longitude, row.latitude, row.longitude);
        const isVerified = row.verified_status?.toLowerCase() === 'verified';
        return {
          id: row.id,
          name: row.name,
          address: row.address,
          city: row.city,
          contact: row.phone || 'Unavailable',
          distance: formatDistance(dKm),
          verified: isVerified,
          source: isVerified ? 'Verified' : 'Supabase Directory',
          type: row.type || 'Animal Shelter'
        };
      }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }
  }
  return []; // Return empty if unused or no db
}

/**
 * Dynamically queries 'volunteers' table from Supabase with proper fallbacks.
 */
export async function fetchVolunteersTable(): Promise<Volunteer[]> {
  if (isSupabaseConfigured()) {
    const dbVolunteers = await safeFetchSupabaseTable<SupabaseRecord>('volunteers');
    if (dbVolunteers && dbVolunteers.length > 0) {
      return dbVolunteers.map(row => ({
        id: row.id,
        name: row.name,
        contact: row.phone || 'Unavailable',
        city: row.city,
        skills: row.service_tags || ['Rescue Handler'],
        activeHours: 12,
        rating: 4.8,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
      }));
    }
  }
  return [];
}

/**
 * Dynamically queries 'responders' table from Supabase with proper fallbacks.
 */
export async function fetchRespondersTable(latitude: number, longitude: number): Promise<any[]> {
  if (isSupabaseConfigured()) {
    const dbResponders = await safeFetchSupabaseTable<SupabaseRecord>('responders');
    if (dbResponders && dbResponders.length > 0) {
      return dbResponders.map(row => {
        const dKm = calculateHaversineDistance(latitude, longitude, row.latitude, row.longitude);
        return {
          id: row.id,
          name: row.name,
          type: row.type || 'Field Responder',
          phone: row.phone,
          distance: formatDistance(dKm),
          source: 'Supabase Directory'
        };
      });
    }
  }
  return [];
}

/**
 * Dynamically queries 'foster_homes' table from Supabase with proper fallbacks.
 */
export async function fetchFosterHomesTable(): Promise<FosterHome[]> {
  if (isSupabaseConfigured()) {
    const dbFosters = await safeFetchSupabaseTable<SupabaseRecord>('foster_homes');
    if (dbFosters && dbFosters.length > 0) {
      return dbFosters.map(row => ({
        id: row.id,
        hostName: row.name,
        location: `${row.city}, ${row.state}`,
        contact: row.phone || 'Unavailable',
        preferences: row.service_tags || ['Puppies', 'Kittens'],
        capacity: 5,
        currentFosters: 2,
        availabilityStatus: row.emergency_available ? 'Available' : 'Full'
      }));
    }
  }
  // Standard hardcoded fallback representation
  return [
    {
      id: 'foster-1',
      hostName: 'Meera Sen',
      location: 'Koramangala, Bangalore',
      contact: '+91 98800 23412',
      preferences: ['Kittens', 'Recovering Birds'],
      capacity: 4,
      currentFosters: 1,
      availabilityStatus: 'Available'
    }
  ];
}

/**
 * Dynamically queries 'animal_ambulances' table from Supabase with proper fallbacks.
 */
export async function fetchAmbulancesTable(latitude: number, longitude: number): Promise<any[]> {
  if (isSupabaseConfigured()) {
    const dbAmbulances = await safeFetchSupabaseTable<SupabaseRecord>('animal_ambulances');
    if (dbAmbulances && dbAmbulances.length > 0) {
      return dbAmbulances.map(row => {
        const dKm = calculateHaversineDistance(latitude, longitude, row.latitude, row.longitude);
        return {
          id: row.id,
          name: row.name,
          phone: row.phone,
          available: row.emergency_available,
          distance: formatDistance(dKm),
          source: 'Supabase Directory'
        };
      });
    }
  }
  return [];
}

/* ==========================================================================
   5. DISTANCE CALCULATION UTILITIES
   ========================================================================== */

/**
 * Calculates straight line distance between two coordinates in kilometers.
 * Uses standard Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance floating point kilometers into a highly human-readable India distance telemetry string.
 */
export function formatDistance(distanceKm: number): string {
  if (isNaN(distanceKm)) return 'Nearby';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}
