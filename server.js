const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(cors());
app.use(express.json());

let sepsisData = [];

// Load and parse submission.csv into memory on startup
fs.createReadStream('submission.csv')
  .pipe(csv())
  .on('data', (row) => {
    sepsisData.push({
      Patient_ID: row.Patient_ID,
      Hour: parseInt(row.Hour),
      SepsisLabel: parseFloat(row.SepsisLabel)
    });
  })
  .on('end', () => {
    console.log(`✅ Loaded ${sepsisData.length} prediction rows from submission.csv`);
  });

// 1. Endpoint: Get all patients with their latest calculated risk score
// app.get('/api/patients', (req, res) => {
//   const patientMap = {};
  
//   sepsisData.forEach(row => {
//     if (!patientMap[row.Patient_ID] || row.Hour >= patientMap[row.Patient_ID].Hour) {
//       patientMap[row.Patient_ID] = {
//         Patient_ID: row.Patient_ID,
//         latestHour: row.Hour,
//         riskScore: parseFloat((row.SepsisLabel * 100).toFixed(1)) // converted to %
//       };
//     }
//   });

//   res.json(Object.values(patientMap));
// });
// 1. Endpoint: Get unique list of all patients with their latest calculated risk score
app.get('/api/patients', (req, res) => {
  const patientMap = {};
  
  sepsisData.forEach(row => {
    // Keep track of the latest hour for each patient
    if (!patientMap[row.Patient_ID] || row.Hour >= patientMap[row.Patient_ID].Hour) {
      patientMap[row.Patient_ID] = {
        Patient_ID: row.Patient_ID,
        latestHour: row.Hour,
        riskScore: parseFloat((row.SepsisLabel * 100).toFixed(1)) // converted to %
      };
    }
  });

  res.json(Object.values(patientMap));
});


// 2. Endpoint: Get hour-by-hour time series trajectory for a specific patient
// app.get('/api/patient/:id', (req, res) => {
//   const patientId = req.params.id;
//   const patientRecords = sepsisData.filter(row => row.Patient_ID == patientId);
  
//   if (patientRecords.length === 0) {
//     return res.status(404).json({ error: 'Patient not found' });
//   }

//   patientRecords.sort((a, b) => a.Hour - b.Hour);
//   res.json(patientRecords);
// });


// 2. Endpoint: Get hour-by-hour time-series trajectory for a specific patient
app.get('/api/patient/:id', (req, res) => {
  const patientId = req.params.id;
  const patientRecords = sepsisData.filter(row => row.Patient_ID == patientId);
  
  if (patientRecords.length === 0) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  // Sort chronologically by hour
  patientRecords.sort((a, b) => a.Hour - b.Hour);
  res.json(patientRecords);
});

// 3. Endpoint: ICU Command Center summary statistics
app.get('/api/stats', (req, res) => {
  const patientMap = {};
  sepsisData.forEach(row => {
    if (!patientMap[row.Patient_ID] || row.Hour >= patientMap[row.Patient_ID].Hour) {
      patientMap[row.Patient_ID] = row.SepsisLabel;
    }
  });

  const scores = Object.values(patientMap);
  const totalBeds = scores.length;
  const criticalCount = scores.filter(score => score >= 0.70).length; // 70%+ risk is critical
  const avgRisk = totalBeds > 0 ? (scores.reduce((a, b) => a + b, 0) / totalBeds * 100).toFixed(1) : 0;

  res.json({
    totalBeds,
    criticalCount,
    avgRisk: `${avgRisk}%`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SepsisGuard Backend running on http://localhost:${PORT}`);
});