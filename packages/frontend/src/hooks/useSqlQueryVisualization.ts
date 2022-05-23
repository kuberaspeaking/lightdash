import {
    ApiQueryResults,
    ChartType,
    CompiledDimension,
    Explore,
    fieldId,
    FieldId,
    FieldType,
    friendlyName,
    SupportedDbtAdapter,
} from '@lightdash/common';
import { useMemo, useState } from 'react';
import { useSqlQueryMutation } from './useSqlQuery';

const SQL_RESULTS_TABLE_NAME = 'sql_runner';

type Args = {
    sqlQueryMutation: ReturnType<typeof useSqlQueryMutation>;
};

const useSqlQueryVisualization = ({ sqlQueryMutation: { data } }: Args) => {
    const sqlQueryDimensions: Record<FieldId, CompiledDimension> = useMemo(
        () =>
            Object.entries(data?.fields || []).reduce(
                (acc, [key, { type }]) => {
                    const dimension: CompiledDimension = {
                        fieldType: FieldType.DIMENSION,
                        type,
                        name: key,
                        label: friendlyName(key),
                        table: SQL_RESULTS_TABLE_NAME,
                        tableLabel: '',
                        sql: '',
                        compiledSql: '',
                        hidden: false,
                    };
                    return { ...acc, [fieldId(dimension)]: dimension };
                },
                {},
            ),
        [data],
    );

    const dimensions: string[] = useMemo(() => {
        return Object.keys(sqlQueryDimensions);
    }, [sqlQueryDimensions]);

    const resultsData: ApiQueryResults = useMemo(
        () => ({
            metricQuery: {
                dimensions: dimensions,
                metrics: [],
                filters: {},
                sorts: [],
                limit: 0,
                tableCalculations: [],
            },
            rows: (data?.rows || []).map((row) =>
                Object.keys(row).reduce((acc, columnName) => {
                    const raw = row[columnName];
                    return {
                        ...acc,
                        [`${SQL_RESULTS_TABLE_NAME}_${columnName}`]: {
                            value: {
                                raw,
                                formatted: `${raw}`,
                            },
                        },
                    };
                }, {}),
            ),
        }),
        [data?.rows, dimensions],
    );
    const explore: Explore = useMemo(
        () => ({
            name: SQL_RESULTS_TABLE_NAME,
            label: '',
            tags: [],
            baseTable: SQL_RESULTS_TABLE_NAME,
            joinedTables: [],
            tables: {
                [SQL_RESULTS_TABLE_NAME]: {
                    name: SQL_RESULTS_TABLE_NAME,
                    label: '',
                    database: '',
                    schema: '',
                    sqlTable: '',
                    dimensions: sqlQueryDimensions,
                    metrics: {},
                    lineageGraph: {},
                },
            },
            targetDatabase: SupportedDbtAdapter.POSTGRES,
        }),
        [sqlQueryDimensions],
    );

    const [chartType, setChartType] = useState<ChartType>(ChartType.CARTESIAN);

    return {
        explore,
        resultsData,
        chartType,
        columnOrder: dimensions,
        setChartType,
    };
};

export default useSqlQueryVisualization;