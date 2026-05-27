export enum Screen {
  Splash = 'SPLASH',
  Home = 'HOME',
  VoiceReporting = 'VOICE_REPORTING',
  AccessibilitySettings = 'ACCESSIBILITY_SETTINGS',
  OfflineMode = 'OFFLINE_MODE',
  InjuryAnalysis = 'INJURY_ANALYSIS',
  RescueCommand = 'RESCUE_COMMAND',
  Notifications = 'NOTIFICATIONS',
  FosterDashboard = 'FOSTER_DASHBOARD',
  NGODashboard = 'NGO_DASHBOARD',
  VetDashboard = 'VET_DASHBOARD',
  VolunteerDashboard = 'VOLUNTEER_DASHBOARD',
  OwnerDashboard = 'OWNER_DASHBOARD',
  SOS = 'SOS',
  AIAssistant = 'AI_ASSISTANT',
}

export interface TransitionConfig {
  type: 'push' | 'none';
  direction?: 'forward' | 'backward';
}

// Global Core Data Models

export interface AnimalProfile {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Cattle' | 'Bird' | 'Other';
  breed: string;
  age: string;
  gender: 'Male' | 'Female' | 'Unknown';
  image: string;
  distinguishingFeatures?: string;
  vitals?: {
    heartRate: number;
    activity: 'High' | 'Normal' | 'Low';
  };
}

export interface MedicalRecord {
  id: string;
  caseId: string;
  diagnostics: string;
  severity: 'Critical' | 'Observation' | 'Stable';
  vitals: {
    heartRate: number;
    temperatureCelsius?: number;
    respirationRate?: number;
    activity: 'High' | 'Normal' | 'Low';
  };
  treatmentPlan: string;
  prescription: string[];
  vetId: string;
  createdAt: string;
}

export interface CaseUpdate {
  id: string;
  caseId: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  photoUrl?: string;
  authorName?: string;
}

export interface RescueCase {
  id: string;
  animalProfile: AnimalProfile;
  type: 'Injured Stray' | 'Abandoned Animal' | 'Missing Pet' | 'Emergency Vet Need' | 'Foster Request' | 'NGO Rescue Request';
  location: string;
  region: string; // Localities in India like "Bandra, Mumbai", "Koramangala, Bangalore", "Saket, Delhi"
  distance: string;
  timeAgo: string;
  latitude: number;
  longitude: number;
  reporterName: string;
  reporterContact: string;
  isAnonymous: boolean;
  status: 'Reported' | 'Assigned' | 'Rescue in Progress' | 'Veterinary Care' | 'Foster Care' | 'Resolved' | 'Closed';
  priority: 'Critical' | 'High' | 'Standard';
  assignedResponderId?: string;
  assignedNgoId?: string;
  assignedVetId?: string;
  assignedFosterId?: string;
  timeline: CaseUpdate[];
  medicalRecord?: MedicalRecord;
}

export interface NGO {
  id: string;
  name: string;
  city: string;
  address: string;
  contact: string;
  coverageAreas: string[];
  capacity: {
    dogs: { current: number; max: number };
    cats: { current: number; max: number };
    cattle?: { current: number; max: number };
  };
  rating: number;
  source?: 'Google' | 'Verified Database' | 'Demo' | 'Google Places' | 'Supabase Directory' | 'Verified' | 'Demo Data' | string;
  openingStatus?: string;
  type?: string;
}

export interface Vet {
  id: string;
  name: string;
  clinicName: string;
  address: string;
  contact: string;
  specialties: string[];
  distance: string;
  available24x7: boolean;
  emergencyVitalsMonitorCapable: boolean;
  image: string;
  source?: 'Google' | 'Verified Database' | 'Demo' | 'Google Places' | 'Supabase Directory' | 'Verified' | 'Demo Data' | string;
  openingStatus?: string;
  type?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  contact: string;
  city: string;
  skills: string[];
  activeHours: number;
  rating: number;
  avatarUrl: string;
}

export interface FosterHome {
  id: string;
  hostName: string;
  location: string;
  contact: string;
  preferences: string[];
  capacity: number;
  currentFosters: number;
  availabilityStatus: 'Available' | 'Full' | 'Inactive';
}

export interface DashboardStat {
  livesSavedCount: number;
  livesSavedTrend: string;
  activeVolunteersCount: number;
  activeVolunteersTrend: string;
  responseTimeMinutes: number;
  coverageAreaPercent: number;
  casesTodayCount: number;
  pendingEmergencyAppeals: number;
  dispatchedRescuesCount: number;
}

// Backwards-Compatibility Adapters
export interface PetInfo {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  status: 'Stable' | 'Observation' | 'Critical';
  vitals: {
    heartRate: number;
    activity: 'High' | 'Normal' | 'Low';
  };
  image: string;
  medPlan?: string;
}

export interface StrayReport {
  id: string;
  type: string;
  location: string;
  distance: string;
  timeAgo: string;
  status: string;
}

export interface ActiveMission {
  id: string;
  title: string;
  eta: string;
  route: string;
  details: string;
}
