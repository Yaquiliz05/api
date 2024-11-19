// app.js
import express from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cors from 'cors'

dotenv.config()

const users = [
  {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    fechaNacimiento: '1990-01-01',
    salario: 50000,
    usuario: 'juan',
    passwd: '1234'
  },
  {
    id: 2,
    nombre: 'María',
    apellido: 'González',
    dni: '87654321',
    fechaNacimiento: '1995-05-15',
    salario: 55000,
    usuario: 'maria',
    passwd: '5678'
  }
]

const app = express()

app.use(cors())
app.use(express.json())

// Rutas de autenticación
app.post('/login', (req, res) => {
  const { usuario, passwd } = req.body
  const user = users.find((u) => u.usuario === usuario && u.passwd === passwd)

  if (user) {
    const token = jwt.sign(
      { id: user.id, usuario: user.usuario },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    return res.json({ token })
  }
  return res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
})

app.get('/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' })
    }

    const user = users.find((u) => u.id === decoded.id)
    if (user) {
      const { passwd, ...userWithoutPassword } = user
      return res.json(userWithoutPassword)
    }
    return res.status(404).json({ message: 'Usuario no encontrado' })
  })
})

// Ruta para actualizar datos del usuario
app.put('/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' })
    }

    const index = users.findIndex((u) => u.id === decoded.id)
    if (index !== -1) {
      users[index] = { ...users[index], ...req.body }
      const { passwd, ...updatedUser } = users[index]
      return res.json(updatedUser)
    }
    return res.status(404).json({ message: 'Usuario no encontrado' })
  })
})

app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000')
})
