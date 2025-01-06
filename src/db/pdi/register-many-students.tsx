import Papa from 'papaparse';

import { id } from '@/lib/nanoid';

import { registerStudent } from './register-student';

// Read and parse CSV using Bun
const file = Bun.file('./pdi_db.csv');
const fileContent = await file.text();
type CSVRow = {
  id: string;
  student_name: string;
  email: string;
  category: string;
  group: string;
  start_time: string;
  end_time: string;
  days: string;
  months: string;
  parent_name: string;
  student_dni: string;
};

let { data: csvData } = Papa.parse<CSVRow>(fileContent, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
});
csvData = csvData.map((x) => ({ ...x, id: id() }));

await Promise.all(csvData.map(async (student) => registerStudent(student)));
