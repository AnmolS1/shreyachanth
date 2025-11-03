import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import {
  personalInfo,
  workExperience,
  education,
  skills,
  projects,
  currentlyLearning,
} from '@/db/schema';
import { asc } from 'drizzle-orm';

export const revalidate = 3600; // Revalidate every hour
export const dynamic = 'force-static';

export async function GET() {
  try {
    // Fetch all portfolio data in parallel
    const [
      personalInfoData,
      workExperienceData,
      educationData,
      skillsData,
      projectsData,
      currentlyLearningData,
    ] = await Promise.all([
      db.select().from(personalInfo).limit(1),
      db.select().from(workExperience).orderBy(asc(workExperience.order)),
      db.select().from(education).orderBy(asc(education.order)),
      db.select().from(skills).orderBy(asc(skills.order)),
      db.select().from(projects).orderBy(asc(projects.order)),
      db.select().from(currentlyLearning).limit(1),
    ]);

    // Group skills by category
    const groupedSkills = skillsData.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      },
      {} as Record<string, typeof skillsData>
    );

    return NextResponse.json({
      personalInfo: personalInfoData[0] || null,
      workExperience: workExperienceData,
      education: educationData,
      skills: groupedSkills,
      projects: projectsData,
      currentlyLearning: currentlyLearningData[0]?.content || null,
    });
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch portfolio data',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
