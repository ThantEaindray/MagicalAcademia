//=====================================================================================
// Basically Postman Passing data from backend to frontend
//=====================================================================================

//=====================================================================================
// FETCH METHOD***
// This function uses the fetch API to make a request to the server.
//=====================================================================================
function fetchMethod(url, callback, method = "GET", data = null, token = null) {
    console.log("fetchMethod: ", url, method, data, token);

    const headers = {}; // store content type

    if (data) { // check have or not
        headers["Content-Type"] = "application/json";
    }

    if (token) { // check have or not
        headers["Authorization"] = "Bearer " + token;
    }

    let options = { // case-sensitive
        method: method.toUpperCase(),
        headers: headers,
    };

    if (method.toUpperCase() !== "GET" && data !== null) {
        options.body = JSON.stringify(data);
    }

    fetch(url, options)
        // chain : do this after that
        .then((response) => {
            if (response.status == 204) {
                callback(response.status, {});
            } else {
                response.json().then((responseData) => callback(response.status, responseData));
            }
        })
        // if error, do this
        .catch((error) => console.error(`Error from ${method} ${url}:`, error));
}

// JQUERY METHOD OR AXIOS METHOD NEED TO PUT SCRIPT IN INDEX.HTML

//=====================================================================================
// JQUERY METHOD
// This function uses the jQuery ajax method to make a request to the server.
//=====================================================================================


//=====================================================================================
// AXIOS METHOD
// This function uses the axios method to make a request to the server.
//=====================================================================================
