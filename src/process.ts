import path, { resolve } from 'path'
import readXlsxFile from 'read-excel-file/node'
import fs from 'fs'
import { replaces_string } from './stringParam'
import { db, getNextId } from './sqlite'
const xlsx = require("excel4node")

function validateIfFile(route: string, files: String[]) {

    let _tmp: Array<{}> = [];

    files.forEach((value, index) => {

        if (value != undefined) {
            let type = path.extname(route + value.toString())
            let typEx=0
            if(type==""){
                typEx=2
            }else if(type==".xlsx" || type==".xlsm"){
                typEx=1
            }
            _tmp.push({
                'name': value,
                'type':typEx
            })
        }

    })

    return _tmp;
}

async function getFilesRoute(route: string) {
    let files: String[]
    files = await fs.promises.readdir(route);
    return files;
}


async function ReadCreatePDF(route: string) {
    let ArrayPath: Array<{}> = [];
    let PathDir: String[];

    PathDir = await getFilesRoute(route);
    ArrayPath = validateIfFile(route, PathDir)
    let headerExcel: any = []

    for (let indexPath = 0; indexPath < ArrayPath.length; indexPath++) {

        let array:any=ArrayPath
       
        let type: number = array[indexPath].type
        let name: String = array[indexPath].name
        let newSubDir: String[];

        switch (type) {
            case 2:
                newSubDir = await fs.promises.readdir(route + "/" + name)

                if(newSubDir.length>0){

                    newSubDir.forEach(async(value: any, index: any, array: any) => {

                        await readXlsxFile(fs.createReadStream(route + "/" + name + "/" + value)).then((rows) => {
                            rows.forEach((value, index, array: any) => {
                                let data: String[] = array[index]
    
                                if (index > 0) {
                                    returnQuery(data, index, indexPath, route + "/" + name + "/" + value)
                                } else {
                                    if (headerExcel.length == 0) {
                                        createHeader(data, headerExcel)
                                        headerExcel = data
                                    }
                                }
                            })
                        })
                    })
                }
                
                break;

            case 1:
                readXlsxFile(fs.createReadStream(route + "/" + name)).then((rows) => {
                    rows.forEach((value, index, array: any) => {
                        let data: String[] = array[index]
                        if (index > 0) {
                            returnQuery(data, index, indexPath, "")
                        } else {
                            if (headerExcel.length == 0) {
                                createHeader(data, headerExcel)
                                headerExcel = data
                            }

                        }
                    })
                })
                break;
        }
        
    }


}

async function getIdCols() {
    return new Promise((resolve: any, reject: any) => {
        db.all("select max(id) as id from name_cols", (err: any, row: any) => {

            if (err) {
                throw err;
            }

            resolve(row[0].id)

        });
    })
}

async function returnQuery(data: any, index: number, indexPath: number, file:string) {

    return new Promise(async (resolve, reject) => {
        let totalCols = data.length
        let idCols = await getIdCols()

        let query = "INSERT INTO data_excel(id,";

        for (let index = 0; index < totalCols; index++) {
            query += "col" + index + ","
        }
        query += "col_delete,pos,name_cols) VALUES (%s,"

        for (let index = 0; index < totalCols; index++) {
            query += '"%s",'
        }
        query += "%s,%s,%s)"

        let colsSql: any = ['(select count(id)+1 as next from data_excel)']

        for (let index = 0; index < data.length; index++) {
            if(index==1){
                let newdate=new Date(data[index])
                let dateString=(newdate.getMonth() +1) + "/" + newdate.getUTCDate() + "/" + newdate.getFullYear()
          
                colsSql.push(dateString)
            }else{
                colsSql.push(data[index])
            }
            
        }

        let posexcel = indexPath + 1
        colsSql.push(0, posexcel, idCols)

        let insertQuery = replaces_string(query, colsSql)
        await db.run(insertQuery,function(error:any){
            if(error){
                console.log(insertQuery + " => " + file)
            }
        })
        
        resolve(true)
    })

}

function createHeader(data: any, header: any) {

    return new Promise(async (resolve, reject) => {

        if (header.length == 0) {



            let cols: any = ['(select count(id)+1 as next from name_cols)']
            let query: String = "insert into name_cols(id,"

            for (let index = 0; index < data.length; index++) {
                query += "col" + index + ","
                cols.push(data[index])
            }
            query = query.substring(0, query.length - 1)
            query += ") values(%s,"

            for (let index = 0; index < data.length; index++) {
                query += '"%s",'
            }

            query = query.substring(0, query.length - 1)
            query += ")"

            let runSql = replaces_string(query, cols)

            await db.run(runSql)

            resolve(header)
        } else {
            reject(header)
        }

    })

}

async function createNewExcel() {
    // Create a new instance of a Workbook class

    db.all("SELECT * FROM name_cols where (SELECT pos FROM data_excel where pos>0)", async (err: any, row: any) => {
        if (err) {
            throw err;
        }
        let colsExcel: String[] = []

        row.forEach((value: any, index: any) => {
            let lap=0
            for (var col in value) {   
                if (lap>0 && col != null) {
                    colsExcel.push(value[col])
                }
                lap++
            }
        });

        await db.all("SELECT * FROM data_excel where pos>0 order by pos, col0 desc", async (err: any, row: Array<[]>) => {

            if (err) {
                throw err;
            }

            let startcell = 2


            var wb = new xlsx.Workbook();
            var ws = wb.addWorksheet('Orders');
            colsExcel.forEach((value, index, array) => {
                ws.cell(1, index + 1).string(value)
            })
            ws.cell(1, )

            
            row.forEach((element: any) => {

                let colStart = 0
                for (var colsData in element) {
                    if (colsData != "id" && element[colsData] != null && !String(colsData).includes('col_delete') 
                    && !String(colsData).includes('pos')  && !String(colsData).includes('name_cols') ) {
                        
            
                        if(colStart==2){
                            ws.cell(startcell, colStart).date(String(element[colsData]))
                        }else{
                            let stringdata=element[colsData].toString().includes('null') ? "" : element[colsData]
                            ws.cell(startcell, colStart).string(String(stringdata))
                        }                       

                    }
                    colStart++
                }

                startcell++
            });

            let date=Math.floor(Date.now() / 1000)
            let routeExcel=path.join(__dirname + "/../excels/"+'Excel_'+date+".xlsx")
            wb.write(routeExcel);

            let reset: String = "update data_excel set pos=0"
            db.run(reset)
        });

    })



}

export {
    validateIfFile,
    getFilesRoute,
    ReadCreatePDF,
    createNewExcel
}