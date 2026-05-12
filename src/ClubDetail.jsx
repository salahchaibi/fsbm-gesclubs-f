export default function ClubDetail({ club, onBack }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
        <span className="text-gray-400">Photo de couverture</span>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 flex gap-8">
        {/* Left */}
        <div className="flex-1">
          <button onClick={onBack} className="text-blue-600 text-sm mb-4">← Retour</button>
          <h1 className="text-2xl font-bold">{club.nom}</h1>
          <p className="text-gray-500 mt-2">{club.description}</p>

          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">Recent Events</h2>
            {[
              { titre: "Campus Pitch Night", date: "Apr 1 • 6:00 PM", lieu: "Main Lecture Hall" },
              { titre: "Lean Canvas Workshop", date: "Apr 2 • 2:00 PM", lieu: "Innovation Lab" },
              { titre: "Founders Networking Evening", date: "Apr 18 • 7:00 PM", lieu: "Student Center" },
            ].map((event, i) => (
              <div key={i} className="flex gap-4 mb-4 border-b pb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  📅
                </div>
                <div>
                  <div className="font-medium">{event.titre}</div>
                  <div className="text-gray-400 text-sm">{event.date} • {event.lieu}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="w-64">
          <div className="border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-2">Join Club</h2>
            <p className="text-gray-400 text-sm mb-4">
              Become a member to get event updates and exclusive resources.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
              Join Club
            </button>
          </div>

          <div className="mt-6">
            <h2 className="font-bold mb-4">Club Leaders</h2>
            {[
              { nom: "Maya Patel", role: "President" },
              { nom: "Daniel Kim", role: "VP Events" },
            ].map((leader, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div>
                  <div className="font-medium text-sm">{leader.nom}</div>
                  <div className="text-gray-400 text-xs">{leader.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}