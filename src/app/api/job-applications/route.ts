import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.malakinfo.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://dashboard.malakinfo.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
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
    const body = await request.json();
    const {
      jobOfferId,
      name,
      email,
      phone,
      coverLetter,
      resumeUrl,
    } = body;

    if (!jobOfferId || !name || !email) {
      return NextResponse.json(
        { error: 'Job offer ID, name, and email are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobOfferId,
        name,
        email,
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

