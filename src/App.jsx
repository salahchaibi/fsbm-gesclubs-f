import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ClubDetail from "./ClubDetail";
import Login from "./Login";
import DashboardAdmin from "./DashboardAdmin";

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
  }, [target, duration]);

  return count;
}

export default function App() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [search, setSearch] = useState("");
  const [utilisateur, setUtilisateur] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const clubsCount = useCountUp(20);
  const studentsCount = useCountUp(500);
  const eventsCount = useCountUp(50);

  useEffect(() => {
    axios.get("http://localhost:8000/api/clubs")
      .then(res => setClubs(res.data))
      .catch(err => console.log(err));
  }, []);

  const clubsFiltres = clubs.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase())
  );

  const clubsAffiches = clubsFiltres.length > 0 ? clubsFiltres : [
    { id: 1, nom: "Robotics Society", description: "Hands-on robotics projects and competitions" },
    { id: 2, nom: "Arts & Open Mic", description: "Creative performances and art shows" },
    { id: 3, nom: "Entrepreneurship Club", description: "Pitch nights and startup mentorship" },
    { id: 4, nom: "Green Campus", description: "Sustainability projects and free planting" },
    { id: 5, nom: "Chemistry Club", description: "Interactive labs and research projects" },
    { id: 6, nom: "Computer Science Society", description: "Hackathons and study groups" },
    { id: 7, nom: "Debate Team", description: "Weekly practice debates and tournaments" },
    { id: 8, nom: "Wellness Circle", description: "Mindfulness, yoga, stress relief" },
  ];

  if (showLogin && !utilisateur) {
    return <Login onLogin={(u) => {
      setUtilisateur(u);
      setShowLogin(false);
    }} />;
  }

  if (utilisateur) {
    if (utilisateur.role === "administrateur" || utilisateur.role === "responsable_vie_estudiantine") {
      return <DashboardAdmin 
        utilisateur={utilisateur} 
        onLogout={() => {
          setUtilisateur(null);
          localStorage.removeItem("token");
          localStorage.removeItem("utilisateur");
        }} 
      />;
    }
    if (utilisateur.role === "responsable_club" || utilisateur.role === "membre_autorise") {
      return <div>Dashboard Club — Bienvenue {utilisateur.nom} !</div>;
    }
  }

  if (selectedClub) {
    return <ClubDetail club={selectedClub} onBack={() => setSelectedClub(null)} />;
  }

  return (
    <div className="min-h-screen bg-white">

      <nav className="flex items-center justify-between px-8 py-1 border-b shadow-sm bg-white">
  {/* Logo + Texte */}
  <div className="flex items-center gap-2">
    <img src="/Logo-FSBM.PNG" alt="Club FSBM" className="h-14" />
    <span className="font-bold text-lg">
    <span className="text-black">CLUB-</span>
    <span className="text-[#6600FF]">FSBM</span>
</span>
  </div>

  {/* Menu */}
  <div className="flex gap-8 text-sm font-medium">
    <a href="#" className="hover:text-[#6600FF]">Home</a>
    <a href="#clubs" className="hover:text-[#6600FF]">Clubs</a>
    <a href="#about" className="hover:text-[#6600FF]">About us</a>
    <a href="#" className="hover:text-[#6600FF]">Join Us</a>
  </div>

  {/* Bouton Login */}
  <button
  onClick={() => setShowLogin(true)}
  className="bg-[#6600FF] text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-800 transition"
  >
  Login
  </button>

</nav>

      {/* Hero */}
      <div className="flex items-center justify-between px-8 py-12 bg-gray-50">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-4">
            Discover the clubs of our university
          </h1>
          <p className="text-gray-500 mb-6">
            Join clubs, participate in events, and develop your skills
          </p>
          <div className="flex items-center gap-4">
            <button className="bg-[#6600FF] text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition">
              Explore Clubs
            </button>
            {/* Rectangle "New semester" */}
            <span className="border-2 border-[#e7def3] text-[#000000] px-4 py-2 rounded-lg text-sm font-medium">
              New semester? Find curated picks for you
            </span>
          </div>

          {/* Stats avec animation */}
          <div className="flex gap-4 mt-8">
            <div className="bg-[#f6f0ff] p-4 rounded-lg shadow-sm border border-[#f6f0ff]">
              <div className="text-[#000000] font-bold text-lg">{clubsCount}+ Clubs</div>
              <div className="text-gray-500 text-xs">Active student organizations across campus</div>
            </div>
            <div className="bg-[#f6f0ff] p-4 rounded-lg shadow-sm border border-[#f6f0ff]">
              <div className="text-[#000000] font-bold text-lg">{studentsCount}+ Students</div>
              <div className="text-gray-500 text-xs">Members engaging in activities and leadership</div>
            </div>
            <div className="bg-[#f6f0ff] p-4 rounded-lg shadow-sm border border-[#f6f0ff]">
              <div className="text-[#000000] font-bold text-lg">{eventsCount}+ Events</div>
              <div className="text-gray-500 text-xs">Workshops, socials, competitions and more</div>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="w-96 h-64 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
          <span className="text-gray-400">Image université</span>
        </div>
      </div>

      {/* Featured Clubs */}
      <div className="px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Clubs</h2>
          <span className="text-gray-400 text-sm">Hand-picked clubs you might like</span>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {clubsAffiches.slice(0, 4).map(club => (
            <div key={club.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="w-full h-36 bg-[#EDE0FF] flex items-center justify-center">
                <span className="text-[#eeeeee] text-sm">📸</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold">{club.nom}</h3>
                <p className="text-gray-400 text-sm mt-1">{club.description}</p>
                <button
                  onClick={() => setSelectedClub(club)}
                  className="mt-3 text-[#6600FF] text-sm font-medium hover:underline"
                >
                  View More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Clubs */}
      <div id="clubs" className="px-8 py-12 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Clubs</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search for a club..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-[#6600FF] px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#6600FF]"
            />
            <button className="bg-[#6600FF] text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-800 transition">
              Search
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {clubsAffiches.map(club => (
            <div key={club.id} className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
              <div className="w-full h-32 bg-[#EDE0FF] flex items-center justify-center">
                <span className="text-[#6600FF] text-sm">📸</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold">{club.nom}</h3>
                <p className="text-gray-400 text-sm mt-1">{club.description}</p>
                <button
                  onClick={() => setSelectedClub(club)}
                  className="mt-3 text-[#6600FF] text-sm font-medium hover:underline"
                >
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* About Us */}
  <div id="about" className="px-8 py-16 bg-white">
  <div className="max-w-6xl mx-auto">

    {/* Hero About */}
    <div className="flex items-center gap-12 mb-12">
      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-4">About Us</h2>
        <p className="text-gray-500 mb-6">
          CLUB-FSBM connects students with campus organizations by making club discovery,
          event coordination, and administrative tools simple and trustworthy. Our platform
          empowers student leaders and members through intuitive club pages, integrated
          event calendars, membership management, and collaborative tools designed
          specifically for university life.
        </p>
        <div className="flex gap-4">
          <button className="bg-[#6600FF] text-white px-6 py-2 rounded-lg hover:bg-purple-800 transition">
            Explore Clubs
          </button>
          <button className="border border-gray-300 px-6 py-2 rounded-lg hover:border-[#6600FF] hover:text-[#6600FF] transition">
            Contact Us
          </button>
        </div>
      </div>
      <div className="w-80 h-56 bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">📸 Photo équipe</span>
      </div>
    </div>

    {/* Our Mission */}
    <div className="bg-[#f6f1fc] rounded-xl p-8 mb-12">
      <h3 className="text-xl font-bold mb-2">Our Mission</h3>
      <p className="text-gray-500 mb-6">
        We help students discover authentic campus experiences and help club leaders run
        vibrant, organized communities. CLUB-FSBM focuses on accessibility, transparency,
        and safety — providing tools for event promotion, membership tracking, secure
        communication, and analytics so clubs can thrive.
      </p>
      <div className="grid grid-cols-3 gap-6">
        {[
          { titre: "Discover", desc: "Find clubs by interest, faculty, or event type with robust search and curated recommendations." },
          { titre: "Organize", desc: "Tools for scheduling, member lists, role permissions, and streamlined event RSVPs." },
          { titre: "Connect", desc: "Enable meaningful connections through messaging, announcements, and collaborative spaces." },
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border">
            <h4 className="font-bold mb-2">{item.titre}</h4>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Our Team */}
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Our Team</h3>
        <span className="text-gray-400 text-sm">Meet the core team building CLUB-FSBM</span>
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
        {[
          
          { nom: "M'LISSA HANIA", role: "" },
          { nom: "DOUAA NAGGOUR", role: "" },
          
        ].map((membre, i) => (
          <div key={i} className="text-center">
            <div className="w-20 h-20 bg-[#EDE0FF] rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
            <div className="font-medium">{membre.nom}</div>
            <div className="text-gray-400 text-sm">{membre.role}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Our Partners */}
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Our Partners</h3>
        <span className="text-gray-400 text-sm">Trusted campus and local partners</span>
      </div>
      <div className="border rounded-xl p-6 flex items-center justify-around">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">Logo {i}</span>
          </div>
        ))}
      </div>
    </div>

  </div>
</div>

      {/* Footer */}
      <footer className="bg-[#fbfbfb] border-t px-8 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
          
          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/Logo-FSBM.PNG" alt="Club FSBM" className="h-8" />
              <span className="font-bold text-sm">
                <span className="text-black">CLUB-</span>
                <span className="text-[#6600FF]">FSBM</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Helping students find belonging and making club management easier for leaders across campuses.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-bold mb-3">Explore</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><a href="#" className="hover:text-[#6600FF]">Home</a></li>
              <li><a href="#clubs" className="hover:text-[#6600FF]">Clubs</a></li>
              <li><a href="#about" className="hover:text-[#6600FF]">About</a></li>
              <li><a href="#" className="hover:text-[#6600FF]">Careers</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-3">Contact</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>support@clubfsbm.edu</li>
              <li>(555) 413-9012</li>
            </ul>
          </div>

        </div>
      </footer>

    </div>
  );
}
