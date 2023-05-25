const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dpPath = path.join(__dirname, "./todoApplication.db");

let db = null;

const initilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dpPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};

const hasStatusAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  let todosArr = null;
  let getTodos = "";
  const { search_q = "", status, priority } = request.query;

  switch (true) {
    case hasStatusAndPriorityProperties(request.query):
      getTodos = `
            SELECT
                * 
            FROM
             todo
            WHERE
             todo LIKE '%${search_q}%'
             AND status = '${status}'
             AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodos = `
            SELECT
                * 
            FROM
             todo
            WHERE
             todo LIKE '%${search_q}%'
             AND status = '${status}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodos = `
            SELECT
                * 
            FROM
             todo
            WHERE
             todo LIKE '%${search_q}%'
             AND priority = '${priority}';`;
      break;
    default:
      getTodos = `
            SELECT
                * 
            FROM
             todo
            WHERE
             todo LIKE '%${search_q}%';`;
  }

  todosArr = await db.all(getTodos);
  response.send(todosArr);
});

app.get("/todos/:id/", async (request, response) => {
  const { id } = request.params;
  const getTodos = `
    SELECT
      *
    FROM
     todo
    WHERE
      id = ${id};
    `;
  const todosArr = await db.get(getTodos);
  response.send(todosArr);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
        INSERT INTO
            todo (id,todo,priority,status)
        VALUES
            (${id},'${todo}','${priority}','${status}');
    `;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:id/", async (request, response) => {
  const { id } = request.params;
  const { todo, priority, status } = request.body;
  let updateQuery = "";
  let message = "";

  switch (true) {
    case hasStatusAndPriorityProperties(request.body) &&
      request.body.todo !== undefined:
      updateQuery = `
                UPDATE
                todo
                SET
                todo ='${todo}',
                priority = '${priority}',
                status = '${status}'
                WHERE
                id = '${id}';
                `;
      message = "Todo,Priority and Status Updated.";
      break;
    case hasStatusProperty(request.body) && request.body.todo !== undefined:
      updateQuery = `
                UPDATE
                todo
                SET
                todo ='${todo}',
                status = '${status}'
                WHERE
                id = '${id}';
                `;
      message = "Todo and Status Updated.";
      break;
    case hasPriorityProperty(request.body) && request.body.todo !== undefined:
      updateQuery = `
                UPDATE
                todo
                SET
                todo ='${todo}',
                priority = '${priority}'
                WHERE
                id = '${id}';
                `;
      message = "Todo and Priority Updated.";
      break;
    case hasStatusAndPriorityProperties(request.body):
      updateQuery = `
                UPDATE
                todo
                SET
                priority = '${priority}',
                status = '${status}'
                WHERE
                id = '${id}';
                `;
      message = "Priority and Status Updated.";
      break;
    case hasStatusProperty(request.body):
      updateQuery = `
                UPDATE
                todo
                SET
                status = '${status}'
                WHERE
                id = '${id}';
                `;
      message = "Status Updated";
      break;
    case hasPriorityProperty(request.body):
      updateQuery = `
                UPDATE
                todo
                SET
                priority = '${priority}'
                WHERE
                id = '${id}';
                `;
      message = "Priority Updated";
      break;

    default:
      updateQuery = `
                UPDATE
                todo
                SET
                todo ='${todo}'
                WHERE
                id = '${id}';
                `;
      message = "Todo Updated";
  }

  await db.run(updateQuery);
  response.send(message);
});

app.delete("/todos/:id/", async (request, response) => {
  const { id } = request.params;
  const deleteTodo = `
        DELETE FROM
            todo
        WHERE
            id = '${id}';
    `;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

initilizeDbAndServer();

module.exports = app;
