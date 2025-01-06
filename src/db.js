const { app } = require('electron');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({
    path: app.isPackaged 
      ? path.join(process.resourcesPath, '.env')
      : path.join(__dirname, '../.env')
  });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
});

client.connect()
    .then(() => {
        console.log('Connected to the database.');
    })
    .catch(err => {
        console.error('Error connecting to database:', err.stack);
    });

module.exports = client