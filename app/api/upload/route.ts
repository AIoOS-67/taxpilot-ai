import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // In demo mode, return mock extracted W-2 data
    // In production, this would upload to DO Spaces + run OCR
    const extracted = {
      employer: "Demo Employer Inc.",
      ein: "12-3456789",
      wages: "$75,000.00",
      federal_tax: "$12,500.00",
      state_tax: "$3,750.00",
      social_security_wages: "$75,000.00",
      social_security_tax: "$4,650.00",
      medicare_wages: "$75,000.00",
      medicare_tax: "$1,087.50",
    };

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      extracted,
      url: `/uploads/demo/${file.name}`,
    });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
