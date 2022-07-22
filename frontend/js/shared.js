let post = function (url, data) {
    return fetch(url, { method: "POST", headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', "CSRF-Token": Cookies.get("XSRF-TOKEN") }, body: JSON.stringify(data) });
}

let post_form_data = function (url, data) {
    return fetch(url, { method: "POST", headers: { "CSRF-Token": Cookies.get("XSRF-TOKEN") }, body: data });
}

let put = function (url, data) {
    return fetch(url, { method: "PUT", headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', "CSRF-Token": Cookies.get("XSRF-TOKEN") }, body: JSON.stringify(data) });
}

let del = function (url, data) {
    return fetch(url, { method: "DELETE", headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', "CSRF-Token": Cookies.get("XSRF-TOKEN") }, body: JSON.stringify(data) });
}

let get = function (url) {
    return fetch(url, { method: "GET", headers: {"CSRF-Token": Cookies.get("XSRF-TOKEN") } });
}