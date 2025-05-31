import React from "react";
import "./about.css";
import TimelineSection from "./TimelineSection";
import TeamCardCarousel from "./TeamCardCarousel";

const About = () => {
  return (
    <div className="about-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-heading">Building Lifelike Digital Avatars with Real Emotion</h1>
          <p className="hero-subheading">
            At Avatar AI Labs, we combine the power of <strong>generative AI</strong> and <strong>expressive design</strong> to create avatars that don’t just <strong>look real</strong> — they <strong>feel real</strong>. Our mission is to <strong>humanize digital interaction</strong> through <strong>voice</strong>, <strong>vision</strong>, and <strong>emotion</strong>.
          </p>
        </div>
      </section>

      <TimelineSection />

      <TeamCardCarousel />
    </div>
  );
};

export default About;
