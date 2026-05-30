"""
Compawss AI Knowledge Base
Curated animal rescue and first aid guidance for India context
"""

ANIMAL_RESCUE_KNOWLEDGE = {
    "dog_bleeding": {
        "intent": "first_aid",
        "keywords": ["dog", "bleeding", "blood", "wound", "cut", "injury"],
        "guidance": """
**Immediate Steps for Dog Bleeding:**
1. Stay calm - dogs sense panic
2. Apply direct pressure with clean cloth/gauze for 5-10 minutes
3. Do NOT remove cloth if blood soaks through - add more layers
4. Elevate wound above heart if possible
5. For severe bleeding: apply pressure to nearest pressure point

**When to Rush to Vet:**
- Bleeding doesn't stop after 10 minutes of pressure
- Deep wounds or visible bone/tissue
- Bleeding from nose, mouth, or ears
- Animal is in shock (pale gums, rapid breathing)

**What NOT to Do:**
- Don't use hydrogen peroxide on deep wounds
- Don't apply tourniquets unless life-threatening
- Don't let dog lick wound excessively
        """,
        "emergency_level": "high"
    },
    
    "cat_bleeding": {
        "intent": "first_aid",
        "keywords": ["cat", "bleeding", "blood", "wound", "cut", "injury"],
        "guidance": """
**Immediate Steps for Cat Bleeding:**
1. Approach calmly - injured cats may scratch
2. Wrap cat gently in towel if aggressive
3. Apply direct pressure with clean cloth for 5-10 minutes
4. Keep cat still and warm
5. Do NOT remove initial cloth - layer more if needed

**When to Rush to Vet:**
- Bleeding continues after 10 minutes
- Bite wounds (high infection risk)
- Bleeding from eyes, ears, nose, or mouth
- Cat is lethargic or not responding

**What NOT to Do:**
- Don't chase if cat runs away
- Don't use human medications
- Don't ignore small puncture wounds (can abscess)
        """,
        "emergency_level": "high"
    },
    
    "dehydration": {
        "intent": "first_aid",
        "keywords": ["dehydrated", "dehydration", "thirsty", "heat", "summer", "water"],
        "guidance": """
**Signs of Dehydration in Animals:**
- Dry gums and nose
- Sunken eyes
- Loss of skin elasticity (skin doesn't snap back)
- Lethargy or weakness
- Panting excessively

**Immediate Steps:**
1. Move animal to cool, shaded area
2. Offer small amounts of clean water frequently
3. Do NOT force water down throat
4. Wet paws and ears with cool (not cold) water
5. For strays: use shallow bowl, let them drink at own pace

**When to Call Vet:**
- Animal refuses water for 6+ hours
- Vomiting or diarrhea present
- Extreme lethargy or collapse
- Seizures or disorientation

**Prevention (India Summer):**
- Always provide shade and fresh water
- Avoid midday walks in summer
- Watch for heat exhaustion signs
        """,
        "emergency_level": "medium"
    },
    
    "fracture_limping": {
        "intent": "first_aid",
        "keywords": ["fracture", "broken", "limping", "leg", "paw", "can't walk", "injured leg"],
        "guidance": """
**Signs of Possible Fracture:**
- Not putting weight on limb
- Limb at odd angle
- Swelling or bruising
- Crying when touched
- Bone visible through skin (open fracture)

**Immediate Steps:**
1. Do NOT try to set or straighten the bone
2. Minimize movement - keep animal still
3. For transport: use flat board or sturdy cardboard
4. Support injured limb gently with towel/cloth
5. Get to vet immediately

**For Limping (No Obvious Break):**
1. Check paw for thorns, glass, or cuts
2. Gently feel for swelling or heat
3. Rest animal for 24 hours
4. If limping continues, see vet

**What NOT to Do:**
- Don't apply ice directly to skin
- Don't give human painkillers
- Don't force animal to walk
        """,
        "emergency_level": "high"
    },
    
    "newborn_abandoned": {
        "intent": "pet_care",
        "keywords": ["newborn", "puppy", "kitten", "abandoned", "orphan", "baby animal"],
        "guidance": """
**Newborn/Abandoned Animal Care:**

**First 24 Hours:**
1. Keep warm (use heating pad on LOW or warm water bottle wrapped in towel)
2. Do NOT feed cow's milk - causes diarrhea
3. Get puppy/kitten milk replacer from vet/pet store
4. Feed every 2-3 hours with bottle or syringe

**Feeding Guidelines:**
- Newborns: 2-3 hours
- 2-3 weeks: every 4 hours
- 4+ weeks: every 6 hours + start soft food

**Stimulation:**
- Gently rub belly and genital area with warm damp cloth after feeding
- This helps them urinate/defecate (mother normally licks)

**When to Call Vet/NGO:**
- Animal is cold to touch
- Not feeding for 6+ hours
- Diarrhea or vomiting
- Difficulty breathing
- Crying constantly

**India Context:**
- Contact local animal NGO for foster care
- Many NGOs provide milk replacer and guidance
        """,
        "emergency_level": "high"
    },
    
    "aggressive_scared": {
        "intent": "emergency_rescue",
        "keywords": ["aggressive", "scared", "biting", "growling", "attacking", "dangerous"],
        "guidance": """
**Handling Aggressive/Scared Animals:**

**Safety First:**
1. Do NOT approach if animal is growling, showing teeth, or cornered
2. Give animal space and escape route
3. Avoid direct eye contact (seen as threat)
4. Move slowly and speak softly
5. Never turn your back or run

**For Rescue:**
1. Call local animal control or NGO
2. If must handle: use thick blanket/towel to cover animal
3. Wear thick gloves if available
4. Use carrier or box with air holes
5. Keep children and other animals away

**Scared Stray Dogs:**
- Crouch down to appear less threatening
- Offer food from distance
- Let dog approach you
- Don't reach over head (threatening gesture)

**When to Call Professionals:**
- Animal is rabid or suspected rabid
- Large aggressive dog
- Animal is injured and aggressive
- You feel unsafe

**India Context:**
- Many strays are scared, not aggressive
- Rabies is concern - avoid bites at all costs
- Local NGOs have trained handlers
        """,
        "emergency_level": "high"
    },
    
    "transport_safety": {
        "intent": "emergency_rescue",
        "keywords": ["transport", "carry", "move", "take to vet", "vehicle"],
        "guidance": """
**Safe Animal Transport:**

**For Injured Animals:**
1. Use carrier, box, or flat board
2. Support head and spine
3. Cover with blanket to keep warm and calm
4. Minimize movement during transport
5. Have someone hold carrier steady in vehicle

**For Conscious Animals:**
1. Use proper pet carrier if available
2. Cardboard box with air holes works for small animals
3. Secure carrier with seatbelt
4. Never let animal loose in moving vehicle
5. Keep windows mostly closed

**For Unconscious/Severely Injured:**
1. Slide flat board under animal
2. Secure with cloth strips (not tight)
3. Keep head slightly elevated
4. Monitor breathing during transport
5. Drive carefully - avoid sudden stops

**What NOT to Do:**
- Don't transport in open truck bed
- Don't let animal sit on lap while driving
- Don't use plastic bags (suffocation risk)
- Don't delay transport for non-essential care

**India Context:**
- Auto-rickshaws: secure carrier on floor
- Two-wheelers: NOT safe for injured animals
- Call NGO if no safe transport available
        """,
        "emergency_level": "medium"
    },
    
    "when_call_vet": {
        "intent": "emergency_rescue",
        "keywords": ["emergency", "vet", "urgent", "serious", "critical"],
        "guidance": """
**Call Vet/NGO Immediately If:**

**Breathing Issues:**
- Difficulty breathing or gasping
- Blue/pale gums or tongue
- Choking or coughing blood

**Trauma:**
- Hit by vehicle
- Fall from height
- Dog fight injuries
- Open fractures (bone visible)

**Bleeding:**
- Uncontrolled bleeding after 10 minutes
- Bleeding from nose, mouth, ears, or eyes
- Blood in urine or stool

**Neurological:**
- Seizures
- Unconsciousness
- Disorientation or circling
- Sudden blindness

**Poisoning:**
- Vomiting or diarrhea with blood
- Excessive drooling
- Tremors or seizures
- Known toxin ingestion

**Other Emergencies:**
- Bloated, hard abdomen (especially large dogs)
- Straining to urinate
- Heatstroke (panting, drooling, collapse)
- Suspected rabies exposure

**India Emergency Numbers:**
- Local animal NGO helpline
- 24-hour emergency vet clinics
- Blue Cross, PFA, or local rescue groups
        """,
        "emergency_level": "critical"
    },
    
    "what_not_to_do": {
        "intent": "general_question",
        "keywords": ["don't", "avoid", "never", "wrong", "mistake"],
        "guidance": """
**Common Mistakes to AVOID:**

**Feeding:**
- Never give cow's milk to puppies/kittens
- No chocolate, grapes, onions, garlic to dogs
- No bones that can splinter (chicken, fish)
- Don't feed spicy or heavily seasoned food

**Medical:**
- Never give human medications without vet approval
- Don't use hydrogen peroxide on deep wounds
- Don't apply ice directly to skin
- Don't try to set broken bones yourself

**Handling:**
- Don't approach rabid or suspected rabid animals
- Don't corner scared animals
- Don't pull on injured limbs
- Don't force-feed or force-water

**Rescue:**
- Don't delay vet visit for serious injuries
- Don't transport injured animals unsecured
- Don't ignore bite wounds (infection risk)
- Don't assume stray = aggressive

**India-Specific:**
- Don't ignore rabies risk - get PEP if bitten
- Don't abandon injured animals
- Don't use local "remedies" for serious injuries
- Don't assume all vets are 24/7 - know emergency clinics
        """,
        "emergency_level": "low"
    },
    
    "india_stray_context": {
        "intent": "general_question",
        "keywords": ["stray", "street dog", "street cat", "India", "community"],
        "guidance": """
**Stray Animals in India:**

**Understanding Strays:**
- Most are community animals, not feral
- Often fed by local residents
- May be territorial but usually not aggressive
- Many are vaccinated by NGOs (ear notch = vaccinated)

**How to Help:**
1. Provide water bowls (especially summer)
2. Feed regularly if possible
3. Report injured animals to NGOs
4. Support ABC (Animal Birth Control) programs
5. Don't relocate - illegal and harmful

**Safety Tips:**
- Don't disturb feeding or sleeping dogs
- Avoid mother dogs with puppies
- Don't run or make sudden movements
- Carry stick for protection, not to hit

**Rabies Awareness:**
- India has high rabies cases
- Get vaccinated if working with animals
- Report suspected rabid animals immediately
- Get PEP (Post-Exposure Prophylaxis) if bitten

**NGO Support:**
- Most cities have animal welfare NGOs
- They provide: rescue, treatment, ABC, adoption
- Many have 24/7 helplines
- Support through donations or volunteering

**Legal Rights:**
- Feeding strays is legal (2015 ruling)
- Harming animals is punishable
- Strays have right to live in their territory
        """,
        "emergency_level": "low"
    }
}

