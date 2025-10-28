import React, { useEffect, useState } from "react";
import { GiMagicGate, GiMagicSwirl, GiSpellBook, GiCrystalWand } from "react-icons/gi";
import "./App.css";


function getSchoolIcon(school) {
  switch (school) {
    case "Evocation": return <GiMagicSwirl />;
    case "Illusion": return <GiMagicGate />;
    case "Divination": return <GiSpellBook />;
    case "Conjuration": return <GiCrystalWand />;
    default: return "✨";
  }
}

function App() {
  const [spells, setSpells] = useState([]);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpells = async () => {
      try {
        const res = await fetch("https://www.dnd5eapi.co/api/spells");
        const data = await res.json();

        const randomized = data.results.sort(() => 0.5 - Math.random()).slice(0, 50);

        const details = await Promise.all(
          randomized.map(async (spell) => {
            const detailRes = await fetch(`https://www.dnd5eapi.co${spell.url}`);
            const detailData = await detailRes.json();
            return detailData.classes.some(c => c.name === "Wizard") ? detailData : null;
          })
        );

        const wizardSpells = details.filter(Boolean).slice(0, 10);
        setSpells(wizardSpells);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchSpells();
  }, []);

  const filtered = spells
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => {
      if (filterLevel === "cantrip") return s.level === 0;
      if (filterLevel === "low") return s.level >= 1 && s.level <= 2;
      if (filterLevel === "mid") return s.level >= 3 && s.level <= 5;
      if (filterLevel === "high") return s.level >= 6;
      return true;
    });

  const total = spells.length;
  const shown = filtered.length;
  const avgLevel = spells.length > 0
    ? (spells.reduce((sum, s) => sum + s.level, 0) / spells.length).toFixed(1)
    : 0;

  if (loading) return <div className="loading">Loading wizard spells...</div>;

  return (
    <div className="app-container">
      <div className="sidebar glass">
        <h2>Wizard SpellDash</h2>
        <a href="#">Dashboard</a>
        <a href="#">Search</a>
        <a href="#">About</a>
      </div>

      <div className="dashboard">
        <div className="card-row">
          <div className="card glass">
            <h3>Total Spells</h3>
            <p>{total}</p>
          </div>
          <div className="card glass">
            <h3>Visible</h3>
            <p>{shown}</p>
          </div>
          <div className="card glass">
            <h3>Average Level</h3>
            <p>{avgLevel}</p>
          </div>
        </div>

        <div className="glass controls">
          <input
            type="text"
            placeholder="Search spells..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="cantrip">Cantrips (0)</option>
            <option value="low">Low (1–2)</option>
            <option value="mid">Mid (3–5)</option>
            <option value="high">High (6+)</option>
          </select>
        </div>

        <div className="glass table-container">
          <h3>Wizard Spell Details</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Level</th>
                <th>School</th>
                <th>Casting Time</th>
                <th>Range</th>
                <th>Duration</th>
                <th>Concentration</th>
                <th>Ritual</th>
                <th>Attack Type</th>
                <th>Components</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.index}>
                  <td>{i + 1}</td>
                  <td>{getSchoolIcon(s.school?.name)} {s.name}</td>
                  <td>{s.level}</td>
                  <td>{s.school?.name || "—"}</td>
                  <td>{s.casting_time}</td>
                  <td>{s.range}</td>
                  <td>{s.duration}</td>
                  <td>{s.concentration ? "Yes" : "No"}</td>
                  <td>{s.ritual ? "Yes" : "No"}</td>
                  <td>{s.attack_type || "—"}</td>
                  <td>{s.components?.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;