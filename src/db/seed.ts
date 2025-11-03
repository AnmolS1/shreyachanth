import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './client';
import {
  personalInfo,
  workExperience,
  education,
  skills,
  projects,
  currentlyLearning,
} from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Personal Info
    console.log('Adding personal info...');
    await db.insert(personalInfo).values({
      name: 'Shreya Chanth',
      title: 'Management Consultant & Product Analyst',
      email: 'shreyatchanth@gmail.com',
      phone: '(832) 526-8786',
      linkedin: 'https://linkedin.com/in/shreyachanth',
      bio: 'Results-driven management consultant and product analyst with expertise in data analytics, financial modeling, and strategic planning. Proven track record of driving operational improvements, reducing costs, and accelerating project delivery through data-driven insights and innovative solutions.',
      location: 'Toronto, ON',
      profileImageUrl: null,
    });

    // Work Experience
    console.log('Adding work experience...');
    await db.insert(workExperience).values([
      {
        company: 'Bedrock AI',
        role: 'Management Consultant',
        location: 'Atlanta, Georgia',
        startDate: 'March 2024',
        endDate: 'May 2025',
        achievements: [
          'Secured venture capital funding by developing comprehensive investor materials and 5-year financial models featuring CAC, EBITDA, and revenue projections using advanced Excel valuation frameworks',
          'Improved customer satisfaction by implementing standardized NPS scoring system resulting in increased response rates and enhanced customer insights',
          'Accelerated executive decision speed by 40% by consolidating client engagement metrics across teams into weekly strategic reports, accelerating time-to-market for new initiatives',
        ],
        order: 1,
      },
      {
        company: 'Kadal Records',
        role: 'Strategy & Product Analyst',
        location: 'Toronto, Canada',
        startDate: 'August 2022',
        endDate: 'December 2023',
        achievements: [
          'Reduced operational costs by $60,000 annually by implementing Random Forest predictive models in R for budget forecasting and scenario planning',
          'Eliminated 37% of budget forecast discrepancies by developing SQL-powered financial dashboards, preventing costly resource misallocation',
          'Boosted client satisfaction scores by 12% during product launches by leading usability testing initiatives and implementing session analytics to optimize user onboarding experiences',
        ],
        order: 2,
      },
      {
        company: 'Rite Software',
        role: 'Business Analyst Intern',
        location: 'Houston, Texas',
        startDate: 'June 2021',
        endDate: 'August 2021',
        achievements: [
          'Enhanced operational integrity by designing and deploying advanced real-time anomaly detection systems that increased valid irregularity identification, significantly strengthening compliance frameworks and safeguarding revenue streams',
          'Accelerated project delivery by 25% by facilitating Oracle ERP Cloud requirements workshops and streamlining cross-functional collaboration processes',
          'Streamlined executive decision-making by engineering comprehensive Tableau dashboards that transformed complex investment data into actionable visual insights',
        ],
        order: 3,
      },
      {
        company: 'Texas A&M University – Education Abroad Office',
        role: 'Technology Consultant',
        location: 'College Station, Texas',
        startDate: 'August 2022',
        endDate: 'June 2023',
        achievements: [
          'Drove organizational transformation by introducing agile methodologies across technology teams and implementing sprint tracking systems, increasing project delivery success rate by 30% as measured by on-time completion metrics',
          'Amplified platform adoption by developing and delivering comprehensive training workshops for 200+ faculty and staff on new Via platform implementation, increasing user engagement by 45%',
        ],
        order: 4,
      },
    ]);

    // Education
    console.log('Adding education...');
    await db.insert(education).values({
      institution: 'Texas A&M University',
      degree: 'BSc. in Business Administration, Management of Information Systems',
      location: 'College Station, Texas',
      graduationDate: 'May 2024',
      order: 1,
    });

    // Skills
    console.log('Adding skills...');
    await db.insert(skills).values([
      // Data Analytics
      { name: 'SQL', category: 'Data Analytics', order: 1 },
      { name: 'R', category: 'Data Analytics', order: 2 },
      { name: 'Tableau', category: 'Data Analytics', order: 3 },
      { name: 'Excel', category: 'Data Analytics', order: 4 },
      { name: 'Looker', category: 'Data Analytics', order: 5 },
      { name: 'Figma', category: 'Data Analytics', order: 6 },
      { name: 'A/B Testing', category: 'Data Analytics', order: 7 },
      { name: 'Python', category: 'Data Analytics', order: 8 },
      // Certifications
      { name: 'AWS Cloud Practitioner', category: 'Certifications', order: 9 },
      { name: 'Microsoft Azure & AI Fundamentals', category: 'Certifications', order: 10 },
      { name: 'Inbound Sales', category: 'Certifications', order: 11 },
    ]);

    // Projects (Personal Projects and Nonprofit Work)
    console.log('Adding projects...');
    await db.insert(projects).values([
      {
        title: 'KC BLOCK – Library Construction Project',
        description: 'Led end-to-end library construction project from fundraising to completion, providing educational infrastructure for a community in Thanjavur, India.',
        role: 'Project Manager and Fundraising Lead',
        location: 'Thanjavur, India',
        startDate: 'March 2025',
        endDate: 'Present',
        achievements: [
          'Secured $7.4K in 6-week fundraising campaign through GoFundMe platform and donor outreach, fully funding library construction project from concept to completion',
          'Executed end-to-end library construction project within 5-month timeline by coordinating construction phases, managing multiple vendor relationships, and leading cross-functional teams to complete educational infrastructure build-out',
        ],
        techStack: ['Project Management', 'Fundraising', 'Stakeholder Management'],
        links: [],
        imageUrl: null,
        type: 'personal',
        order: 1,
      },
      {
        title: 'FeTNA Mobile App',
        description: 'Led product management for iOS/Android mobile application supporting 3000+ attendees at the Federation of Tamils in North America summit.',
        role: 'Product Manager, Mobile App',
        location: 'New York City, New York',
        startDate: 'March 2024',
        endDate: 'July 2024',
        achievements: [
          'Increased platform adoption by 120% through implementation of KPI tracking dashboards (CSAT, engagement rates) and data-driven product iterations, supporting 3000+ summit attendees',
          'Achieved 100% on-time delivery of iOS/Android mobile application managing product roadmaps, sprint planning, and stakeholder alignment across multiple committees and leading teams',
        ],
        techStack: ['Product Management', 'iOS', 'Android', 'KPI Tracking', 'Agile'],
        links: [],
        imageUrl: null,
        type: 'personal',
        order: 2,
      },
    ]);

    // Currently Learning
    console.log('Adding currently learning section...');
    await db.insert(currentlyLearning).values({
      content: 'Exploring advanced machine learning techniques and cloud architecture patterns to enhance data-driven decision-making capabilities.',
    });

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
