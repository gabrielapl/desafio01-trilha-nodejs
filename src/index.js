const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} =request.headers;
  const user = users.find((user)=> user.username === username)
  if(!user){
    return response.status(404).json({ error: "user not found " })
  }
 
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const {name,username} = request.body;
  
  const UserAlreadyExists = users.some((users)=> users.username === username)

  if(UserAlreadyExists){
    return response.status(400).json({ error:"User already exists" })
  }

  const user ={
    id:uuidv4(),
    name,
    username,
    todos:[]
  }

  users.push(user)
  
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
 
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title,deadline} = request.body;
  const todos = {
    id:uuidv4(),
    title,
    done:false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todos)
  return response.status(201).json(todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const{title,deadline} = request.body;
  const {id} = request.params;


  const findId = user.todos.find((user)=> user.id === id);
  if(!findId){
    return response.status(404).json({ error: "todo not found" })
  }
  findId.title = title;
  findId.deadline = new Date(deadline);
  return response.json(findId);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const findId = user.todos.find((user)=> user.id === id);
  if(!findId){
    return response.status(404).json({error:"todo not found"})
  }
  findId.done = true;
  return response.json(findId); 
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const findId = user.todos.findIndex(user=> user.id === id);
  
  if(findId === -1){
    return response.status(404).json({ error: "todo not found "})
  }
  user.todos.splice(findId, 1);
  return response.status(204).json();
});

module.exports = app;