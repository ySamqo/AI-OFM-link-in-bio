require('dotenv').config();
const bcrypt=require('bcrypt'), readline=require('readline'), {openDatabase}=require('../src/db');
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const ask=q=>new Promise(r=>rl.question(q,r));
(async()=>{const email=(await ask('Admin email: ')).trim().toLowerCase(),password=await ask('Admin password (8+ characters): ');rl.close();if(!email||password.length<8)throw new Error('Provide an email and a password of at least 8 characters.');const db=openDatabase();db.prepare('INSERT INTO admin_users(email,password_hash) VALUES(?,?)').run(email,await bcrypt.hash(password,12));db.close();console.log('Admin created.');})().catch(e=>{console.error(e.message);process.exit(1)});
