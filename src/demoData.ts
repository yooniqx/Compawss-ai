import { 
  AnimalProfile, 
  MedicalRecord, 
  CaseUpdate, 
  RescueCase, 
  NGO, 
  Vet, 
  Volunteer, 
  FosterHome, 
  DashboardStat,
  PetInfo,
  StrayReport,
  ActiveMission
} from './types';

// Global DEMO_MODE toggle, defaulting to false. Can be enabled via localStorage or UI toggle.
export const getDemoMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('compawss_demo_mode') === 'true';
  }
  return false;
};

export const setDemoMode = (value: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('compawss_demo_mode', value ? 'true' : 'false');
  }
};

/* ==========================================================================
   1. REALISTIC SEED DATA FOR VETERINARIANS & CLINICS (INDIA)
   ========================================================================== */
export const DEMO_VETS: Vet[] = [
  {
    id: 'vet-1',
    name: 'Dr. Shalini Mukherji',
    clinicName: 'Crown Veterinary Hospital',
    address: 'Bandra West, Link Road, Mumbai, Maharashtra 400050',
    contact: '+91 98200 12345',
    specialties: ['Orthopedic Surgery', 'Trauma Management', 'Infectious Diseases'],
    distance: '1.2 km away',
    available24x7: true,
    emergencyVitalsMonitorCapable: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'vet-2',
    name: 'Dr. Rohan Desai',
    clinicName: 'Koramangala Pet Care Clinic',
    address: '8th Block, Koramangala, Bangalore, Karnataka 560095',
    contact: '+91 99800 54321',
    specialties: ['Canine Rehabilitation', 'Internal Medicine', 'Emergency triage'],
    distance: '3.4 km away',
    available24x7: false,
    emergencyVitalsMonitorCapable: true,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
  }
];

/* ==========================================================================
   2. REALISTIC SEED DATA FOR REGISTERED NGOs (INDIA)
   ========================================================================== */
export const DEMO_NGOS: NGO[] = [
  {
    id: 'ngo-1',
    name: 'Stray Relief India (SRI)',
    city: 'Mumbai',
    address: 'Andheri West, Near Azad Nagar Metro Station, Mumbai 400053',
    contact: '+91 22 2673 0912',
    coverageAreas: ['Andheri', 'Bandra', 'Juhu', 'Khar', 'Santa Cruz'],
    capacity: {
      dogs: { current: 48, max: 60 },
      cats: { current: 18, max: 25 },
      cattle: { current: 4, max: 10 }
    },
    rating: 4.8
  },
  {
    id: 'ngo-2',
    name: 'CUPA Rehabilitation Centre',
    city: 'Bangalore',
    address: 'RT Nagar, Veterinary College Campus, Bangalore 560032',
    contact: '+91 80 2294 7300',
    coverageAreas: ['Koramangala', 'Indiranagar', 'RT Nagar', 'Hebbal', 'Whitefield'],
    capacity: {
      dogs: { current: 72, max: 80 },
      cats: { current: 30, max: 30 }
    },
    rating: 4.9
  }
];

/* ==========================================================================
   3. REALISTIC VOLUNTEERS & ACTIVE RESPONDERS (INDIA)
   ========================================================================== */
export const DEMO_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol-1',
    name: 'Karan Mehra',
    contact: '+91 98111 87654',
    city: 'New Delhi',
    skills: ['Stray Handling', 'Canine First Aid', 'Transport Driving'],
    activeHours: 142,
    rating: 4.9,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'vol-2',
    name: 'Pooja Hegde',
    contact: '+91 91234 56789',
    city: 'Mumbai',
    skills: ['Feline Trapping', 'Post-Op Medicine Administration', 'Foster Care coordination'],
    activeHours: 96,
    rating: 4.7,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  }
];

/* ==========================================================================
   4. DETAILED REALISTIC FOSTER HOMES (INDIA)
   ========================================================================== */
export const DEMO_FOSTER_HOMES: FosterHome[] = [
  {
    id: 'foster-1',
    hostName: 'Meera Sen',
    location: 'Bandra Reclamation, Mumbai',
    contact: '+91 98333 44556',
    preferences: ['Puppies only', 'Small size injured dogs', 'Parvovirus recovery dogs'],
    capacity: 2,
    currentFosters: 1,
    availabilityStatus: 'Available'
  }
];

/* ==========================================================================
   5. COMPREHENSIVE BACKEND-READY SEED DATA FOR RESCUE CASES
   ========================================================================== */
