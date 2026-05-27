import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  RescueCase, 
  Vet, 
  NGO, 
  Volunteer, 
  FosterHome, 
  DashboardStat, 
  CaseUpdate,
  MedicalRecord,
  AnimalProfile
} from '../types';
import { 
  VETS as INITIAL_VETS, 
  NGOS as INITIAL_NGOS, 
  VOLUNTEERS as INITIAL_VOLUNTEERS, 
  FOSTER_HOMES as INITIAL_FOSTERS, 
  RESCUE_CASES as INITIAL_CASES,
  NOTIFICATIONS_DATA as INITIAL_NOTIFICATIONS,
  DASHBOARD_STATS as INITIAL_STATS
} from '../data';
import { findNearbyVets, fetchNearbyNGOs } from '../services/apiService';

// Indian localities coordinate database for dynamic distance calculations
export interface LocationCoordinate {
  name: string;
  city: 'Mumbai' | 'Bangalore' | 'New Delhi' | 'Pune' | 'Kolkata' | 'Hyderabad';
  latitude: number;
  longitude: number;
}

export const INDIAN_LOCALITIES: LocationCoordinate[] = [
  { name: 'Bandra West', city: 'Mumbai', latitude: 19.0544, longitude: 72.8402 },
  { name: 'Andheri West', city: 'Mumbai', latitude: 19.1200, longitude: 72.8284 },
  { name: 'Juhu Scheme', city: 'Mumbai', latitude: 19.1026, longitude: 72.8242 },
  { name: 'Colaba Causeway', city: 'Mumbai', latitude: 18.9152, longitude: 72.8262 },
  { name: 'Koramangala 8th Block', city: 'Bangalore', latitude: 12.9352, longitude: 77.6245 },
  { name: 'Indiranagar 100 Feet Rd', city: 'Bangalore', latitude: 12.9719, longitude: 77.6412 },
  { name: 'HSR Layout Sector 2', city: 'Bangalore', latitude: 12.9102, longitude: 77.6450 },
  { name: 'Whitefield ITPL', city: 'Bangalore', latitude: 12.9840, longitude: 77.7516 },
  { name: 'Saket Metro Sector 4', city: 'New Delhi', latitude: 28.5244, longitude: 77.2167 },
  { name: 'Vasant Kunj Sector C', city: 'New Delhi', latitude: 28.5398, longitude: 77.1444 },
  { name: 'Defence Colony Market', city: 'New Delhi', latitude: 28.5724, longitude: 77.2345 },
  { name: 'Connaught Place', city: 'New Delhi', latitude: 28.6304, longitude: 77.2177 },
  { name: 'Bavdhan Highway', city: 'Pune', latitude: 18.5132, longitude: 73.7825 },
  { name: 'Kothrud Depo', city: 'Pune', latitude: 18.5074, longitude: 73.8078 },
  { name: 'Aundh West', city: 'Pune', latitude: 18.5580, longitude: 73.8075 },
  { name: 'Park Street', city: 'Kolkata', latitude: 22.5487, longitude: 88.3516 },
  { name: 'Salt Lake Sector V', city: 'Kolkata', latitude: 22.5692, longitude: 88.4306 },
  { name: 'Gachibowli IT Corridor', city: 'Hyderabad', latitude: 17.4483, longitude: 78.3741 },
  { name: 'Banjara Hills Rd 1', city: 'Hyderabad', latitude: 17.4162, longitude: 78.4347 }
];

interface RescueContextType {
  // Master lists
  vets: Vet[];
  ngos: NGO[];
  volunteers: Volunteer[];
  fosters: FosterHome[];
  cases: RescueCase[];
  notifications: any[];
  stats: DashboardStat;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  offlineQueue: any[];
  
  // Geolocation states
  userLocation: { latitude: number; longitude: number; name: string; city: string };
  setUserLocation: (loc: { latitude: number; longitude: number; name: string; city: string }) => void;
  gpsPermission: 'prompt' | 'granted' | 'denied';
  setGpsPermission: (val: 'prompt' | 'granted' | 'denied') => void;
  
