exports.apiResponse = (res, status, message, code, data) => {
    const resModel = {
      meta: {
        Status: status ? status : false,
        Message: message ? message : "",
        code: code ? code : 200,
      },
      Data: data ? data : {}
    };
    res.status(code).json(resModel);
  };
  