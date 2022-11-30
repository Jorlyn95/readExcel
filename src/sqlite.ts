const sqlite3 = require('sqlite3').verbose();
import { replaces_string } from './stringParam';
import path from 'path'

let routeDB: String = path.join(__dirname, "/../sqlite/database.db")
const db = new sqlite3.Database(routeDB);

type GetId=(db: any, table: String)=>Promise<string>

db.serialize(() => {

    //create table data excel with 24 columns to data 
    let queryColsExcel: String[]=['id int']

    for (let index = 0; index < 25; index++) {
        queryColsExcel.push('Col'+index + " text")     
    }

    queryColsExcel.push('col_delete int','pos int','name_cols int')
    let valueCols:String="CREATE TABLE IF NOT EXISTS data_excel (%s,"

    for (let index = 0; index < 25; index++) {
        valueCols+="%s,"
    }

    valueCols+='%s,%s,%s)'

    let queryDataTable: String = replaces_string(valueCols, queryColsExcel)

    db.run(queryDataTable);
    //******************************************

    //table to save the name of cols to export to excel
    let colsName:String[]=['id int']
    let valsNames:String="CREATE TABLE IF NOT EXISTS name_cols (%s,"
    let queryTableName:String=""
    for (let index = 0; index < 25; index++) {
        colsName.push('Col'+index)        
    }
    for (let index = 0; index < 25; index++) {
        valsNames+="%s,"
    }
    valsNames=valsNames.substring(0,valsNames.length-1)
    valsNames+=")"
    queryTableName=replaces_string(valsNames,colsName)
    db.run(queryTableName)

    //************************************** */

    let colsFilesGenerate: String[]
    colsFilesGenerate = ['id int', 'docname text', 'date text', 'status int']
    let queryFiles: String = replaces_string("CREATE TABLE IF NOT EXISTS files_excel (%s,%s,%s,%s)", colsFilesGenerate)
    db.run(queryFiles)

    let colsUsers: String[] = ['id int', 'user text', 'password text', 'status int']
    let quertUsers: String = replaces_string("CREATE TABLE IF NOT EXISTS users (%s,%s,%s,%s)", colsUsers)
    db.run(quertUsers)

    let colsLogs: String[] = ['id int', 'log text', 'date text', 'data_delete int']
    let quertLogs: String = replaces_string("CREATE TABLE IF NOT EXISTS logs (%s,%s,%s,%s)", colsLogs)
    db.run(quertLogs)

    /*
    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();


    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        console.log(row.id + ": " + row.info);
    });
    */

    setTimeout(() => {
        createFirstUser(db)
    }, 2000);

});

function createFirstUser(db: any) {

    let validateExist: string = "select * from users where user in ('mdhuella','orleanse')"
    db.all(validateExist, (err: any, row: Array<{}>) => {

        if (err) {
            throw err;
        }

        if (row.length == 0) {
            let createUsers: String = "delete from users; insert into users values('1','mdhuella','mdhuella1618','1'),('2','orleanse','leon2006','1')"
            db.run(createUsers)
        }

    });

    let idConseLogs: String = "select count(id)+1 as next from logs"
    db.all(idConseLogs, (err: any, row: any) => {
        if (err) {
            throw err;
        }

        let colsLogs: String[] = [
            row[0].next,
            'Start System',
            new Date(),
            0
        ]
        let queryStartLogs: String = replaces_string("insert into logs values('%s','%s','%s',%s)", colsLogs)
        db.run(queryStartLogs)
    })

}


const getNextId:GetId=async(db, table) =>{
    return new Promise(async(resolve, reject) => {

        try {
            let sqlCount: String = replaces_string("select count(id) as next from %s", [table])
            //console.log(sqlCount)
            await db.all(sqlCount, async(err: any, row: any) => {
                if (err) {
                    throw err;
                }
                resolve(row[0].next)
            })
        } catch (error) {
            reject(error)
        }

    })
}

export { db, getNextId }