export const DEMO_RESCUE_CASES: RescueCase[] = [
  {
    id: 'case-101',
    animalProfile: {
      id: 'animal-1',
      name: 'Sheru',
      species: 'Dog',
      breed: 'Indian Pariah (Indie Stray)',
      age: '2 years',
      gender: 'Male',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
      distinguishingFeatures: 'Light brown coat with a distinctive black patches on his back and left ear flopped',
      vitals: {
        heartRate: 135,
        activity: 'Low'
      }
    },
    type: 'Injured Stray',
    location: 'Near Bandra Police Station, Mumbai',
    region: 'Bandra West, Mumbai',
    distance: '1.1 km away',
    timeAgo: '12m ago',
    latitude: 19.0544,
    longitude: 72.8402,
    reporterName: 'Suresh Patil',
    reporterContact: '+91 98205 99110',
    isAnonymous: false,
    status: 'Rescue in Progress',
    priority: 'Critical',
    assignedResponderId: 'vol-2',
    assignedNgoId: 'ngo-1',
    assignedVetId: 'vet-1',
    timeline: [
      {
        id: 'timeline-1',
        caseId: 'case-101',
        status: 'Reported',
        title: 'Emergency Case Logged',
        description: 'Citizen suresh patil reported a stray pariah hit by an auto-rickshaw, bleeding from left paw and showing signs of acute shock.',
        timestamp: '12m ago',
        authorName: 'Suresh Patil'
      }
    ],
    medicalRecord: {
      id: 'med-101',
      caseId: 'case-101',
      diagnostics: 'Left forelimb laceration with moderate subcutaneous bleeding, suspected radial nerve damage, and elevated risk of shock.',
      severity: 'Critical',
      vitals: {
        heartRate: 135,
        temperatureCelsius: 38.2,
        activity: 'Low'
      },
      treatmentPlan: 'Immediate wound debridement, topical betadine irrigation, compression dressing, and IV ringers lactate to stabilize blood pressure.',
      prescription: ['Ceftriaxone antibiotics injection', 'Meloxicam pain management solution', 'Anti-rabies booster (Post-exposure prophylaxis)'],
      vetId: 'vet-1',
      createdAt: 'Just now'
    }
  },
  {
    id: 'case-102',
    animalProfile: {
      id: 'animal-2',
      name: 'Kaalu',
      species: 'Dog',
      breed: 'Desi Street Dog Mix',
      age: '4 yrs',
      gender: 'Male',
      image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=400',
      distinguishingFeatures: 'Sleek black coat with white chest fur and yellow reflective collar',
      vitals: {
        heartRate: 85,
        activity: 'Normal'
      }
    },
    type: 'Emergency Vet Need',
    location: '8th Cross, Koramangala, Bangalore',
    region: 'Koramangala, Bangalore',
    distance: '3.2 km away',
    timeAgo: '45m ago',
    latitude: 12.9352,
    longitude: 77.6245,
    reporterName: 'Anjali Hegde',
    reporterContact: '+91 99451 22334',
    isAnonymous: false,
    status: 'Veterinary Care',
    priority: 'High',
    assignedResponderId: 'vol-3',
    assignedNgoId: 'ngo-2',
    assignedVetId: 'vet-2',
    assignedFosterId: 'foster-2',
    timeline: [
      {
        id: 'timeline-4',
        caseId: 'case-102',
        status: 'Reported',
        title: 'Severe Dehydration Sighted',
        description: 'Resident reported a community guard dog vomiting frequently and unable to keep water down under heavy sun exposure.',
        timestamp: '45m ago',
        authorName: 'Anjali Hegde'
      }
    ],
    medicalRecord: {
      id: 'med-102',
      caseId: 'case-102',
      diagnostics: 'Severe dehydration (approx 8%), high body temperature due to heat stroke exhaustion, tick fever negative.',
      severity: 'Observation',
      vitals: {
        heartRate: 98,
        temperatureCelsius: 40.1,
        activity: 'Normal'
      },
      treatmentPlan: 'Aggressive intravenous electrolyte replacement, wet towel cooling bath, liver protective supplement drip.',
      prescription: ['IV DNS 500ml', 'Pantocid gastropreventative', 'Neurobion energy booster'],
      vetId: 'vet-2',
      createdAt: '10m ago'
    }
  },
  {
    id: 'case-103',
    animalProfile: {
      id: 'animal-3',
      name: 'Rani',
      species: 'Cat',
      breed: 'Indian Domestic Shorthair (Calico)',
      age: '1 year',
      gender: 'Female',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
      distinguishingFeatures: 'Tri-color calico pattern with bright green eyes and short tail',
      vitals: {
        heartRate: 110,
        activity: 'Normal'
      }
    },
    type: 'Foster Request',
    location: 'Sector 4 flyover, Saket',
    region: 'Saket, Delhi',
    distance: '0.9 km away',
    timeAgo: '1h ago',
    latitude: 28.5244,
    longitude: 77.2167,
    reporterName: 'Rahul Chawla',
    reporterContact: '+91 98114 90510',
    isAnonymous: true,
    status: 'Foster Care',
    priority: 'Standard',
    assignedNgoId: 'ngo-3',
    assignedFosterId: 'foster-3',
    timeline: [
      {
        id: 'timeline-7',
        caseId: 'case-103',
        status: 'Reported',
        title: 'Abandoned Kittens in Box',
        description: 'An anonymous passerby found three young calico kittens abandoned inside a taped cardboard box near Saket Metro parking.',
        timestamp: '1h ago',
        authorName: 'Rahul Chawla'
      }
    ]
  },
  {
    id: 'case-104',
    animalProfile: {
      id: 'animal-4',
      name: 'Coco',
      species: 'Dog',
      breed: 'Beagle',
      age: '3 years',
      gender: 'Male',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
      distinguishingFeatures: 'Wearing a bright red collar with a missing brass tag, very friendly',
      vitals: {
        heartRate: 80,
        activity: 'High'
      }
    },
    type: 'Missing Pet',
    location: 'Near HSR Layout Club, Bangalore',
    region: 'HSR Layout, Bangalore',
    distance: '4.5 km away',
    timeAgo: '2h ago',
    latitude: 12.9102,
    longitude: 77.6450,
    reporterName: 'Anshul Singhal',
    reporterContact: '+91 97410 88776',
    isAnonymous: false,
    status: 'Reported',
    priority: 'High',
    timeline: [
      {
        id: 'timeline-9',
        caseId: 'case-104',
        status: 'Reported',
        title: 'Pet Missing Broadcast Published',
        description: 'Owner reported Coco slipped leash during morning run. Last spotted near Sector 2 park heading towards HSR Club.',
        timestamp: '2h ago',
        authorName: 'Anshul Singhal'
      }
    ]
  }
];

