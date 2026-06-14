const fs = require('fs');
const { parse } = require('csv-parse/sync');

const inputPath = '/data/data.csv';
const outputPath = '/data/report.html';

if (!fs.existsSync(inputPath)) {
  console.error('Файл /data/data.csv не найден. Сначала запустите генератор данных.');
  process.exit(1);
}

const input = fs.readFileSync(inputPath, 'utf8');
const records = parse(input, { columns: true, skip_empty_lines: true });

if (records.length === 0) {
  console.error('CSV пустой');
  process.exit(1);
}

const columns = Object.keys(records[0]);
const numericStats = {};
const categoricalStats = {};

for (const col of columns) {
  const rawValues = records.map((record) => record[col]);
  const numericValues = rawValues.map((value) => parseFloat(value)).filter((value) => !Number.isNaN(value));

  if (numericValues.length === rawValues.length) {
    numericStats[col] = {
      count: numericValues.length,
      min: Math.min(...numericValues).toFixed(2),
      max: Math.max(...numericValues).toFixed(2),
      mean: (numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length).toFixed(2),
    };
  } else {
    const freq = {};
    for (const value of rawValues) {
      freq[value] = (freq[value] || 0) + 1;
    }
    categoricalStats[col] = freq;
  }
}

const numericRows = Object.entries(numericStats)
  .map(([col, stat]) => `
    <tr>
      <td>${col}</td>
      <td>${stat.count}</td>
      <td>${stat.min}</td>
      <td>${stat.max}</td>
      <td>${stat.mean}</td>
    </tr>
  `)
  .join('');

const numericTable = numericRows
  ? `
    <h2>Числовые колонки</h2>
    <table>
      <thead>
        <tr>
          <th>Колонка</th>
          <th>Количество</th>
          <th>Минимум</th>
          <th>Максимум</th>
          <th>Среднее</th>
        </tr>
      </thead>
      <tbody>${numericRows}</tbody>
    </table>
  `
  : '<h2>Числовые колонки</h2><p>Нет числовых колонок</p>';

const categoricalTables = Object.entries(categoricalStats)
  .map(([col, freq]) => {
    const rows = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => `
        <tr>
          <td>${value}</td>
          <td>${count}</td>
        </tr>
      `)
      .join('');

    return `
      <h2>Категориальная колонка: ${col}</h2>
      <table>
        <thead>
          <tr>
            <th>Значение</th>
            <th>Количество</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  })
  .join('');

const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отчёт по данным</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.5;
      background: #f5f5f5;
      color: #222;
    }
    h1, h2 {
      color: #111;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 28px;
      background: #fff;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 10px;
      text-align: left;
    }
    th {
      background: #e9e9e9;
    }
    .card {
      background: #fff;
      padding: 18px;
      border: 1px solid #ddd;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <h1>Отчёт по данным</h1>
  <div class="card">
    <p><strong>Всего строк:</strong> ${records.length}</p>
    <p><strong>Всего колонок:</strong> ${columns.length}</p>
  </div>
  ${numericTable}
  ${categoricalTables}
</body>
</html>
`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log('Отчёт сохранён: /data/report.html');
