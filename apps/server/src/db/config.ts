const envKeys = {
    host: 'RDS_HOSTNAME',
    user: 'RDS_USERNAME',
    password: 'RDS_PASSWORD',
    db: 'RDS_DATABASE',
    port: 'RDS_PORT',
};

// ensure env variables are set
{
    const missingKeys = [envKeys.host, envKeys.user, envKeys.password, envKeys.db].filter((key) => !process.env[key]);
    if (missingKeys.length) {
        throw new Error(`Bad environment config: ${missingKeys.join(', ')} must be set`);
    }
}

const credentials = {
    host: process.env[envKeys.host]!,
    username: process.env[envKeys.user]!,
    password: process.env[envKeys.password]!,
    port: parseInt(process.env[envKeys.port] ?? '3306', 10),
    database: process.env[envKeys.db]!,
};

export default credentials;