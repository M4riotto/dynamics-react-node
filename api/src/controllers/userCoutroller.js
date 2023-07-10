import userModel from '../models/userModel.js'
import zodErrorFormat from '../helper/zodErrorFormat.js'

export const listAllUsers = (req, res) => {
  userModel.listAllUsers((error, result) => {
    if (error)
      res.status(500).json({ message: "Erro no Banco de Dados" })
    if (result) {
      if (result.length) {
        res.json(result)
      } else {
        res.json({ message: "Nenhum usuário cadastrado!" })
      }
    }

  })
}

export const showId = (req, res) => {
  const id = req.params.id

  if (!id || isNaN(id)) {
    res.status(400).json({
      message: 'Dados inválidos',
      fields: {
        id: { messages: ['ID deve ser um número inteiro.'] }
      }
    })
    return
  }

  userModel.showId(id, (error, result) => {
    if (error)
      res.status(500).json({ message: "Erro no Banco de Dados" })
    if (result) {
      if (result.length) {
        res.json(result[0])
      } else {
        res.status(404).json({ message: `User ${id} não encontrado!` })
      }
    }
  })
}



export const createUser = async (req, res) => {
  const user = req.body
  console.log(user)

  const validUser = userModel.validateUserToCreate(user)

  if (validUser?.error) {
    res.status(400).json({
      message: 'Dados inválidos',
      fields: zodErrorFormat(validUser.error)
    })
    return
  }

  try {
    const findUser = await userModel.findUserByEmail(user)
    console.log(findUser)
    if (findUser) {
      console.log('já existe')
      res.json({
        message: "Usuário não Cadastrado!",
      })
      return
    }
  } catch (error) {
    console.log(error)
  }

  console.log('passou de mais')

  const userValidated = validUser.data

  userModel.createUser(userValidated, (error, result) => {
    if (error)
      res.status(500).json({ message: "Erro no Banco de Dados" })
    if (result) {
      delete user.password
      res.json({
        message: "Usuário Cadastrado!",
        user: {
          id: result.insertId,
          ...user
        }
      })
    }
  })
}


export const deleteUser = (req, res) => {
  const { id } = req.body
  const idUserLogged = req.idUserLogged
  const rolesUserLogged = req.rolesUserLogged
  if (!id || isNaN(id)) {
    res.status(400).json({
      message: 'Dados inválidos',
      fields: {
        id: { messages: ['ID deve ser um número inteiro.'] }
      }
    })
    return
  }

  //verifica se o usuário é um admin ou se o id do user da sessão é igual ao do user para deletar
  if (!rolesUserLogged.includes('admin')) {
    if (idUserLogged !== id) {
      res.status(401).json({ message: `Usuário não autorizado!` })
      return
    }
  }

  userModel.deleteUser(id, (error, result) => {
    if (error)
      res.status(500).json({ message: "Erro no Banco de Dados" })
    if (result) {
      if (result.affectedRows) {
        res.json({ message: "Usuario Deletado com sucesso!" })
      } else {
        res.status(404).json({ message: `Usuário ${id} não encontrado!` })
      }
    }
  })
}

export const deleteId = (req, res) => {
  const { id } = req.params
  const idUserLogged = req.idUserLogged
  const rolesUserLogged = req.rolesUserLogged
  if (!id || isNaN(id)) {
    res.status(400).json({
      message: 'Dados inválidos',
      fields: {
        id: { messages: ['ID deve ser um número inteiro.'] }
      }
    })
    return
  }

  //verifica se o usuário é um admin ou se o id do user da sessão é igual ao do user para deletar
  if (!rolesUserLogged.includes('admin')) {
    if (idUserLogged !== id) {
      res.status(401).json({ message: `Usuário não autorizado!` })
      return
    }
  }


  userModel.deleteUser(id, (error, result) => {
    if (error)
      res.status(500).json({ message: "Erro no Banco de Dados" })
    if (result) {
      if (result.affectedRows) {
        res.json({ message: "Usuario Deletado com sucesso!" })
      } else {
        res.status(404).json({ message: `Usuário ${id} não encontrado!` })
      }
    }
  })
}

export const updateUser = (req, res) => {
  const user = req.body
  const validUser = userModel.validateUserToUpdate(user)
  const idUserLogged = req.idUserLogged
  const rolesUserLogged = req.rolesUserLogged
  if (validUser?.error) {
    res.status(400).json({
      message: 'Dados inválidos',
      fields: zodErrorFormat(validUser.error)
    })
    return
  }

  const userValidated = validUser.data

  // verifica se o usuário é um admin ou se o id do user da sessão é igual ao do user para deletar
  if (!rolesUserLogged.includes('admin')) {
    if (idUserLogged !== user.id) {
      res.status(401).json({ message: `Usuário não autorizado!` })
      return
    }
  }

  userModel.updateUser(userValidated, (error, result) => {
    if (error)
      res.status(500).json({ message: "Erro no Banco de Dados" })
    if (result) {
      if (result.affectedRows) {
        res.json({ message: "Usuario Atualizado com sucesso!" })
      } else {
        res.status(404).json({ message: `Usuário ${user.id} não encontrado!` })
      }
    }
  })
}