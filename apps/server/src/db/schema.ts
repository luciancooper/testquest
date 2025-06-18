import type { SQLDatabaseSchema } from '@repo/types';
import { sequelize } from './service';

interface INFORMATION_SCHEMA_ROW {
    TABLE_SCHEMA: string
    TABLE_NAME: string
    COLUMN_NAME: string
    ORDINAL_POSITION: number
    COLUMN_DEFAULT: string | null
    IS_NULLABLE: 'NO' | 'YES'
    COLUMN_TYPE: string
    COLUMN_KEY: string
    EXTRA: string
}

export async function getSchema(): Promise<SQLDatabaseSchema> {
    const database = sequelize.getDatabaseName(),
        [result] = (await sequelize.query(
            `SELECT
            TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION, COLUMN_DEFAULT, IS_NULLABLE, COLUMN_TYPE, COLUMN_KEY, EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${database}' ORDER BY TABLE_NAME, ORDINAL_POSITION`,
        )) as unknown as [INFORMATION_SCHEMA_ROW[]];
    return {
        database,
        tables: [...new Set(result.map(({ TABLE_NAME }) => TABLE_NAME))]
            .reduce<SQLDatabaseSchema['tables']>((acc, table) => {
                acc[table] = result.filter(({ TABLE_NAME }) => (TABLE_NAME === table)).map(({
                    COLUMN_NAME,
                    COLUMN_DEFAULT,
                    IS_NULLABLE,
                    COLUMN_TYPE,
                    COLUMN_KEY,
                    EXTRA,
                }) => ({
                    name: COLUMN_NAME,
                    type: COLUMN_TYPE,
                    nullable: IS_NULLABLE === 'YES',
                    def: COLUMN_DEFAULT,
                    key: COLUMN_KEY,
                    extra: EXTRA,
                }));
                return acc;
            }, {}),
    };
}