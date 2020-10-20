const express = require('express')
const app = express()
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const { Restaurant, sequelize } = require('./models')
const seed = require('./models/seed')

const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.use(express.static('public'))
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')

// ------ Routes -----

app.get('/', (request, response) => {
    response.render('home')
})

app.get('/restaurants', async (request, response) => {
    const restaurants = await Restaurant.findAll({
        include: 'menus'
    })
    response.render('restaurants', {restaurants})
})

// ----- Run Server ------ 

app.listen(3000, async () => {
    await sequelize.sync()
    const restaurants = await Restaurant.findAll()
    if(restaurants.length === 0){
        seed()
    }
    console.log('web server running on port 3000')
})