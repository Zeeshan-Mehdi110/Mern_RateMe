require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const userRoutes = require('./controllers/users')
const departmentRoutes = require('./controllers/departments')
const employeesRoutes = require('./controllers/employees')


const app = express()
app.use(cors())
app.use(`/content`, express.static(`content/`))
app.use(express.static(__dirname + `/client/build`))
app.use(express.json())
app.use('/api/users', userRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/employees', employeesRoutes)
mongoose
  .connect(process.env.MONGODB_CONNECTION_URL)
  .then(() => {
    console.log('database connected successfully!!')
  })
  .catch((error) => {
    console.log(error)
  })

app.all("*", (req, res) => {
  res.sendFile(__dirname + `/client/build/index.html`)
})

app.use((err, req, res, next) => {
  if (err) res.status(400).json({ error: err.message })
  else next()
})
app.listen(process.env.PORT || 5000, () => console.log(`server is listening at port 5000  `))