  // Common functions
  requestGpsPermission: () => Promise<void>;
  updateUserLocationDirectlyByLocality: (localityName: string) => void;
  reportNewRescueCase: (caseInput: Partial<RescueCase> & { animalName: string; species: any; breed: string; type: any; locationText: string; reporterName: string; reporterContact: string; isAnonymous: boolean; audioUrl?: string; image?: string; isImmediateSos?: boolean }) => Promise<RescueCase>;
  assignResponderToCase: (caseId: string, volunteerId: string) => void;
  assignNgoToCase: (caseId: string, ngoId: string) => void;
  assignFosterToCase: (caseId: string, fosterId: string) => void;
  addCaseTimelineEvent: (caseId: string, status: string, title: string, desc: string, author: string) => void;
  addVetMedicalRecord: (caseId: string, diagnostics: string, severity: 'Critical' | 'Observation' | 'Stable', prescription: string[], vetId: string) => void;
  resolveCase: (caseId: string) => void;
  clearNotification: (id: string) => void;
  addNotification: (title: string, message: string, category: 'Urgent' | 'Success' | 'Info') => void;
  syncOfflineQueue: () => void;
  
  // Auxiliary Helpers
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => string;
}

const RescueContext = createContext<RescueContextType | undefined>(undefined);

export const RescueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vets, setVets] = useState<Vet[]>(INITIAL_VETS);
  const [ngos, setNgos] = useState<NGO[]>(INITIAL_NGOS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [fosters, setFosters] = useState<FosterHome[]>(INITIAL_FOSTERS);
  const [cases, setCases] = useState<RescueCase[]>(INITIAL_CASES);
  const [notifications, setNotifications] = useState<any[]>(INITIAL_NOTIFICATIONS);
  const [stats, setStats] = useState<DashboardStat>(INITIAL_STATS);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  
  // Default user location is Bandra West, Mumbai
  const [userLocation, setUserLocation] = useState({
    latitude: 19.0544,
    longitude: 72.8402,
    name: 'Bandra West',
    city: 'Mumbai'
  });
  const [gpsPermission, setGpsPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // Calculates Distance between coordinates in kilometers (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  };

  // Sync Vets, NGOs and distances dynamically when user location shifts
  useEffect(() => {
    let active = true;

    async function loadDynamicServices() {
      try {
        const fetchedVets = await findNearbyVets(userLocation.latitude, userLocation.longitude);
        const fetchedNGOs = await fetchNearbyNGOs(userLocation.latitude, userLocation.longitude, userLocation.city);
        
        if (active) {
          setVets(fetchedVets);
          setNgos(fetchedNGOs);
        }
      } catch (err) {
        console.error('Failed to load dynamic nearby services:', err);
      }
    }

    loadDynamicServices();

    // Update Cases distances
    setCases(prev => prev.map(c => {
      const dist = calculateDistance(userLocation.latitude, userLocation.longitude, c.latitude, c.longitude);
      return { ...c, distance: `${dist}` };
    }));
  }, [userLocation]);

  // Request browser Geo-GPS permission or fallback to elegant simulation
  const requestGpsPermission = async () => {
    if (!navigator.geolocation) {
      setGpsPermission('denied');
      addNotification('GPS Sensor Unavailable', 'Device does not support physical geolocation. Switched to high precision local database lookup.', 'Info');
      return;
    }

    try {
      setGpsPermission('granted');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Identify closest locality in our INDIAN_LOCALITIES list
          const { latitude, longitude } = position.coords;
          let closestLoc = INDIAN_LOCALITIES[0];
          let minDist = Infinity;
          
          INDIAN_LOCALITIES.forEach(loc => {
            const d = Math.sqrt(Math.pow(loc.latitude - latitude, 2) + Math.pow(loc.longitude - longitude, 2));
            if (d < minDist) {
              minDist = d;
              closestLoc = loc;
            }
          });

          setUserLocation({
            latitude,
            longitude,
            name: `${closestLoc.name} (My Device)`,
            city: closestLoc.city
          });

          addNotification(
            'GPS Track Locked Successfully', 
            `Recognized location at Lat ${latitude.toFixed(4)}, Long ${longitude.toFixed(4)} nearby ${closestLoc.name}, ${closestLoc.city}`, 
            'Success'
          );
        },
        (error) => {
          console.error('GPS permission failed, using simulation', error);
          setGpsPermission('denied');
          addNotification('GPS Signal Timeout', 'Permission denied or search timed out. Using high-fidelity satellite coordinates fallback.', 'Urgent');
        }
      );
    } catch (e) {
      setGpsPermission('denied');
    }
  };

  const updateUserLocationDirectlyByLocality = (localityName: string) => {
    const locObj = INDIAN_LOCALITIES.find(l => l.name === localityName);
    if (locObj) {
      setUserLocation({
        latitude: locObj.latitude,
        longitude: locObj.longitude,
        name: locObj.name,
        city: locObj.city
      });
      addNotification(
        'Overwatch Base Altered',
        `Centering operations around ${locObj.name}, ${locObj.city}. Fetching local animal shelters.`,
        'Info'
      );
    }
  };

  const addNotification = (title: string, message: string, category: 'Urgent' | 'Success' | 'Info') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      category,
      time: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    
    // De-queue all and insert to live state database
    setCases(prev => {
      const syncedCases = offlineQueue.map(c => ({
        ...c,
        timeAgo: 'Just sync'
      }));
      return [...syncedCases, ...prev];
    });

    addNotification(
      'Standalone Buffers Synchronized',
      `Restored link. Successfully uploaded ${offlineQueue.length} queued rescue cases to central medical base.`,
      'Success'
    );
    setOfflineQueue([]);
    
    // Increments dashboard totals
    setStats(prev => ({
      ...prev,
      casesTodayCount: prev.casesTodayCount + offlineQueue.length,
    }));
  };

  useEffect(() => {
    if (!isOffline) {
      syncOfflineQueue();
    } else {
      addNotification(
        'Cellular Survival Active',
        'Offline fallback enabled. All dispatch alerts queued inside sandboxed local stage.',
        'Urgent'
      );
    }
  }, [isOffline]);

  // Report a new rescue case (with full AI vision triage simulation, offline queueing, Indian locations)
  const reportNewRescueCase = async (input: Partial<RescueCase> & { 
    animalName: string; 
    species: any; 
    breed: string; 
    type: any; 
    locationText: string; 
    reporterName: string; 
    reporterContact: string; 
    isAnonymous: boolean; 
    audioUrl?: string; 
    image?: string;
    isImmediateSos?: boolean;
    diagnosticsAI?: string;
    severityAI?: 'Critical' | 'Observation' | 'Stable';
  }): Promise<RescueCase> => {

    const generatedId = `case-${Math.floor(100 + Math.random() * 900)}`;
    const timeline: CaseUpdate[] = [
      {
        id: `timeline-${Date.now()}-1`,
        caseId: generatedId,
        status: 'Reported',
        title: 'Rescue Application Processed',
        description: `Citizen emergency logged by ${input.isAnonymous ? 'Anonymous' : input.reporterName}. Details parsed: Sighted "${input.animalName || 'Street animal'}" at ${input.locationText || userLocation.name}.`,
        timestamp: 'Just now',
        authorName: input.reporterName || 'Citizen'
      }
    ];

    // Determine priority
    const priorityCode: 'Critical' | 'High' | 'Standard' = 
      input.isImmediateSos || input.severityAI === 'Critical' ? 'Critical' : (input.type === 'Emergency Vet Need' ? 'High' : 'Standard');

    let initialStatus: RescueCase['status'] = 'Reported';

    const newCase: RescueCase = {
      id: generatedId,
      animalProfile: {
        id: `animal-${Date.now()}`,
        name: input.animalName || 'Unnamed Stray',
        species: input.species || 'Dog',
        breed: input.breed || 'Indie Mix',
        age: 'Sighted Stray',
        gender: 'Unknown',
        image: input.image || 'https://images.unsplash.com/photo-1543509615-fd39d21e1bc9?auto=format&fit=crop&q=80&w=300',
        distinguishingFeatures: `Reported location details: ${input.locationText || 'Roadside area'}`
      },
      type: input.type || 'Injured Stray',
      location: input.locationText || `${userLocation.name}, ${userLocation.city}`,
      region: userLocation.name,
      distance: '0.1 km away', // nearby reported
      timeAgo: 'Just now',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      reporterName: input.reporterName || 'Citizen Rescuer',
      reporterContact: input.reporterContact || '+91 99999 99999',
      isAnonymous: !!input.isAnonymous,
      status: initialStatus,
      priority: priorityCode,
      timeline,
      medicalRecord: input.diagnosticsAI ? {
        id: `med-auto-${Date.now()}`,
        caseId: generatedId,
        diagnostics: input.diagnosticsAI,
        severity: input.severityAI || 'Observation',
        vitals: { heartRate: 110, activity: 'Low' },
        treatmentPlan: 'Keep animal dynamic, avoid force feeding, wait for expert ambulance dispatcher to stabilize.',
        prescription: ['Clean water wash', 'Calm isolation rest'],
        vetId: 'vet-auto',
        createdAt: 'Just now'
      } : undefined
    };

    if (isOffline) {
      setOfflineQueue(prev => [...prev, newCase]);
      addNotification(
        'Offline Report Suspended',
        `Sighted ${newCase.animalProfile.name} on local disk buffer. Will auto-post to server once connectivity returns.`,
        'Urgent'
      );
    } else {
      setCases(prev => [newCase, ...prev]);
      addNotification(
        'Critical Dispatch Sentry',
        `Incident ${generatedId} (${newCase.animalProfile.name} - ${newCase.type}) logged safely. Dispatches notifying nearest NGOs!`,
        'Urgent'
      );
      
      // Dynamic State updates: increments statistics metrics
      setStats(prev => ({
        ...prev,
        casesTodayCount: prev.casesTodayCount + 1,
        pendingEmergencyAppeals: prev.pendingEmergencyAppeals + 1
      }));
    }

    return newCase;
  };

  const assignResponderToCase = (caseId: string, volunteerId: string) => {
    const vol = volunteers.find(v => v.id === volunteerId);
    if (!vol) return;

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const update: CaseUpdate = {
          id: `timeline-${Date.now()}`,
          caseId,
          status: 'Assigned',
          title: `Field Responder Dispatched`,
          description: `Active community volunteer ${vol.name} accepted. Driving emergency response equipment. Contact info: ${vol.contact}`,
          timestamp: 'Just now',
          authorName: 'Dispatcher Center'
        };
        return {
          ...c,
          status: 'Rescue in Progress',
          assignedResponderId: volunteerId,
          timeline: [...c.timeline, update]
        };
      }
      return c;
    }));

    addNotification(
      'Ambulance Responder Armed',
      `${vol.name} assigned as lead supervisor for rescue case ${caseId}.`,
      'Success'
    );
  };

  const assignNgoToCase = (caseId: string, ngoId: string) => {
    const ngo = ngos.find(n => n.id === ngoId);
    if (!ngo) return;

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const update: CaseUpdate = {
          id: `timeline-${Date.now()}`,
          caseId,
          status: 'Assigned',
          title: `Coordinated by ${ngo.name}`,
          description: `Supervised intake processing and sheltering support centered in ${ngo.city}.`,
          timestamp: 'Just now',
          authorName: 'NGO Coordinator'
        };
        return {
          ...c,
          assignedNgoId: ngoId,
          timeline: [...c.timeline, update]
        };
      }
      return c;
    }));

    addNotification(
      'Shelter Node Connected',
      `${ngo.name} scheduled intake accommodation slot for case ${caseId}.`,
      'Info'
    );
  };

  const assignFosterToCase = (caseId: string, fosterId: string) => {
    const foster = fosters.find(f => f.id === fosterId);
    if (!foster) return;

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const update: CaseUpdate = {
          id: `timeline-${Date.now()}`,
          caseId,
          status: 'Foster Care',
          title: 'Sheltered with Community Foster Home',
          description: `Safely nested with host ${foster.hostName} in ${foster.location}. Post-op healing initiated.`,
          timestamp: 'Just now',
          authorName: 'Foster Support Node'
        };
        return {
          ...c,
          status: 'Foster Care',
          assignedFosterId: fosterId,
          timeline: [...c.timeline, update]
        };
      }
      return c;
    }));

    addNotification(
      'Family Hearth Armed',
      `Transferred patient to ${foster.hostName}'s recuperation quarters.`,
      'Success'
    );
  };

  const addCaseTimelineEvent = (caseId: string, status: string, title: string, desc: string, author: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const update: CaseUpdate = {
          id: `timeline-${Date.now()}`,
          caseId,
          status: status,
          title,
          description: desc,
          timestamp: 'Just now',
          authorName: author
        };
        return {
          ...c,
          status: status as any,
          timeline: [...c.timeline, update]
        };
      }
      return c;
    }));
  };

  const addVetMedicalRecord = (caseId: string, diagnostics: string, severity: 'Critical' | 'Observation' | 'Stable', prescription: string[], vetId: string) => {
    const vet = vets.find(v => v.id === vetId);
    
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const record: MedicalRecord = {
          id: `med-${Date.now()}`,
          caseId,
          diagnostics,
          severity,
          vitals: { heartRate: 110, activity: 'Low' },
          treatmentPlan: `Admitted for observation by ${vet?.name || 'Veterinarian'}. Regular fluid support, surgical cleansing.`,
          prescription,
          vetId,
          createdAt: 'Just now'
        };
        
        const update: CaseUpdate = {
          id: `timeline-${Date.now()}`,
          caseId,
          status: 'Veterinary Care',
          title: 'Emergency Medical Summary Logged',
          description: `Stray admitted to surgical critical. Diagnosis: ${diagnostics}. Prescribed meds: ${prescription.join(', ')}. Signed by Dr. ${vet?.name || 'Clinic'}`,
          timestamp: 'Just now',
          authorName: vet?.name || 'Veterinarian'
        };

        return {
          ...c,
          status: 'Veterinary Care',
          assignedVetId: vetId,
          medicalRecord: record,
          timeline: [...c.timeline, update]
        };
      }
      return c;
    }));

    addNotification(
      'Medical Ledger Sealed',
      `Dr. ${vet?.name || 'Vet'} diagnosed patient and posted medication dosages.`,
      'Success'
    );
  };

  const resolveCase = (caseId: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const update: CaseUpdate = {
          id: `timeline-${Date.now()}`,
          caseId,
          status: 'Resolved',
          title: 'Rescue Case Successfully Closed',
          description: 'Animal is declared healthy. Wound healing successfully verified. Stray released back to active feed oversight or fully adopted.',
          timestamp: 'Just now',
          authorName: 'NGO Master Representative'
        };
        return {
          ...c,
          status: 'Resolved',
          timeline: [...c.timeline, update]
        };
      }
      return c;
    }));

    addNotification(
      'Operation Finished Successfully',
      `Case ${caseId} is marked fully RESOLVED. Exceptional teamwork!`,
      'Success'
    );

    // Updates dashboard statistics
    setStats(prev => ({
      ...prev,
      livesSavedCount: prev.livesSavedCount + 1,
      pendingEmergencyAppeals: Math.max(0, prev.pendingEmergencyAppeals - 1)
    }));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <RescueContext.Provider value={{
      vets,
      ngos,
      volunteers,
      fosters,
      cases,
      notifications,
      stats,
      isOffline,
      setIsOffline,
      offlineQueue,
      userLocation,
      setUserLocation,
      gpsPermission,
      setGpsPermission,
      requestGpsPermission,
      updateUserLocationDirectlyByLocality,
      reportNewRescueCase,
      assignResponderToCase,
      assignNgoToCase,
      assignFosterToCase,
      addCaseTimelineEvent,
      addVetMedicalRecord,
      resolveCase,
      clearNotification,
      addNotification,
      syncOfflineQueue,
      calculateDistance
    }}>
      {children}
    </RescueContext.Provider>
  );
};

export const useRescue = () => {
  const context = useContext(RescueContext);
  if (context === undefined) {
    throw new Error('useRescue must be used inside a RescueProvider');
  }
  return context;
};
