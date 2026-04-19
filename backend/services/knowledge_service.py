import json
import os
import time
from pathlib import Path
from services.firestore_service import get_hotel_knowledge as get_firestore_knowledge

# Path to the knowledge JSON file (Fallback only)
KNOWLEDGE_FILE = Path(__file__).parent.parent / "data" / "hotel_knowledge.json"

class KnowledgeService:
    def __init__(self):
        self._cache = {}  # { hotel_id: { data: ..., expires: ... } }
        self._json_cache = {}
        self._last_json_mtime = 0
        self._cache_ttl = 60  # 60 seconds

    def _load_json_fallback(self, hotel_id: str) -> dict | None:
        """Loads from local JSON if file exists and changed."""
        if not KNOWLEDGE_FILE.exists():
            return None
        
        mtime = os.path.getmtime(KNOWLEDGE_FILE)
        if mtime > self._last_json_mtime:
            try:
                with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
                    self._json_cache = json.load(f)
                    self._last_json_mtime = mtime
            except Exception as e:
                print(f"Error loading fallback JSON: {e}")
        return self._json_cache.get(hotel_id)

    async def fetch_hotel_knowledge(self, hotel_id: str) -> dict | None:
        """
        Returns the knowledge object for a specific hotel.
        Prioritizes Firestore, falls back to JSON.
        """
        now = time.time()
        
        # Check cache
        if hotel_id in self._cache:
            entry = self._cache[hotel_id]
            if now < entry["expires"]:
                return entry["data"]

        # 1. Try Firestore
        try:
            # Note: get_firestore_knowledge is 'async def' in firestore_service
            data = await get_firestore_knowledge(hotel_id)
            if data:
                self._cache[hotel_id] = {"data": data, "expires": now + self._cache_ttl}
                return data
        except Exception as e:
            print(f"Firestore knowledge fetch error: {e}")

        # 2. Fallback to local JSON
        json_data = self._load_json_fallback(hotel_id)
        if json_data:
            # We don't cache JSON as heavily as Firestore because it's local
            return json_data

        return None

    async def get_context_for_incident(self, hotel_id: str, incident_type: str) -> str:
        """
        Returns a formatted string containing relevant knowledge for an incident.
        """
        hotel = await self.fetch_hotel_knowledge(hotel_id)
        if not hotel:
            return "No specific hotel knowledge available. Follow general safety standards."

        # Filter protocols based on incident type
        protocol = hotel.get("protocols", {}).get(incident_type.lower(), "Follow general safety protocols.")
        
        # Format equipment mapping
        equipment = hotel.get("equipment_mapping", {})
        eq_text = ""
        if incident_type.lower() == "fire":
            locations = [f"- {e['location']} ({e.get('type', 'Standard')})" for e in equipment.get("extinguishers", [])]
            eq_text = "Fire Extinguisher Locations:\n" + "\n".join(locations)
        elif incident_type.lower() == "medical":
            aeds = [f"- {e['location']} ({e.get('notes', 'No notes')})" for e in equipment.get("aeds", [])]
            kits = [f"- {e['location']} ({e.get('notes', 'No notes')})" for e in equipment.get("firstAidKits", [])]
            eq_text = "Medical Equipment Locations:\n" + "\n".join(aeds + kits)

        # Facility context
        facility = hotel.get("facility_info", {})
        assembly = facility.get("assemblyPoint", "Safe outdoor area")

        context = f"""
SITE-SPECIFIC KNOWLEDGE FOR {hotel.get('hotelName', 'Property')}:

[EMERGENCY PROTOCOL FOR {incident_type.upper()}]:
{protocol}

[VITAL EQUIPMENT]:
{eq_text if eq_text else "Refer to general property maps for equipment."}

[EVACUATION INFO]:
Assembly Point: {assembly}
General Layout: {hotel_id} has {facility.get('totalFloors', 'several')} floors and {len(facility.get('staircases', []))} main staircases.
"""
        return context

# Singleton instance
knowledge_service = KnowledgeService()
