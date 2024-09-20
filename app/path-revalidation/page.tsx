/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function getTodos() {
  const res = await fetch("http://localhost:3000/api/todos", {
    next: { revalidate: 10 },
  });
  return res.json();
}

async function addTodo(formData: FormData) {
  "use server";
  const todo = formData.get("todo");
  await fetch("http://localhost:3000/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todo }),
  });
  revalidatePath("/path-revalidation");
}

export default async function TodosPathPage() {
  const todos = await getTodos();

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Todos (Path Revalidation)</h1>
      <form action={addTodo} className="mb-4">
        <input
          type="text"
          name="todo"
          placeholder="Add a new todo"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Todo
        </button>
      </form>
      <ul>
        {todos.map((todo: any) => (
          <li key={todo.id} className="mb-2">
            {todo.text}
          </li>
        ))}
      </ul>
      <div>
        <Link href="/tag-revalidation">Go To Tag Revalidation</Link>
      </div>
    </div>
  );
}
