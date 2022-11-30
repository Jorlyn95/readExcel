const main = require("../src/main")
import path from 'path'

describe("test path", () => {

    let route:String;
    let ArrayPath:Array<{}>=[];
    let PathDir:String[];

    beforeEach(() => {
        route = path.join(__dirname, "/routeTest/")
    })

    it("Get route and files", async() => {
        let PathDir:String[]=['routeTest2','test1.xlsx']
        await expect(main.getFilesRoute(route)).resolves.toEqual(PathDir)
    })

    it("Get json type", () => {
        PathDir=main.getFilesRoute(route)
        expect(main.validateIfFile(route, ArrayPath)).toBeInstanceOf(Array)
    })

})