export const DEMO_DASHBOARD_STATS: DashboardStat = {
  livesSavedCount: 1482,
  livesSavedTrend: '+28 cases this week',
  activeVolunteersCount: 342,
  activeVolunteersTrend: 'Over 28,000 hrs logged',
  responseTimeMinutes: 18,
  coverageAreaPercent: 96.4,
  casesTodayCount: 24,
  pendingEmergencyAppeals: 3,
  dispatchedRescuesCount: 8
};

export const DEMO_MY_PETS: PetInfo[] = DEMO_RESCUE_CASES.map((rc) => ({
  id: rc.animalProfile.id,
  name: rc.animalProfile.name,
  breed: rc.animalProfile.breed,
  gender: rc.animalProfile.gender,
  age: rc.animalProfile.age,
  image: rc.animalProfile.image,
  status: rc.medicalRecord ? (rc.medicalRecord.severity as 'Stable' | 'Observation' | 'Critical') : 'Stable',
  vitals: {
    heartRate: rc.animalProfile.vitals?.heartRate || 80,
    activity: rc.animalProfile.vitals?.activity || 'Normal'
  },
  medPlan: rc.medicalRecord ? `${rc.medicalRecord.diagnostics} - ${rc.medicalRecord.prescription.join(', ')}` : undefined
}));

export const DEMO_NEARBY_ACTIVITY: StrayReport[] = DEMO_RESCUE_CASES.map((rc) => ({
  id: rc.id,
  type: `${rc.type}: ${rc.animalProfile.name || 'Unnamed Stray'} Sighted`,
  location: rc.region,
  distance: rc.distance,
  timeAgo: rc.timeAgo,
  status: rc.status
}));

export const DEMO_VOLUNTEER_MISSIONS: ActiveMission[] = [
  {
    id: 'mission-1',
    title: 'Transport Indie "Sheru" to Crown Hospital',
    eta: '10 mins ETA',
    route: 'Bandra Police Station to Crown Vet',
    details: 'Sheru has a deep laceration on his front left paw. Requires gentle transport and immediate post-exposure vaccination.'
  }
];

export const DEMO_ACTIVE_FOSTER = {
  name: 'Sheru',
  breed: 'Indian Pariah (Indie Stray)',
  gender: 'Male',
  age: '2 Yrs',
  daysLeft: 5,
  image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
  inquiries: [
    { name: 'Dr. Vivek Malhotra (Dermatologist)', time: '2h ago', message: 'Hi! Sheru looks so gentle. We have a green garden flat in South Delhi. Is he fully vaccinated?' }
  ],
  tasks: [
    { id: 'task-1', text: 'Clean Left Paw Dressing', desc: 'Apply Betadine antiseptic dressing twice daily.', completed: true }
  ],
  supplies: [
    { name: 'Aardvark Orthopedic Bedding', desc: 'Essential support for recovering femur limb', quantity: '1 Unit' }
  ]
};

export const DEMO_NOTIFICATIONS_DATA = [
  {
    id: 'notif-1',
    title: 'Emergency Priority Alert',
    message: 'An injured Indie stray "Sheru" Sighted near Bandra Police Station with active leg wound. Priority mobilize.',
    category: 'Urgent',
    time: '2 mins ago'
  }
];

export const DEMO_NGO_COORD_RESCUERS = [
  {
    name: 'Dr. Shalini Mukherji (Vet)',
    role: 'Crown Mobile Medical Unit',
    distance: '1.2 km away',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
  }
];

export const DEMO_VOLUNTEER_COMMUNITY_FEED = [
  {
    id: 'feed-1',
    author: 'Karan Mehra',
    time: '2 hours ago',
    message: 'Successfully admitted the injured street puppy in Saket. The surgery was great, he is eating meals!',
    likes: 54,
    comments: 8,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=500'
  }
];
