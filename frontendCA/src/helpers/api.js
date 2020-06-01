import axios from 'axios';

var Production = false;
let baseurl = null;
let imageUploadUrl = null;


// if (window.location.hostname == "localhost"){
//     baseurl = "http://localhost:8000/";
//      imageUploadUrl = "http://careeranna.shashwatyadav.com/api/overall/upload_file/";
//     // Production = false
// }else if (window.location.hostname == "careeranna.shashwatyadav.com"){
//     baseurl = "http://careeranna.shashwatyadav.com/api/";
//     imageUploadUrl = "http://careeranna.shashwatyadav.com/api/overall/upload_file/";
// }else{
    baseurl = "https://backend.careeranna.com/testengine/";
    imageUploadUrl = "https://backend.careeranna.com/testengine/overall/upload_file/"
// }






export function api(url, filters) {
    var bodyFormData = new FormData();
    for (const key in filters) {
        let value = filters[key]
        bodyFormData.set(key, value);
    }
    return axios({
        method: 'post',
        baseURL: {
            baseurl
        }.baseurl,
        url: url,
        data: bodyFormData,
        config: {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    }).then(response => response.data)
}

export function imageHandlerApi(formData) {
    return axios({
        method: 'post',
        url: imageUploadUrl,
        data: formData,
        config: {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    }).then(response => {
        return response.data
    })
}
