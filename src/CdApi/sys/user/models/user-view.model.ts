import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity(
    {
        expression: `
        SELECT 'post'.'id' AS 'id', 'post'.'name' AS 'name', 'category'.'name' AS 'categoryName'
        FROM 'post' 'post'
        LEFT JOIN 'category' 'category' ON 'post'.'categoryId' = 'category'.'id'
    `
    })
export class UserViewModel {

    @ViewColumn()
    id: number;

    @ViewColumn()
    name: string;

    @ViewColumn()
    categoryName: string;

}