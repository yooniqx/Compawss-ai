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

import {
  getDemoMode,
  DEMO_VETS,
  DEMO_NGOS,
  DEMO_VOLUNTEERS,
  DEMO_FOSTER_HOMES,
  DEMO_RESCUE_CASES,
  DEMO_DASHBOARD_STATS,
  DEMO_MY_PETS,
  DEMO_NEARBY_ACTIVITY,
  DEMO_VOLUNTEER_MISSIONS,
  DEMO_ACTIVE_FOSTER,
  DEMO_NOTIFICATIONS_DATA,
  DEMO_NGO_COORD_RESCUERS,
  DEMO_VOLUNTEER_COMMUNITY_FEED
} from './demoData';

const isDemo = getDemoMode();

export { getDemoMode, setDemoMode } from './demoData';

/* ==========================================================================
   PRODUCTION DATA ROUTING - DEFAULT NULL OR EMPTY TO FORCE EMPTY STATES
   ========================================================================== */

export const VETS: Vet[] = isDemo ? DEMO_VETS : [];

export const NGOS: NGO[] = isDemo ? DEMO_NGOS : [];

export const VOLUNTEERS: Volunteer[] = isDemo ? DEMO_VOLUNTEERS : [];

export const FOSTER_HOMES: FosterHome[] = isDemo ? DEMO_FOSTER_HOMES : [];

export const RESCUE_CASES: RescueCase[] = isDemo ? DEMO_RESCUE_CASES : [];

export const DASHBOARD_STATS: DashboardStat = isDemo ? DEMO_DASHBOARD_STATS : {
  livesSavedCount: 0,
  livesSavedTrend: 'No cases recorded',
  activeVolunteersCount: 0,
  activeVolunteersTrend: '0 hrs logged',
  responseTimeMinutes: 0,
  coverageAreaPercent: 0,
  casesTodayCount: 0,
  pendingEmergencyAppeals: 0,
  dispatchedRescuesCount: 0
};

export const MY_PETS: PetInfo[] = isDemo ? DEMO_MY_PETS : [];

export const NEARBY_ACTIVITY: StrayReport[] = isDemo ? DEMO_NEARBY_ACTIVITY : [];

export const VOLUNTEER_MISSIONS: ActiveMission[] = isDemo ? DEMO_VOLUNTEER_MISSIONS : [];

export const ACTIVE_FOSTER = isDemo ? DEMO_ACTIVE_FOSTER : {
  name: 'No Active Foster',
  breed: 'None',
  gender: 'Unknown',
  age: 'N/A',
  daysLeft: 0,
  image: 'https://images.unsplash.com/photo-1543509615-fd39d21e1bc9?auto=format&fit=crop&q=80&w=400',
  inquiries: [],
  tasks: [],
  supplies: []
};

export const NOTIFICATIONS_DATA = isDemo ? DEMO_NOTIFICATIONS_DATA : [];

export const NGO_COORD_RESCUERS = isDemo ? DEMO_NGO_COORD_RESCUERS : [];

export const VOLUNTEER_COMMUNITY_FEED = isDemo ? DEMO_VOLUNTEER_COMMUNITY_FEED : [];
