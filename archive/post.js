function imageUploaded() {
    var file = document.querySelector(
        'input[type=file]')['files'][0];

    var reader = new FileReader();
    console.log("next");

    reader.onload = function () {
        base64String = reader.result.replace("data:", "")
            .replace(/^.+,/, "");

        var data = { "file": base64String };
        var res;

        fetch("https://dentifai-dxn-66j2fip22a-uk.a.run.app", {
            method: "POST",
            mode: "no-cors",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            console.log("Request complete! response:", res);
        });
        console.log(res);
        var html = `<img src="data:image/png;base64, ${res}">`;
        var container = document.querySelector('.display_result');
        container.innerHTML = html;

    }
    reader.readAsDataURL(file);
}



/*
function imageUploaded() {
    var file = document.querySelector(
        'input[type=file]')['files'][0];
    var reader = new FileReader();

    reader.onload = function () {
        base64String = reader.result.replace("data:", "")
            .replace(/^.+,/, "");

        let data = { file: base64String };

        fetch("https://dentifai-dxn-66j2fip22a-uk.a.run.app/", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            console.log("Request complete! response:", res);
        });
    };
};
*/


/*
function imageUploaded() {
var file = document.querySelector(
    'input[type=file]')['files'][0];
 
var reader = new FileReader();
console.log("next");
  
reader.onload = function () {
    base64String = reader.result.replace("data:", "")
        .replace(/^.+,/, "");

    var formData = new FormData();
    formData.append("file", base64String);
    var xhr = new XMLHttpRequest();  
    xhr.open("POST", "https://dentifai-dxn-66j2fip22a-uk.a.run.app/");  
    xhr.send(formData);
    console.log(xhr.response.status);
    var responseData = xhr.responseText;
    console.log(responseData);
    var html = `<img src="data:image/png;base64, ${responseData}">`;
    var container = document.querySelector('.display_result');
    container.innerHTML = html;
    
}
reader.readAsDataURL(file);
}

*/



/*


const fileInput = document.getElementById("pictureInput");

// This is for storing the base64 strings
let myFiles = {};
// if you expect files by default, make this disabled
// we will wait until the last file being processed
let isFilesReady = true;

fileInput.addEventListener("change", async (event) => {
    // clean up earliest items
    myFiles = {};
    // set state of files to false until each of them is processed
    isFilesReady = false;

    // this is to get the input name attribute, in our case it will yield as "picture"
    // I'm doing this because I want you to use this code dynamically
    // so if you change the input name, the result also going to effect
    const inputKey = fileInput.getAttribute("name");
    var files = event.srcElement.files;

    const filePromises = Object.entries(files).map((item) => {
        return new Promise((resolve, reject) => {
            const [index, file] = item;
            const reader = new FileReader();
            reader.readAsBinaryString(file);

            reader.onload = function (event) {
                // if it's multiple upload field then set the object key as picture[0], picture[1]
                // otherwise just use picture
                const fileKey = `${inputKey}${files.length > 1 ? `[${index}]` : ""
                    }`;
                // Convert Base64 to data URI
                // Assign it to your object
                myFiles[fileKey] = `data:${file.type};base64,${btoa(
                    event.target.result
                )}`;

                resolve();
            };
            reader.onerror = function () {
                console.log("can't read the file");
                reject();
            };
        });
    });

    Promise.all(filePromises)
        .then(() => {
            console.log("ready to submit");
            isFilesReady = true;
        })
        .catch((error) => {
            console.log(error);
            console.log("something wrong happened");
        });
});

const handleForm = async (event) => {
    event.preventDefault();

    if (!isFilesReady) {
        console.log("files still getting processed");
        return;
    }

    Object.entries(myFiles).map((item) => {
        const [key, file] = item;
        // append the file to data object
        data[key] = file;
    });
    //x2
    fetch("https://dentifai-dxn-66j2fip22a-uk.a.run.app", {
        method: "POST",
        body: JSON.stringify(data),
    })
        .then((r) => r.json())
        .then((res) => {
            console.log(res);
        });
};

formElement.addEventListener("submit", handleForm);

async function renderImage() {
    let result = await getresults();
    let html = `<img src="${result.bytedata}">`;
    let container = document.querySelector('.display_result');
    container.innerHTML = html;
}

renderImage();
*/