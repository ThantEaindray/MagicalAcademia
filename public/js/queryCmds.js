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

    // if token not passed in, try to take from localStorage automatically
    // I keep forgetting to pass token, so this makes my code less messy
    if (!token) {
        token = localStorage.getItem("token");
    }

    // only attach Authorization if token exists
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const options = {
        method: method.toUpperCase(),
        headers: headers,
    };

    if (method.toUpperCase() !== "GET" && data !== null) {
        options.body = JSON.stringify(data);
    }

    fetch(url, options)
        .then((response) => {
            if (response.status == 204) {
                callback(response.status, {});
            } else {
                response.json().then((responseData) => callback(response.status, responseData));
            }
        })
        .catch((error) => console.error(`Error from ${method} ${url}:`, error));
}
