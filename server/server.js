const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'telemetry.json');

app.use(cors());
app.use(bodyParser.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    trucks: [
      { id: 1, reg: 'TN 45 D 2345', driver: 'Arjun Kumar', load: 'Apples', eta: '2h 15m', sensors: { temp: 4, humidity: 70, gas: 45 } },
      { id: 2, reg: 'TN 28 B 9901', driver: 'S Rajesh', load: 'Mixed Fruit', eta: '45m', sensors: { temp: 8, humidity: 65, gas: 80 } },
      { id: 3, reg: 'TN 30 C 1234', driver: 'M Selvam', load: 'Vegetables', eta: '4h 30m', sensors: { temp: 5, humidity: 75, gas: 30 } },
    ]
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// GET all trucks
app.get('/api/trucks', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data.trucks);
});

// GET specific truck
app.get('/api/trucks/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const truck = data.trucks.find(t => t.id === parseInt(req.params.id));
  if (truck) res.json(truck);
  else res.status(404).json({ error: 'Truck not found' });
});

// POST telemetry update
app.post('/api/telemetry', (req, res) => {
  const { id, sensors } = req.body;
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const index = data.trucks.findIndex(t => t.id === parseInt(id));
  
  if (index !== -1) {
    data.trucks[index].sensors = sensors;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json(data.trucks[index]);
  } else {
    res.status(404).json({ error: 'Truck not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
