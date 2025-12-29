import { useState } from "react";
import FamilyTree from "./components/FamilyTree";
import SearchBar from "./components/SearchBar";
import QuizModal from "./components/QuizModal";
import { useFamilyData } from "./hooks/useFamilyData";
import { Person } from "./types/family";

// Data source: Real family data
const FALLBACK_DATA_URL = "/real-data.csv";

function App() {
  const { tree, people, loading, error } = useFamilyData({
    primaryUrl: null, // Use local test data for now
    fallbackUrl: FALLBACK_DATA_URL,
  });
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [scrollToPersonId, setScrollToPersonId] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const handlePersonSelect = (personId: string | null) => {
    setSelectedPersonId(personId);
    if (personId) {
      setScrollToPersonId(personId);
    }
  };

  const handleScrollComplete = () => {
    setScrollToPersonId(null);
  };

  // Helper functions to find parent and children
  const findParent = (personId: string, people: Person[]): Person | null => {
    const person = people.find((p) => p.id === personId);
    if (!person || !person.parentId) return null;
    return people.find((p) => p.id === person.parentId) || null;
  };

  const findChildren = (personId: string, people: Person[]): Person[] => {
    return people.filter((p) => p.parentId === personId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Učitavanje obiteljskog stabla...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Greška</h2>
          <p className="text-gray-700">{error}</p>
          <p className="text-sm text-gray-500 mt-4">
            Provjerite da je izvor podataka (CSV datoteka ili Google Sheets URL)
            ispravan i dostupan.
          </p>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Nema podataka za prikaz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <div className="absolute top-4 left-0 right-0 z-40">
        <SearchBar people={people} onPersonSelect={handlePersonSelect} />
      </div>
      <FamilyTree
        rootNode={tree}
        people={people}
        selectedPersonId={selectedPersonId}
        onPersonSelect={handlePersonSelect}
        scrollToPersonId={scrollToPersonId}
        onScrollComplete={handleScrollComplete}
        selectedPersonParent={
          selectedPersonId ? findParent(selectedPersonId, people) : null
        }
        selectedPersonChildren={
          selectedPersonId ? findChildren(selectedPersonId, people) : []
        }
        onQuizClick={() => setIsQuizOpen(true)}
      />
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        people={people}
      />
    </div>
  );
}

export default App;
