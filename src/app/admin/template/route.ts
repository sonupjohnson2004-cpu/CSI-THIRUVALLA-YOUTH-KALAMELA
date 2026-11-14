import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  const sampleData = [
    {
      Category: 'Vocal Solo - Classical & Semi-Classical',
      Round: 'Finals',
      Segment: 'Morning Session (Auditorium A)',
      '1st Place Winner': 'Sophia Chen',
      '1st Place Details': 'St. Jude Academy - Performance: "Clair de Lune"',
      '1st Place Score': '98.5',
      '2nd Place Winner': 'Liam O\'Connor',
      '2nd Place Details': 'Oakridge High - Performance: "Ave Maria"',
      '2nd Place Score': '96.0',
      '3rd Place Winner': 'Maya Patel',
      '3rd Place Details': 'Green Valley School - Performance: "O Mio Babbino Caro"',
      '3rd Place Score': '94.5',
      Notes: 'Unanimous decision by judges panel',
    },
    {
      Category: 'Contemporary Group Dance',
      Round: 'Championship',
      Segment: 'Evening Gala',
      '1st Place Winner': 'The Kinetic Crew',
      '1st Place Details': '8 Dancers - Choreography: "Metamorphosis"',
      '1st Place Score': '99.0',
      '2nd Place Winner': 'Lumina Dance Collective',
      '2nd Place Details': '6 Dancers - Choreography: "Echoes of Dawn"',
      '2nd Place Score': '97.2',
      '3rd Place Winner': '',
      '3rd Place Details': '',
      '3rd Place Score': '',
      Notes: '3rd place pending judges score reconciliation',
    },
    {
      Category: 'Stand-up Comedy & Satire',
      Round: 'Finals',
      Segment: 'Evening Gala',
      '1st Place Winner': 'Ethan Miller',
      '1st Place Details': 'Act: "Living with Artificial Intelligence"',
      '1st Place Score': '95.0',
      '2nd Place Winner': '',
      '2nd Place Details': '',
      '2nd Place Score': '',
      '3rd Place Winner': '',
      '3rd Place Details': '',
      '3rd Place Score': '',
      Notes: 'Runner-ups to be announced at 8:00 PM',
    },
    {
      Category: 'Instrumental Solo - Piano & Violin',
      Round: 'Finals',
      Segment: 'Afternoon Session',
      '1st Place Winner': '',
      '1st Place Details': '',
      '1st Place Score': '',
      '2nd Place Winner': '',
      '2nd Place Details': '',
      '2nd Place Score': '',
      '3rd Place Winner': '',
      '3rd Place Details': '',
      '3rd Place Score': '',
      Notes: 'Performance scheduled for 3:30 PM',
    },
    {
      Category: 'Theatrical Skit & One-Act Play',
      Round: 'Finals',
      Segment: 'Main Hall',
      '1st Place Winner': 'The Spotlight Players',
      '1st Place Details': 'Play: "The Grand Illusion" - Directed by Sarah Jenkins',
      '1st Place Score': '97.5',
      '2nd Place Winner': 'Riverdale Drama Troupe',
      '2nd Place Details': 'Play: "Whispers in the Library"',
      '2nd Place Score': '95.0',
      '3rd Place Winner': 'Crestview Performers',
      '3rd Place Details': 'Play: "A Midnight Tale"',
      '3rd Place Score': '92.5',
      Notes: 'Special commendation for costume design',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Talent Show Results');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="talent_show_results_template.xlsx"',
    },
  });
}
