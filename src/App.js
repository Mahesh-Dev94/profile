import React from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaUserTie,
  FaTools,
  FaBriefcase,
  FaProjectDiagram,
  FaGraduationCap,
} from "react-icons/fa";
import "./App.css";
import userImage from "./user.jpg";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const App = () => {
  return (
    <div className="container">
     

      <div className="main-content">
        <div className="sidebar">
          <motion.div
            className="profile"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 1 }}
          >
            <img src={userImage} alt="Profile" className="profile-image" />
            <h1>Mahesh Vishwakarma</h1>
            <p>(Lead Engineer)</p>
            <strong>Location : Noida, India</strong>
           
            <div className="contact-info">
              <div>
                <FaEnvelope />
                <motion.a
                  href="mailto:mahesh.vishwakarma67@gmail.com"
                  whileHover={{ scale: 1.05, color: "#ff6f61" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  mahesh.vishwakarma67@gmail.com
                </motion.a>
              </div>
              <div>
                <FaPhone />
                <motion.a
                  href="tel:+919889991090"
                  whileHover={{ scale: 1.05, color: "#2ecc71" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  +91 98899 91090
                </motion.a>
              </div>
              <div>
                <FaLinkedin />
                <motion.a
                  href="https://in.linkedin.com/in/mahesh-vishwakarma-07656893"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, color: "#0072b1" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  LinkedIn Profile
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="content">
          <motion.section
            className="section"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <h2>
              <FaUserTie /> Profile Summary
            </h2>
            <p>
              Dynamic team leader with 9+ years of experience in mobile and web
              app development. Skilled in React Native, Ionic, JavaScript,
              React, Redux, and CI/CD pipelines. Proven track record in
              delivering high-quality apps on time and budget. Expertise in
              streaming technologies, mapping services, Firebase, and OneSignal.
              Focused on project efficiency and quality execution.
            </p>
          </motion.section>

          <motion.section
  className="section"
  variants={fadeInUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  transition={{ delay: 0.6, duration: 1 }}
>
  <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
    <FaTools /> Key Skills
  </h2>
  <ul className="list-disc list-inside space-y-2">
    <motion.li
      whileHover={{ scale: 1.05, color: "#2c3e50" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <strong>Mobile & Web Development:</strong> React Native, React.js, Ionic Framework, Node.js, Full Stack Development, Phonegap, Cordove
    </motion.li>
    <motion.li
      whileHover={{ scale: 1.05, color: "#2c3e50" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <strong>Programming Languages:</strong> JavaScript, TypeScript, Python, HTML, CSS
    </motion.li>
    <motion.li
      whileHover={{ scale: 1.05, color: "#2c3e50" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <strong>DevOps & Testing:</strong> CI/CD Pipeline, GitHub, Jenkins, Jest, Appium, Allure Reporting
    </motion.li>
    <motion.li
      whileHover={{ scale: 1.05, color: "#2c3e50" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <strong>Cloud & Tools:</strong> Firebase, Firestore, AWS-Amplify, App Publishing (App Store & Play Store)
    </motion.li>
  </ul>
</motion.section>

          <motion.section
            className="section"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 1 }}
          >
            <h2>
              <FaBriefcase /> Work Experience
            </h2>
            <ul>
              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>
                  Jan 2022 - Present | Team Leader, R Systems International
                </h3>
                <ul className="list-disc list-inside ml-5">
                  <li>
                    Led React Native team in delivering high-quality mobile apps
                  </li>
                  <li>
                    Ensured adherence to coding standards and best practices
                  </li>
                  <li>Managed timelines, resources, and task assignments</li>
                  <li>Fostered team growth through feedback and mentoring</li>
                  <li>Developed npm libraries and native modules</li>
                  <li>Integrated CI/CD pipeline with Jenkins</li>
                  <li>Implemented Allure server for reporting</li>
                </ul>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>
                  Mar 2019 - Dec 2021 | Hybrid Mobile App Developer, KOGO Tech
                  Labs
                </h3>
                <ul className="list-disc list-inside ml-5">
                  <li>Published npm libraries & native modules</li>
                  <li>Integrated IoT, navigation, and mapping features</li>
                  <li>
                    Implemented real-time chat, Redux Toolkit, and Firebase
                  </li>
                  <li>Map & location services integration</li>
                  <li>Led travel story app development</li>
                  <li>
                    Implemented complex features & real-time updates Used Redux
                    & RESTful APIs
                  </li>
                </ul>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>
                  May 2018 - Mar 2019 | Hybrid App Developer, Aritone Global
                  Venture
                </h3>
                <ul className="list-disc list-inside ml-5">
                  <li>API Integration, State Management (Redux)</li>
                  <li>Push Notifications, Testing & Debugging</li>
                </ul>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>
                  May 2017 - May 2018 | Hybrid App Developer, Infinite Loop
                  India Corp
                </h3>
                <ul className="list-disc list-inside ml-5">
                  <li>
                    {" "}
                    Developed and maintained high-performance Ionic
                    applications.{" "}
                  </li>
                  <li>
                    {" "}
                    Defined project requirements and timelines with teams.
                  </li>
                  <li>
                    Utilized components, services, and plugins for robust apps.
                  </li>
                  <li>Created responsive and interactive UIs.</li>
                  <li>Managed data with RESTful APIs and Ionic tools.</li>
                </ul>
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>
                  Nov 2015 - Apr 2017 | Hybrid App Developer, Compurx Infotech
                </h3>
                <ul className="list-disc list-inside ml-5">
                  <li>
                    Developed and maintained high-performance mobile
                    applications.
                  </li>
                  <li>
                    Utilized Ionic components, services, and plugins for
                    feature-rich apps.
                  </li>
                  <li>
                    Employed Angular for responsive and interactive UI creation.
                  </li>
                  <li>Integrated with RESTful APIs for data management.</li>
                  <li>Conducted thorough testing to resolve issues.</li>
                </ul>
              </motion.li>
            </ul>
          </motion.section>

          <motion.section
            className="section"
            // style={{ background: "#f6f6ff" }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <h2>
              <FaProjectDiagram /> Projects
            </h2>

            <ul>
              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>5 Months | CCD - Café Coffee Day</h3>
                <ul className="list-disc list-inside ml-5">
                  <li>Utilized REST and GraphQL APIs for data handling</li>
                  <li>
                    Implemented real-time notifications for user engagement
                  </li>
                  <li>
                    Enabled live tracking features for enhanced user experience
                  </li>
                  <li>
                    Integrated Google Maps for location-based functionalities
                  </li>
                  <li>
                    Used geolocation services for accurate user positioning
                  </li>
                  <li>Developed multilingual-capable apps</li>
                  <li>Created seamless food ordering experiences</li>
                </ul>
              </motion.li>

              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>36 Months | KOGO by Mappls</h3>
                <ul className="list-disc list-inside ml-5">
                  <li>Consumed REST services, parsed JSON for relevant data</li>
                  <li>
                    Integrated Google Maps API for location-based services
                  </li>
                  <li>
                    Implemented reminders with services, async tasks, and
                    notifications
                  </li>
                  <li>Developed IoT features like turn-by-turn navigation</li>
                  <li>Used MapBox & MapMyIndia for user location</li>
                  <li>Used Microsoft App Center for updates</li>
                  <li>Built real-time chat using Socket.io</li>
                  <li>Integrated Firebase for notifications and analytics</li>
                  <li>Used Redux Toolkit for state management</li>
                </ul>
              </motion.li>

              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>4 Months | Peng Lai Dian SG</h3>
                <ul className="list-disc list-inside ml-5">
                  <li>Used APIs for data fetching & sync</li>
                  <li>HTML for rich text rendering</li>
                  <li>Enabled image uploads in app</li>
                  <li>Push notifications for real-time updates</li>
                  <li>Dynamic content rendering based on interaction</li>
                  <li>Multilingual support</li>
                  <li>Used Redux for state management</li>
                </ul>
              </motion.li>

              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>24 Months | KTM India</h3>
                <ul className="list-disc list-inside ml-5">
                  <li>Consumed REST services, parsed JSON</li>
                  <li>Integrated Google Maps API for location</li>
                  <li>Used Async tasks and Alert API for events</li>
                  <li>Used MapBox for maps</li>
                  <li>Microsoft App Center for updates</li>
                  <li>Real-time chat with Socket.io</li>
                  <li>Notifications with OneSignal</li>
                  <li>Firebase Analytics for user behavior</li>
                  <li>QA/Production API environments</li>
                </ul>
              </motion.li>

              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3>7 Months | IITIIMShaadi - Matchmaking App</h3>
                <ul className="list-disc list-inside ml-5">
                  <li>Consumed REST services, parsed JSON</li>
                  <li>Deployed app to Play Store & App Store</li>
                  <li>Used Ionic v2 with TypeScript, JS, CSS3, and HTML</li>
                  <li>Handled screen orientation with native plugins</li>
                </ul>
              </motion.li>
            </ul>
          </motion.section>

          <motion.section
            className="section"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 1 }}
          >
            <h2>
              <FaGraduationCap /> Education
            </h2>
            <ul>
              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                B.Tech (Information Technology) 2015 – Uttar Pradesh Technical
                University (UPTU)
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Diploma (Computer Science) 2012 - Board Of Technical Education
                UP{" "}
              </motion.li>
              <motion.li
                whileHover={{ scale: 1.05, color: "#2c3e50" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                10th (PCM) 2009 – Uttar Pradesh
              </motion.li>
            </ul>
          </motion.section>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2025 Mahesh Vishwakarma. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
