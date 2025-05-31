// import React from "react";
// import "./about.css";

// const timelineData = [
//   {
//     phase: "I",
//     title: "Research & Model Selection",
//     description:
//       "We compared cutting-edge AI models and finalized XTTS for TTS and SadTalker for lip-syncing. The team split into two groups to analyze TTS and lip-sync models. MERN stack was chosen for web development.",
//     contributors: [
//       "Gayathri", "Praneetha", "Sreeshma",
//       "Risheel", "Anushka", "Srithi", "Lavanya",
//     ],
//   },
//   {
//     phase: "II",
//     title: "Model Integration",
//     description:
//       "Integrated both lip-sync and TTS models into a unified backend system for generating synchronized avatar output.",
//     contributors: ["Sreeshma", "Anushka", "Srithi"],
//   },
//   {
//     phase: "III",
//     title: "UI/UX Design",
//     description:
//       "Designed the interface using Figma to structure user interaction and define component layout and behavior.",
//     contributors: ["Lavanya"],
//   },
//   {
//     phase: "IV",
//     title: "Frontend Development",
//     description:
//       "Implemented the designs into code using React.js, ensuring responsiveness and visual consistency.",
//     contributors: ["Praneetha", "Gayathri", "Risheel"],
//   },
//   {
//     phase: "V",
//     title: "Backend Integration",
//     description:
//       "Connected backend APIs with frontend and AI models to enable real-time avatar generation.",
//     contributors: ["Gayathri"],
//   },
// ];

// const TimelineSection = () => {
//   return (
//     <section className="timeline-section">

//       {/* ✅ Timeline Section Title */}
//       <h2 className="timeline-main-heading">Project Timeline</h2>

//       {/* Timeline Phases */}
//       <div className="timeline-container">
//         {timelineData.map((item, index) => (
//           <div
//             className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
//             key={index}
//           >
//             <div className="timeline-content glass-card">
//               <h3 className="timeline-phase">Phase {item.phase}</h3>
//               <h4 className="timeline-title">{item.title}</h4>
//               <p className="timeline-description">{item.description}</p>
//               <div className="timeline-contributors">
//                 {item.contributors.map((c, i) => (
//                   <span key={i} className="contributor">
//                     {c}
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <span className="circle" />
//           </div>
//         ))}
//         <div className="vertical-line" />
//       </div>
//     </section>
//   );
// };

// export default TimelineSection;


import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaBrain,
  FaCogs,
  FaPaintBrush,
  FaLaptopCode,
  FaPlug,
} from "react-icons/fa";
import "./about.css";

const iconMap = {
  I: <FaBrain />,
  II: <FaCogs />,
  III: <FaPaintBrush />,
  IV: <FaLaptopCode />,
  V: <FaPlug />,
};

const timelineData = [
  {
    phase: "I",
    title: "Research & Model Selection",
    description:
      "We compared cutting-edge AI models and finalized XTTS for TTS and SadTalker for lip-syncing. The team split into two groups to analyze TTS and lip-sync models. MERN stack was chosen for web development.",
    contributors: [
      "Gayathri",
      "Praneetha",
      "Sreeshma",
      "Risheel",
      "Anushka",
      "Srithi",
      "Lavanya",
    ],
  },
  {
    phase: "II",
    title: "Model Integration",
    description:
      "Integrated both lip-sync and TTS models into a unified backend system for generating synchronized avatar output.",
    contributors: ["Sreeshma", "Anushka", "Srithi"],
  },
  {
    phase: "III",
    title: "UI/UX Design",
    description:
      "Designed the interface using Figma to structure user interaction and define component layout and behavior.",
    contributors: ["Lavanya"],
  },
  {
    phase: "IV",
    title: "Frontend Development",
    description:
      "Implemented the designs into code using React.js, ensuring responsiveness and visual consistency.",
    contributors: ["Praneetha", "Gayathri", "Risheel"],
  },
  {
    phase: "V",
    title: "Backend Integration",
    description:
      "Connected backend APIs with frontend and AI models to enable real-time avatar generation.",
    contributors: ["Gayathri"],
  },
];

const TimelineSection = () => {
  const [expanded, setExpanded] = useState({});
  const [progress, setProgress] = useState(0);
  const containerDOM = useRef(null);

  // Toggle expand/collapse
  const toggleExpand = (phase) => {
    setExpanded((prev) => ({ ...prev, [phase]: !prev[phase] }));
  };

  // Scroll handler with useCallback to prevent recreation
  const handleScroll = useCallback(() => {
    if (!containerDOM.current) return;

    const rect = containerDOM.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // totalHeight: height of container + viewport height
    const totalHeight = rect.height + windowHeight;

    // progress: 0 when bottom is above viewport, 1 when top hits top of viewport
    let progressCalc = 1 - rect.bottom / totalHeight;

    // Clamp between 0 and 1
    progressCalc = Math.min(Math.max(progressCalc, 0), 1);

    // Only update if changed by more than a small delta (to avoid redundant renders)
    setProgress((oldProgress) => {
      if (Math.abs(oldProgress - progressCalc) > 0.01) {
        return progressCalc;
      }
      return oldProgress;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call in case already scrolled
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <section className="timeline-section" ref={containerDOM}>
      <h2 className="timeline-main-heading">Project Timeline</h2>

      <div className="timeline-container">
        {/* Vertical progress line */}
        <div className="vertical-line">
          <div
            className="vertical-line-progress"
            style={{ height: `${progress * 100}%` }}
          />
        </div>

        {/* Timeline items */}
        {timelineData.map((item, idx) => {
          const isExpanded = expanded[item.phase];
          const icon = iconMap[item.phase] || <FaBrain />;
          return (
            <div
              key={item.phase}
              className={`timeline-item ${idx % 2 === 0 ? "left" : "right"}`}
            >
              <div className="icon-marker">{icon}</div>

              <div
                className={`timeline-content glass-card ${
                  isExpanded ? "expanded" : ""
                }`}
              >
                <div
                  className="timeline-header"
                  onClick={() => toggleExpand(item.phase)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") toggleExpand(item.phase);
                  }}
                  aria-expanded={isExpanded}
                >
                  <div>
                    <h3 className="timeline-phase">Phase {item.phase}</h3>
                    <h4 className="timeline-title">{item.title}</h4>
                  </div>
                  <button
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    className={`expand-btn ${isExpanded ? "expanded" : ""}`}
                    type="button"
                  >
                    {isExpanded ? "−" : "+"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="timeline-details">
                    <p className="timeline-description">{item.description}</p>
                    <div className="timeline-contributors">
                      {item.contributors.map((c, i) => (
                        <span key={i} className="contributor" title={c}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TimelineSection;
