import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const todosPath = path.join(process.cwd(), "todos.json");

async function getTodos() {
  try {
    const data = await fs.readFile(todosPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveTodos(todos: any) {
  await fs.writeFile(todosPath, JSON.stringify(todos, null, 2));
}

export async function GET() {
  const todos = await getTodos();
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const { todo } = await request.json();
  const todos = await getTodos();
  const newTodo = { id: Date.now(), text: todo };
  todos.push(newTodo);
  await saveTodos(todos);
  return NextResponse.json(newTodo);
}
