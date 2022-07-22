
function thisLine(e) {
    const regex = /\((.*):(\d+):(\d+)\)$/
    const match = regex.exec(e.stack.split("\n")[2]);
    if (match) {
      const last_index =  match[1].lastIndexOf("/")
      return {
        filepath: match[1].slice(last_index + 1),
        line: match[2],
        column: match[3]
      };
    }
    return {
      filepath: '',
      line: '',
      column: ''
    };
  }


['log', 'info', 'warn', 'error'].forEach((methodName) => {
    console[methodName] = ((originalMethod) => {
        return function (...params) {
            let date = new Date;
            let e = new Error();
            let place = thisLine(e);
            let timestamp = (new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)).toISOString().slice(11, -1);
            return originalMethod.apply(console, [`[${timestamp}]-[${place.filepath}:${place.line}:${place.column}]`].concat(params));
        };
    })(console[methodName]);
});