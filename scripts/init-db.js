require('dotenv').config();
const {openDatabase}=require('../src/db'); openDatabase().close(); console.log('Database initialized.');
