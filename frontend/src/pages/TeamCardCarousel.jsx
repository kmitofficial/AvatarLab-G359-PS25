import React, { useEffect, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import "./about.css";

const members = [
  {
    name: "Voore Risheel Kumar",
    roll: "23BD1A05BV",
    github: "https://github.com/Risheel-kumar",
    linkedin: "https://www.linkedin.com/in/risheel-kumar-voore-b27754306/",
    image: "/images/th1.jpg",
  },
  {
    name: "Voore  Kumar",
    roll: "23BD1A05BV",
    github: "https://github.com/Risheel-kumar",
    linkedin: "https://www.linkedin.com/in/risheel-kumar-voore-b27754306/",
    image: "/images/th1.jpg",
  },
  {
    name: " Risheel",
    roll: "23BD1A05BV",
    github: "https://github.com/Risheel-kumar",
    linkedin: "https://www.linkedin.com/in/risheel-kumar-voore-b27754306/",
    image: "/images/th1.jpg",
  },
  // Add more members here
];

const TeamCardCarousel = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const changeCard = (newIndex) => {
    setFade(false);
    setTimeout(() => {
      setIndex((newIndex + members.length) % members.length);
      setFade(true);
    }, 200); // matches fade duration
  };

  useEffect(() => {
    const interval = setInterval(() => {
      changeCard(index + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [index]);

  const current = members[index];

  return (
    <section className="carousel-section">
      <h2 className="carousel-title">Meet the Team</h2>
      <div className="carousel-single-wrapper">
        <button className="carousel-btn left-btn" onClick={() => changeCard(index - 1)}>
          &lt;
        </button>

        <div className={`carousel-card glass-card ${fade ? "fade-in" : "fade-out"}`}>
          <div className="card-inner">
            <div className="card-image-left">
              <img
                src={current.image || "https://via.placeholder.com/150"}
                alt={current.name}
              />
            </div>
            <div className="card-info-right">
              <h3>{current.name}</h3>
              <p className="member-roll">{current.roll}</p>
              <div className="card-links">
                <a href={current.github} target="_blank" rel="noopener noreferrer">
                  <FaGithub />
                </a>
                <a href={current.linkedin} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>
        </div>

        <button className="carousel-btn right-btn" onClick={() => changeCard(index + 1)}>
          &gt;
        </button>
      </div>
    </section>
  );
};

export default TeamCardCarousel;
