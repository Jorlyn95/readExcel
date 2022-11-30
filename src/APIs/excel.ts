import {ReadCreatePDF, createNewExcel} from '../process'
import path from 'path'

let route = path.join(__dirname, "/../../public");

function createReadExcel(server:any,){

    server.post('/api/read_docs', async (request:any, reply:any) => {
        
        await ReadCreatePDF(route);
        return {"Status":"completed"}        

      })

      server.post('/api/create_excel', async (request:any, reply:any) => {
        
        await createNewExcel();
        return {"Status":"completed", "route":""}        

      })

}

export {createReadExcel}