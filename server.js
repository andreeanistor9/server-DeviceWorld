const express = require('express')
const app = express()
const {Client} = require("pg")
const session = require('express-session')

var client = new Client({user:"andreean", password:"parola", host:"localhost", port:5432, database:"db_electronix"});
protocol="http://";
domainName="localhost:5000";
client.connect((err)=>{
    if(err) throw err;
    console.log("Connected");
});

app.use(session({
    secret:'abcdefg',
    resave: true,
    saveUninitialized: false
}));
app.use("/*", function(req, res, next){
    res.locals.user = req.session.user;
    next();
})
// app.get("/products", (req, res) =>{
//    // if(req.session && req.session.user && req.session.user.role == "admin"){
//         client.query("select * from users", function(err, result) {
//             if(err) throw err
//             console.log(result)
//            res.render("/Pages/Products", {products:result.rows})
//        })
//     // }
//     // else {
//     //     restart.status(403).render(`You don't have access`);
//     // }
// })
app.get("/products",(req, res) =>{
    res.json({"products": ["product1", "product2", "product3", "product5"]})
})

app.listen(5000, () => {console.log("Server started on port 5000")})