def get_knowledge_by_keywords(query: str) -> list:
    """
    Retrieve relevant knowledge entries based on query keywords
    """
    query_lower = query.lower()
    matches = []
    
    for key, entry in ANIMAL_RESCUE_KNOWLEDGE.items():
        # Check if any keyword matches
        for keyword in entry["keywords"]:
            if keyword in query_lower:
                matches.append({
                    "id": key,
                    "intent": entry["intent"],
                    "guidance": entry["guidance"],
                    "emergency_level": entry["emergency_level"],
                    "keywords": entry["keywords"]
                })
                break
    
    return matches

def get_knowledge_by_intent(intent: str) -> list:
    """
    Retrieve all knowledge entries for a specific intent
    """
    return [
        {
            "id": key,
            "intent": entry["intent"],
            "guidance": entry["guidance"],
            "emergency_level": entry["emergency_level"],
            "keywords": entry["keywords"]
        }
        for key, entry in ANIMAL_RESCUE_KNOWLEDGE.items()
        if entry["intent"] == intent
    ]

def classify_intent(query: str) -> str:
    """
    Classify user query intent
    """
    query_lower = query.lower()
    
    # Check for veterinary/clinic queries with location
    # Matches: "vets in mumbai", "vet near me", "animal hospital kolkata", etc.
    vet_keywords = ["vet", "veterinary", "animal hospital", "pet hospital", "animal clinic", "pet clinic", "animal doctor"]
    location_keywords = ["in", "at", "near", "nearby", "closest", "nearest", "around", "location", "address", "contact"]
    
    has_vet = any(word in query_lower for word in vet_keywords)
    has_location = any(word in query_lower for word in location_keywords)
    
    if has_vet and has_location:
        return "nearby_vet"
    
    # Check for NGO/shelter queries with location
    ngo_keywords = ["ngo", "shelter", "rescue center", "rescue organization", "animal welfare", "animal rescue"]
    if any(word in query_lower for word in ngo_keywords) and has_location:
        return "nearby_ngo"
    
    # Emergency queries (even without explicit location)
    if any(word in query_lower for word in ["emergency", "urgent", "critical", "dying", "serious"]):
        # If it mentions vet/hospital, it's an emergency vet query
        if has_vet:
            return "emergency_rescue"
        return "emergency_rescue"
    
    # First aid queries
    if any(word in query_lower for word in ["bleeding", "blood", "wound", "injury", "hurt", "pain", "broken", "fracture"]):
        return "first_aid"
    
    # Pet care queries
    if any(word in query_lower for word in ["feed", "food", "care", "newborn", "puppy", "kitten", "baby animal"]):
        return "pet_care"
    
    # Image analysis queries
    if any(word in query_lower for word in ["image", "photo", "picture", "scan", "analyze", "identify"]):
        return "image_analysis"
    
    # Report/help queries
    if any(word in query_lower for word in ["report", "found", "help", "rescue", "spotted", "saw"]):
        return "report_help"
    
    # Default
    return "general_question"

# Made with Bob
