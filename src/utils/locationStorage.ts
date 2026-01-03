import { FamilyLocation } from "../types/family";

// JSONBin.io configuration
// Note: You'll need to create a free bin at https://jsonbin.io and replace this with your bin ID
const JSONBIN_BIN_ID = "YOUR_BIN_ID_HERE";
const JSONBIN_API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// For now, we'll use a fallback to localStorage if JSONBin is not configured
const USE_LOCALSTORAGE_FALLBACK =
  !JSONBIN_BIN_ID || JSONBIN_BIN_ID === "YOUR_BIN_ID_HERE";

/**
 * Fetch all family locations from storage
 */
export async function fetchLocations(): Promise<FamilyLocation[]> {
  if (USE_LOCALSTORAGE_FALLBACK) {
    // Fallback to localStorage
    const stored = localStorage.getItem("familyLocations");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored locations:", e);
        return [];
      }
    }
    return [];
  }

  try {
    const response = await fetch(JSONBIN_API_URL + "/latest", {
      method: "GET",
      headers: {
        "X-Master-Key": "$2b$10$YOUR_MASTER_KEY_HERE", // Replace with your master key
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.record || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    // Fallback to localStorage on error
    const stored = localStorage.getItem("familyLocations");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}

/**
 * Save or update a family location
 * If a location with the same label exists, it will be updated
 */
export async function saveLocation(location: FamilyLocation): Promise<void> {
  if (USE_LOCALSTORAGE_FALLBACK) {
    // Fallback to localStorage
    const locations = await fetchLocations();
    const existingIndex = locations.findIndex((loc) => loc.id === location.id);

    if (existingIndex >= 0) {
      locations[existingIndex] = location;
    } else {
      locations.push(location);
    }

    localStorage.setItem("familyLocations", JSON.stringify(locations));
    return;
  }

  try {
    // First, get existing locations
    const locations = await fetchLocations();

    // Update or add the new location
    const existingIndex = locations.findIndex((loc) => loc.id === location.id);
    if (existingIndex >= 0) {
      locations[existingIndex] = location;
    } else {
      locations.push(location);
    }

    // Save back to JSONBin
    const response = await fetch(JSONBIN_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": "$2b$10$YOUR_MASTER_KEY_HERE", // Replace with your master key
      },
      body: JSON.stringify(locations),
    });

    if (!response.ok) {
      throw new Error(`Failed to save location: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error saving location:", error);
    // Fallback to localStorage on error
    const locations = await fetchLocations();
    const existingIndex = locations.findIndex((loc) => loc.id === location.id);

    if (existingIndex >= 0) {
      locations[existingIndex] = location;
    } else {
      locations.push(location);
    }

    localStorage.setItem("familyLocations", JSON.stringify(locations));
  }
}
