# Runtime Fake Behavior Fixes - Action Plan

## Issues Identified

### 1. RescueCommand.tsx - Fake Predictive Alert
**Location**: Lines 155-170
**Issue**: Shows fake "Sector 7G" drone deployment alert
**Fix**: Remove entire fake alert section or make it conditional on real backend data

### 2. InjuryAnalysis.tsx - Fake Preset Data
**Location**: Lines 85-170
**Issues**:
- Fake preset transcripts auto-fill
- Fake location "Sree Krishna Sweets Corner"
- Fake GPS coordinates "Sector 4, Salt Lake"
- Preset data includes fake stories

**Fix**: 
- Remove auto-fill of transcripts
- Remove fake location defaults
- Make location mandatory with real GPS or manual entry
- Implement real microphone recording

### 3. RescueCommand.tsx - Infinite Fetching
**Location**: Line 197
**Issue**: "Fetching nearest specialized care clinic..." never resolves
**Fix**: Add timeout, error state, and real data fetching

### 4. Chat Assistant - Bloated Responses
**Issue**: AI responses are too verbose with fake tactical jargon
**Fix**: Modify backend prompt or frontend processing to keep responses concise

### 5. Location System
**Issues**:
- No real GPS permission flow
- Fake locations auto-generated
- No manual fallback

**Fix**: Implement navigator.geolocation with proper error handling

## Files to Modify

1. `src/components/screens/RescueCommand.tsx`
   - Remove fake predictive alert
   - Fix infinite fetching state
   - Add timeout and error handling

2. `src/components/screens/InjuryAnalysis.tsx`
   - Remove PRESETS auto-fill behavior
   - Implement real microphone recording
   - Fix GPS permission flow
   - Remove fake location defaults

3. `src/context/ChatContext.tsx`
   - Add system prompt to keep responses concise
   - Filter out bloated responses

4. `src/context/RescueContext.tsx`
   - Implement real GPS permission flow
   - Remove fake location defaults

## Implementation Priority

1. HIGH: Remove fake predictive alert (RescueCommand.tsx)
2. HIGH: Remove preset auto-fill (InjuryAnalysis.tsx)
3. HIGH: Fix infinite fetching (RescueCommand.tsx)
4. MEDIUM: Implement real GPS (RescueContext.tsx)
5. MEDIUM: Implement real microphone (InjuryAnalysis.tsx)
6. MEDIUM: Fix chat verbosity (ChatContext.tsx)
7. LOW: Polish error states

## Testing Plan

After fixes:
1. Map page shows real vets or clear error (not infinite loading)
2. Report page doesn't auto-fill fake data
3. Microphone records real audio
4. GPS permission requested
5. Chat responses are concise
6. No "Sector 7G" or fake alerts appear