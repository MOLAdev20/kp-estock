import app from "./app.js"

import env from "./config/env.js"

app.listen(env.PORT || 8080, err => {
    if(err){
        console.log("[⚠️] Server Error : ", err)
        return null
    }
    console.log(`[🚀] Server running on port ${env.PORT || 8080}`)
})