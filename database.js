const { Pool } = require('pg');
require('dotenv').config();
const pool=new Pool({
user:'postgres',
host:'localhost',
database:'estoque_bd',
password:'root',
port:5432
});

module.exports = pool;