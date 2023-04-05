import fs from "fs"
import axios from "axios";

const submitCip = (cipServerUrl, cipFilePath) => {
  return new Promise((resolve, reject) => {
    const file = fs.readFileSync(cipFilePath, 'utf8')
    axios.post(`${cipServerUrl}/metadata`, JSON.parse(file))
      .then(function (response) {
        resolve(response.data)
      })
      .catch(function (error) {
        reject(`CIP submission failed with error: ${error.response?.data?.message || error.message}`)
      });
  })
}

export { submitCip };