import { faker } from "@faker-js/faker";
import { ColumnSort, SortingState } from "@tanstack/react-table";

export type Person = {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    visits: number;
    progress: number;
    status: "relationship" | "complicated" | "single";
    createdAt: Date;
};

export type Response<TData> = {
    data: TData[];
    meta: {
        totalRowCount: number;
    };
};

const range = (len: number) => {
    const arr = [];
    for (let i = 0; i < len; i++) {
        arr.push(i);
    }
    return arr;
};

const newPerson = <TData>(index: number): TData => {
    return {
        id: index + 1,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        age: faker.datatype.number(40),
        visits: faker.datatype.number(1000),
        progress: faker.datatype.number(100),
        createdAt: faker.datatype.datetime({ max: new Date().getTime() }),
        status: faker.helpers.shuffle<Person["status"]>([
            "relationship",
            "complicated",
            "single",
        ])[0]!,
    } as TData;
};

export function makeData<TData>(...lens: number[]) {
    const makeDataLevel = (depth = 0): TData[] => {
        const len = lens[depth]!;
        return range(len).map((d): TData => {
            return {
                ...newPerson<TData>(d),
            };
        });
    };
    return makeDataLevel();
}

// const data = makeData<Person>(100000);

//simulates a backend api
export const fetchData = <TData>(
    data: TData[],
    start: number,
    size: number,
    sorting: SortingState
): { data: TData[]; meta: { totalRowCount: number } } => {
    const dbData = [...data];
    if (sorting.length) {
        const sort = sorting[0] as ColumnSort;
        const { id, desc } = sort as { id: keyof TData; desc: boolean };
        dbData.sort((a, b) => {
            if (desc) {
                return a[id] < b[id] ? 1 : -1;
            }
            return a[id] > b[id] ? 1 : -1;
        });
    }

    return {
        data: dbData.slice(start, start + size),
        meta: {
            totalRowCount: dbData.length,
        },
    };
};
