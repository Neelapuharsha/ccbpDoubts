const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
var format = require("date-fns/format");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000");
    });
  } catch (e) {
    console.log(`error : ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const checkStatusAndPriority = (reqQuery) => {
  return reqQuery.status !== undefined && reqQuery.priority !== undefined;
};

const checkCatAndStatus = (reqQuery) => {
  return reqQuery.category !== undefined && reqQuery.status !== undefined;
};

const checkCatAndPriority = (reqQuery) => {
  return reqQuery.category !== undefined && reqQuery.priority !== undefined;
};

const checkStatus = (reqQuery) => {
  return reqQuery.status !== undefined; //status is defined
};

const checkPriority = (reqQuery) => {
  return reqQuery.priority !== undefined;
};

const checkCat = (reqQuery) => {
  return reqQuery.category !== undefined; //status is defined
};

const priorityCheck = (priority) => {
  if (priority != "HIGH" && priority != "LOW" && priority != "MEDIUM") {
    return true;
  }
};

const categoryCheck = (category) => {
  if (category != "WORK" && category != "HOME" && category != "LEARNING") {
    return true;
  }
};
const statusCheck = (status) => {
  if (status != "DONE" && status != "IN PROGRESS" && status != "TO DO") {
    return true;
  }
};
const dateCheck = (date) => {
  const result = format(new Date(date), "yyyy-MM-dd");
  if (date != result) {
    return true;
  }
};

app.get("/agenda/", async (request, response) => {
  const { search_q = "", date } = request.query;
  const result = format(new Date(date), "yyyy-MM-dd");
  getTodoItemsQuery = `
          Select * from todo 
          where
            todo like ('%${search_q}%') and due_date='${result}'`;
  const data = await db.all(getTodoItemsQuery);
  response.send(data);
});

app.post("/todos", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  if (priorityCheck(priority)) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (statusCheck(status)) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (categoryCheck(category)) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (dateCheck(dueDate)) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const postingDataQuery = `
    insert into todo(id,todo,priority, status, category, due_date)
    values ('${id}','${todo}','${priority}','${status}','${category}','${dueDate}')`;
    const createTodo = db.run(postingDataQuery);
    response.send("Todo Successfully Added");
  }
});

//api 1
app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority, category } = request.query;
  let data = null;
  let getTodoItemsQuery = "";
  switch (true) {
    case checkStatusAndPriority(request.query):
      getTodoItemsQuery = `
          Select * from todo 
          where
         
            status = '${status}'
            and priority = '${priority}'`;
      data = await db.all(getTodoItemsQuery);
      response.send(data);
      break;

    case checkCatAndStatus(request.query):
      getTodoItemsQuery = `
          Select * from todo 
          where
           
            status = '${status}'
            and category = '${category}'`;
      data = await db.all(getTodoItemsQuery);
      response.send(data);
      break;

    case checkCatAndPriority(request.query):
      getTodoItemsQuery = `
          Select * from todo 
          where
           
            priority = '${priority}'
            and category = '${category}'`;
      data = await db.all(getTodoItemsQuery);
      response.send(data);
      break;

    case checkPriority(request.query):
      getTodoItemsQuery = `
          Select * from todo 
          where
             priority = '${priority}'`;
      data = await db.all(getTodoItemsQuery);
      response.send(data);
      break;

    case checkStatus(request.query):
      getTodoItemsQuery = `
          Select * from todo 
          where

            status = '${status}'`;
      data = await db.all(getTodoItemsQuery);
      response.send(data);
      break;

    case checkCat(request.query):
      getTodoItemsQuery = `
          Select * from todo 
          where
            category = '${category}'`;
      data = await db.all(getTodoItemsQuery);
      response.send(data);
      break;

    default:
      getTodoItemsQuery = `
          Select * from todo 
          where
            todo like ('%${search_q}%')`;
      data = await db.all(getTodoItemsQuery);
      response.send(data);
      break;
  }
});

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { date } = request.query;
  const getTodoItemQuery = `
    select * from todo 
    where id = '${todoId}'`;
  const sendResponse = await db.get(getTodoItemQuery);
  response.send(sendResponse);
});

app.put("/todos/:todoId", async (request, response) => {
  const { status, priority, todo, category, dueDate } = request.body;
  const { todoId } = request.params;
  let result = null;
  let alterQuery = "";
  if (request.body.status !== undefined) {
    alterQuery = `update todo 
    set status='${status}' where id= '${todoId}'`;
    result = await db.run(alterQuery);
    response.send("Status Updated");
  }
  if (request.body.priority !== undefined) {
    alterQuery = `update todo 
    set priority='${priority}' where id= '${todoId}'`;
    result = await db.run(alterQuery);
    response.send("Priority Updated");
  }
  if (request.body.todo !== undefined) {
    alterQuery = `update todo 
    set todo='${todo}' where id= '${todoId}'`;
    result = await db.run(alterQuery);
    response.send("Todo Updated");
  }
  if (request.body.category !== undefined) {
    alterQuery = `update todo 
    set category='${category}' where id= '${todoId}'`;
    result = await db.run(alterQuery);
    response.send("Category Updated");
  }
  if (request.body.dueDate !== undefined) {
    alterQuery = `update todo 
    set due_date='${dueDate}' where id= '${todoId}'`;
    result = await db.run(alterQuery);
    response.send("Due Date Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
