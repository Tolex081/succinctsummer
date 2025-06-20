import React, { useState } from 'react';
// import pinkTemplate1 from '../assets/pink-template-1.jpg';
// import pinkTemplate2 from '../assets/pink-template-2.jpg';
import blueTemplate1 from '../assets/blue-template1.jpg';
import blueTemplate2 from '../assets/blue-template2.jpg';
// import purpleTemplate1 from '../assets/purple-template-1.jpg';
// import purpleTemplate2 from '../assets/purple-template-2.jpg';
// import orangeTemplate1 from '../assets/orange-template-1.jpg';
// import orangeTemplate2 from '../assets/orange-template-2.jpg';
// import greenTemplate1 from '../assets/green-template-1.jpg';
// import greenTemplate2 from '../assets/green-template-2.jpg';

const templates = [
  // {
  //   team: 'Pink',
  //   templates: [
  //     { id: 'pink-1', src: pinkTemplate1, name: 'Pink Template 1' },
  //     { id: 'pink-2', src: pinkTemplate2, name: 'Pink Template 2' },
  //   ],
  // },
  {
    team: 'Blue',
    templates: [
      { id: 'blue-1', src: blueTemplate1, name: 'Blue Template 1' },
      { id: 'blue-2', src: blueTemplate2, name: 'Blue Template 2' },
    ],
  },
  // {
  //   team: 'Purple',
  //   templates: [
  //     { id: 'purple-1', src: purpleTemplate1, name: 'Purple Template 1' },
  //     { id: 'purple-2', src: purpleTemplate2, name: 'Purple Template 2' },
  //   ],
  // },
  // {
  //   team: 'Orange',
  //   templates: [
  //     { id: 'orange-1', src: orangeTemplate1, name: 'Orange Template 1' },
  //     { id: 'orange-2', src: orangeTemplate2, name: 'Orange Template 2' },
  //   ],
  // },
  // {
  //   team: 'Green',
  //   templates: [
  //     { id: 'green-1', src: greenTemplate1, name: 'Green Template 1' },
  //     { id: 'green-2', src: greenTemplate2, name: 'Green Template 2' },
  //   ],
  // },
];

function TemplateSelector({ setSelectedTemplate }) {
  const [selectedTeam, setSelectedTeam] = useState(templates[0].team); // Default to Pink

  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
    setSelectedTemplate(null); // Reset template on team change
  };

  const teamTemplates = templates.find((t) => t.team === selectedTeam)?.templates || [];

  return (
    <div className="template-selector">
      <h2>Select a Team Template</h2>
      <div className="team-selector">
        <label htmlFor="team-select" className="team-label">
          Choose Team:
        </label>
        <select
          id="team-select"
          value={selectedTeam}
          onChange={handleTeamChange}
          className="team-dropdown"
          aria-label="Select team color"
        >
          {templates.map((team) => (
            <option key={team.team} value={team.team}>
              {team.team}
            </option>
          ))}
        </select>
      </div>
      <div className="template-grid">
        {teamTemplates.length > 0 ? (
          teamTemplates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => setSelectedTemplate(template)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedTemplate(template)}
              aria-label={`Select ${template.name}`}
            >
              <img src={template.src} alt={template.name} />
              <p>{template.name}</p>
            </div>
          ))
        ) : (
          <p>No templates available for this team.</p>
        )}
      </div>
    </div>
  );
}

export default TemplateSelector;