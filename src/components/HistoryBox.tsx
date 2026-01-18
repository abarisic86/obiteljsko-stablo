import { useState, useEffect } from "react";

interface Person {
  name: string;
  birth: string | null;
  death: string | null;
  note: string | null;
  biography: string | null;
}

interface Section {
  title: string;
  content: string;
  people: Person[];
}

interface HistoricalData {
  title: string;
  subtitle: string;
  sections: Section[];
}

export default function HistoryBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<HistoricalData | null>(null);

  useEffect(() => {
    fetch("/historical-notes.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load historical notes:", err));
  }, []);

  if (!data) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z"
              clipRule="evenodd"
            />
          </svg>
          Povijest obitelji
        </button>
      ) : (
        <div className="bg-amber-50 border-2 border-amber-700 rounded-lg shadow-2xl max-w-md max-h-[70vh] overflow-hidden flex flex-col">
          <div className="bg-amber-700 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <h2 className="font-bold">{data.title}</h2>
              <p className="text-amber-200 text-sm">{data.subtitle}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-amber-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto p-4 space-y-4">
            {data.sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-amber-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-700 text-sm mb-3">{section.content}</p>
                <div className="space-y-1">
                  {section.people.map((person, pidx) => (
                    <div
                      key={pidx}
                      className="bg-white rounded px-3 py-2 text-sm border border-amber-200"
                    >
                      <div>
                        <span className="font-medium text-amber-900">
                          {person.name}
                        </span>
                        <span className="text-gray-600 ml-2">
                          {person.birth && person.death
                            ? `(${person.birth} - ${person.death})`
                            : person.death
                            ? `(† ${person.death})`
                            : person.birth
                            ? `(${person.birth})`
                            : ""}
                        </span>
                        {person.note && (
                          <span className="text-amber-600 ml-2 italic">
                            — {person.note}
                          </span>
                        )}
                      </div>
                      {person.biography && (
                        <p className="text-gray-600 mt-1 pl-2 border-l-2 border-amber-300">
                          {person.biography}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
