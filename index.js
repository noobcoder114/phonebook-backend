require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))

const persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end(`Phonebook has info for ${persons.length} people\n${new Date()}`)
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response) => {
    const { name, number } = request.body
    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                return response.status(400).end()
            }

            person.name = name
            person.number = number
            
            person.save().then((updatedPerson) => {
                response.json(updatedPerson)
            })
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    const name = body.name
    const number = body.number
    const names = persons.map(person => person.name)
    if (!name && !number) {
        return response.status(404).json({
            error: 'name and number missing'
        })
    }
    else if (!name) {
        return response.status(404).json({
            error: 'name missing'
        })
    }
    else if (!number) {
        return response.status(404).json({
            error: 'number missing'
        })
    }
    else if (names.includes(name)) {
        return response.status(404).json({
            error: 'name must be unique'
        })
    }

    const person = new Person({
        name: name,
        number: number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))

    morgan.token('info', (req, res) => {
        return JSON.stringify(req.body)
    })
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use('api/persons', morgan(':info'))
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})