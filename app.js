const { connectSocket } = require("./socket")
const express = require("express");
const path = require("path");
require("dotenv").config();
const config = require("./config")
const PORT = config.port || 5001;
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { connect } = require("./db/connectDB");
const { NotFoundError } = require("./middlewares/apiError");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const { baseUrl } = require("./config")
const http = require("http")
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const  userData  = require("./data/userData");
const Joi = require("joi");
const ObjectId = require('bson').ObjectId;

// const { Server } = require("socket.io")
// const server = http.createServer(app)
// connectSocket(server)
// const io = new Server(server, {
//   port: PORT,
//   cors: {
//     origin: "http://localhost:3000"
//   }
// })
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// ** TODO
// const corsOptions = {
//   origin: 'http://localhost:3001/',
//   credentials: true,
//   optionSuccessStatus: 200
// }
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000");
  next()
});

app.use(bodyParser.json());
app.use(express.static(path.resolve("./assets")));

// connect();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express Library API",
    },
    servers: [
      {
        url: baseUrl,
      },
    ],
  },
  apis: ["./routes/v1/*.js", "./routes/v1/schemas/*.js"],
};

const specs = swaggerJsDoc(options);
app.get("/", (req, res) => {
  console.log("Hello")
  res.send("Hello World")
})
//user API
const data = JSON.parse(JSON.stringify(userData)) 
app.get("/api/users", (req, res) => {
  res.send(data)
})
app.post("/api/users", (req, res) => {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body) && req.body !== null) {

    const customJoi = Joi.extend(joi => ({
      type: 'date',
      base: joi.date(),
      messages: {
        'date.dob': '{{#label}} must be above 18 years'
      },
      rules: {
        above18: {
          validate(value, helpers) {

            var diff_ms = Date.now() - new Date(value).getTime();
            var age_dt = new Date(diff_ms);
            console.log(age_dt)
            const total = Math.abs(age_dt.getUTCFullYear() - 1970);

            if (total > 18) {
              return helpers.error('user age should should be above 18 years', { value });
            }

            return value;
          }
        }
      }
    }));

    const schema = Joi.object({
      name: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      dob: customJoi().format('YYYY-MM-dd').above18().required(),
      phone: Joi.number().length(10).required(),
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
      address: Joi.string().min(10).required(),
      about: Joi.string().min(10).required(),
      tags: Joi.array().items(Joi.string()),
      friends: Joi.array().items(Joi.object({
        name: Joi.string(Joi.ref('name'))
      })),
      gender: Joi.string().valid('male', 'female').required(),
      company: Joi.string()
    })
    var id = new ObjectId();
    console.log(id.toString())
   const {value: {}, error } = schema.validate(re.body);
   if(error){
    res.status(400).jsson(error)
   }else{

   }
    const user = req.body
    res.send(data)
  }
})

// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
// const routes = require('./routes/v1/index');

// app.use("/api/v1", routes);

// app.all("*", (req, res, next) => next(new NotFoundError()));

// app.use(globalErrorHandler);
// ** Socket Messaging **
let messageId = 0
let messages = []
let users = []
// io.on("connection", (socket) => {
//   //register user and update
//   socket.on("registerUser", (user) => {
//     users.push(user)
//     socket.emit("updateUsers", { users, user: {...user, socketId: socket.id} })
//   })

//   //get message and update
//   socket.on("message", (message) => {
//     message.id = ++messageId
//     messages.push(message)
//     socket.emit("receiveMessage", message)
//   })

//   socket.on("disconnect", () => {
//     users.forEach((username, index) => {
//       if (username.socketId == socket.id) {
//         users.splice(index, 1);
//         console.log("disconnected:" + username.username);
//       }
//     })
//   })
// })
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});