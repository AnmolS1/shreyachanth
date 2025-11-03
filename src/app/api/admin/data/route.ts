import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import {
  personalInfo,
  workExperience,
  education,
  skills,
  projects,
  currentlyLearning,
} from '@/db/schema';
import { asc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// GET - Fetch all data for editing
export async function GET() {
  try {
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

    return NextResponse.json({
      personalInfo: personalInfoData[0] || null,
      workExperience: workExperienceData,
      education: educationData,
      skills: skillsData,
      projects: projectsData,
      currentlyLearning: currentlyLearningData[0] || null,
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// PUT - Update portfolio data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      personalInfo: personalInfoUpdate,
      workExperience: workExperienceUpdate,
      education: educationUpdate,
      skills: skillsUpdate,
      projects: projectsUpdate,
      currentlyLearning: currentlyLearningUpdate,
    } = body;

    // Update personal info
    if (personalInfoUpdate && personalInfoUpdate.id) {
      await db
        .update(personalInfo)
        .set({
          ...personalInfoUpdate,
          updatedAt: new Date(),
        })
        .where(eq(personalInfo.id, personalInfoUpdate.id));
    }

    // Update work experience (delete and re-insert to handle order changes)
    if (workExperienceUpdate && Array.isArray(workExperienceUpdate)) {
      await db.delete(workExperience).where(sql`1=1`);
      if (workExperienceUpdate.length > 0) {
        await db.insert(workExperience).values(
          workExperienceUpdate.map((item, index) => ({
            ...item,
            order: index + 1,
          }))
        );
      }
    }

    // Update education
    if (educationUpdate && Array.isArray(educationUpdate)) {
      await db.delete(education).where(sql`1=1`);
      if (educationUpdate.length > 0) {
        await db.insert(education).values(
          educationUpdate.map((item, index) => ({
            ...item,
            order: index + 1,
          }))
        );
      }
    }

    // Update skills
    if (skillsUpdate && Array.isArray(skillsUpdate)) {
      await db.delete(skills).where(sql`1=1`);
      if (skillsUpdate.length > 0) {
        await db.insert(skills).values(
          skillsUpdate.map((item, index) => ({
            ...item,
            order: index + 1,
          }))
        );
      }
    }

    // Update projects
    if (projectsUpdate && Array.isArray(projectsUpdate)) {
      await db.delete(projects).where(sql`1=1`);
      if (projectsUpdate.length > 0) {
        await db.insert(projects).values(
          projectsUpdate.map((item, index) => ({
            ...item,
            order: index + 1,
          }))
        );
      }
    }

    // Update currently learning
    if (currentlyLearningUpdate && currentlyLearningUpdate.id) {
      await db
        .update(currentlyLearning)
        .set({
          content: currentlyLearningUpdate.content,
          updatedAt: new Date(),
        })
        .where(eq(currentlyLearning.id, currentlyLearningUpdate.id));
    }

    // Revalidate portfolio cache
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: 'Portfolio data updated successfully',
    });
  } catch (error) {
    console.error('Error updating portfolio data:', error);
    return NextResponse.json(
      {
        error: 'Failed to update data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
