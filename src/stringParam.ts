function replaces_string(query:String, array_data:Array<String>) {

    let text_data = query

    if (String(text_data).includes("%r")) {

        let params = ""
        for (let index = 0; index < array_data.length; index++) {
            params += String(array_data[index]).includes("null") == true ? "%s," : "'%s',"
        }
        params = params.substring(0, params.length - 1)
        text_data = String(text_data).replace("%r", params)

    }

    array_data.forEach((value:any, index:any, array:any) => {

        text_data = text_data.replace("%s", array[index])

    });

    return text_data
}

export{replaces_string}