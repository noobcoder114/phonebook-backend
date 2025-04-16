const express = require('express')
const morgan = require('morgan')
const app = express()

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
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end(`Phonebook has info for ${persons.length} people\n${new Date()}`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.filter(person => person.id !== id)
    response.status(204).end()
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

    const person = {
        name,
        number,
        id: Math.floor(Math.random() * 999999999)
    }

    persons.concat(person)

    response.json(person)

    morgan.token('body', (req, res) => {
        return JSON.stringify(req.body)
    })

    next()
})

app.use(morgan(':body'))

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})