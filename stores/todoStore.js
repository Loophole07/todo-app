import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: []
  }),

  actions: {
    addTodo(title) {
      this.todos.push({
        id: Date.now(),
        title: title,
        completed: false
      })
    }
  }
})
