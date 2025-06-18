#!/usr/bin/env node

import mysql from 'mysql2/promise';
import config from './db/config';
import { sequelize } from './db/models';

// establish mysql connection to ensure db exists
const connection = await mysql.createConnection({
    host: config.host,
    user: config.username,
    password: config.password,
    port: config.port,
    connectTimeout: 10000, // 10 seconds
    enableKeepAlive: false,
});

// create database if it does not exist
{
    const [{ warningStatus }] = await connection.query(
        `CREATE DATABASE IF NOT EXISTS ${config.database}`,
    ) as unknown as [{ warningStatus: 0 | 1 }];
    if (!warningStatus) console.log('✅ DB %s created', config.database);
}

// close the connection
await connection.end();

// sync models
await sequelize.sync({ alter: true });
console.log('✅ Sequelize models synced');

// close the sequelize pool
await sequelize.close();
console.log('✅ Sequelize connection closed');

process.exit(0);