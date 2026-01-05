import { NextResponse } from 'next/server'

export async function GET() {
  const csvTemplate = `set_number,quantity,condition
75192,1,SEALED
10294,2,USED
21318,1,SEALED`

  return new NextResponse(csvTemplate, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="collection-template.csv"',
    },
  })
}

