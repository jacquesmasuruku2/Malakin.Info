import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUser } from '@/lib/current-user';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.malakinfo.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        jobOffer: {
          select: {
            title: true,
            location: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(applications, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job applications' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await resolveCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour postuler.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const {
      jobOfferId,
      name,
      email,
      phone,
      coverLetter,
      resumeUrl,
    } = body;

    const applicantName = (typeof name === 'string' && name.trim()) || currentUser.name;
    const applicantEmail = (typeof email === 'string' && email.trim()) || currentUser.email;

    if (!jobOfferId || !applicantName || !applicantEmail) {
      return NextResponse.json(
        { error: 'Job offer ID, name, and email are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id: jobOfferId },
      select: { id: true, deadline: true },
    });

    if (!jobOffer) {
      return NextResponse.json(
        { error: 'Offre introuvable' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (jobOffer.deadline && new Date(jobOffer.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'Cette offre a expiré' },
        { status: 410, headers: corsHeaders }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobOfferId,
        name: applicantName,
        email: applicantEmail,
        phone,
        coverLetter,
        resumeUrl,
        status: 'pending',
      },
      include: {
        jobOffer: {
          select: {
            title: true,
            location: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json(
      { error: 'Failed to create job application' },
      { status: 500, headers: corsHeaders }
    );
  }
}
