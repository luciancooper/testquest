export interface SQLColumnSchema {
    name: string
    type: string
    nullable: boolean
    def: string | null
    key: string
    extra: string
}

export interface SQLDatabaseSchema {
    database: string
    tables: Record<string, SQLColumnSchema[]>
}